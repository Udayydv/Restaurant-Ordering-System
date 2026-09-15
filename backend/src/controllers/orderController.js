import mongoose from "mongoose";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import User from "../models/User.js";
import SiteSettings from "../models/SiteSettings.js";
import { getDeliveryQuote, getSipNScoopDeliveryQuote } from "../utils/geo.js";
import { isRestaurantOpenNow, getOperatingHours } from "../utils/hours.js";
import { emitToAdmins, emitToUser } from "../socket.js";
import { evaluateCoupon } from "../services/couponService.js";

const SUPPORTED_PRICE_TYPES = new Set(["regular", "half", "full"]);

const generateOrderNumber = (orderType = "restaurant") => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);

  return `${orderType === "sip-n-scoop" ? "SNS" : "TRP"}-${timestamp}-${random}`;
};

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const checkoutKey = req.get("Idempotency-Key");
    if (checkoutKey && !/^[a-zA-Z0-9-]{16,100}$/.test(checkoutKey)) {
      return res.status(400).json({ success: false, message: "Invalid checkout key" });
    }
    if (checkoutKey) {
      const existing = await Order.findOne({ user: req.user._id, checkoutKey });
      if (existing) return res.status(200).json({ success: true, order: existing });
    }
    const settings = await SiteSettings.findOne();
    if (settings?.maintenanceMode) {
      return res.status(503).json({ success: false, message: "Ordering is temporarily paused for maintenance" });
    }
    const {
      addressId,
      orderMode = "delivery",
      notes = "",
      couponCode = "",
    } = req.body;

    // Server-side enforced operating hours — never trust a client
    // clock for this, since it can be changed/spoofed.
    if (!isRestaurantOpenNow()) {
      const { openTime, closeTime } = getOperatingHours();

      return res.status(403).json({
        success: false,
        message: `We're currently closed. Please order between ${openTime} and ${closeTime}.`,
        restaurantClosed: true,
      });
    }

    if (!["delivery", "pickup"].includes(orderMode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order mode",
      });
    }

    // Payment method always follows order mode — never taken from the
    // client — so it can't be tampered with, same principle as the
    // delivery fee below: dining/picking up in person is paid at the
    // restaurant with no delivery charge; getting it delivered is
    // paid via UPI on delivery with the distance-based fee.
    const paymentMethod =
      orderMode === "pickup" ? "pay_at_restaurant" : "upi_on_delivery";

    let address = null;

    if (orderMode === "delivery") {
      // Address is only required for delivery orders
      if (!addressId) {
        return res.status(400).json({
          success: false,
          message: "Address is required for delivery orders",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(addressId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid address ID",
        });
      }

      address = await Address.findOne({
        _id: addressId,
        user: req.user._id,
      });

      if (!address) {
        return res.status(404).json({
          success: false,
          message: "Address not found",
        });
      }
    }

    // Find user's cart
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty",
      });
    }

    if (req.body.cartVersion !== undefined && req.body.cartVersion !== cart.__v) {
      return res.status(409).json({ success: false, message: "Your cart changed in another checkout. Please try again." });
    }
    const orderItems = [];
    let subtotal = 0;
    let hasSipNScoopItems = false;
    let hasRestaurantItems = false;

    // Validate every cart item
    for (const cartItem of cart.items) {
      const product = await Product.findOne({
        _id: cartItem.product,
        isDeleted: { $ne: true },
      });

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One of the products in your cart no longer exists",
        });
      }

      if (product.section === "sip-n-scoop") {
        hasSipNScoopItems = true;
      } else {
        hasRestaurantItems = true;
      }

      // Check availability
      if (!product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is currently unavailable`,
        });
      }

      const priceType = cartItem.priceType || "regular";

      if (!SUPPORTED_PRICE_TYPES.has(priceType)) {
        return res.status(400).json({
          success: false,
          message: `${product.name} has an outdated price option. Please re-add it to your cart.`,
        });
      }

      // Product schema uses exactly prices.regular / prices.half / prices.full.
      const currentPrice = product.prices?.[priceType];

      if (
        currentPrice === undefined ||
        currentPrice === null
      ) {
        return res.status(400).json({
          success: false,
          message: `${product.name} does not have a ${priceType} price`,
        });
      }

      const quantity = Number(cartItem.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${product.name}`,
        });
      }

      const itemTotal = Number(
        (currentPrice * quantity).toFixed(2)
      );

      subtotal += itemTotal;

      // Store price snapshot in order
      orderItems.push({
        product: product._id,
        name: product.name,
        price: currentPrice,
        priceType,
        section: product.section === "sip-n-scoop" ? "sip-n-scoop" : "restaurant",
        quantity,
        itemTotal,
      });
    }

    subtotal = Number(subtotal.toFixed(2));

    if (hasSipNScoopItems && hasRestaurantItems) {
      return res.status(400).json({
        success: false,
        message: "Please order Sip n Scoop and restaurant food separately so quick-delivery timing stays accurate",
      });
    }

    // Sip n Scoop is a delivery-only quick-commerce section. Any cart that
    // contains one of these products must use delivery and must be within 3 km.
    if (hasSipNScoopItems && orderMode !== "delivery") {
      return res.status(400).json({
        success: false,
        message: "Sip n Scoop items are available for home delivery only",
      });
    }

    // Coupon is validated against the server-calculated subtotal and the
    // user's real order history. Never trust a browser-calculated discount.
    let appliedCouponCode = "";
    let discountAmount = 0;

    if (String(couponCode || "").trim()) {
      const coupon = await evaluateCoupon({
        userId: req.user._id,
        code: couponCode,
        subtotal,
      });

      if (!coupon.valid) {
        return res.status(400).json({
          success: false,
          message: coupon.message,
        });
      }

      appliedCouponCode = coupon.code;
      discountAmount = coupon.discountAmount;
    }

    // Delivery charge is always computed server-side from the saved
    // address coordinates using the distance slabs — never trusted
    // from the client — so it can't be tampered with.
    let deliveryCharge = 0;
    let deliveryDistanceKm = null;

    if (orderMode === "delivery") {
      if (
        address.latitude !== undefined &&
        address.latitude !== null &&
        address.longitude !== undefined &&
        address.longitude !== null
      ) {
        const quote = hasSipNScoopItems
          ? getSipNScoopDeliveryQuote(address.latitude, address.longitude)
          : getDeliveryQuote(address.latitude, address.longitude);

        if (!quote.deliverable) {
          return res.status(400).json({
            success: false,
            message: hasSipNScoopItems
              ? "Sip n Scoop delivery is available only within 3 km of the restaurant"
              : "Sorry, this delivery address is outside our 10 km delivery range",
          });
        }

        deliveryCharge = quote.deliveryFee;
        deliveryDistanceKm = quote.distanceKm;
      } else {
        return res.status(400).json({
          success: false,
          message: "Please use Current Location to verify the delivery range, or choose self pickup",
        });
      }
    }

    const totalAmount = Number(
      (subtotal + deliveryCharge - discountAmount).toFixed(2)
    );

    // Create order
    const order = await Order.create({
      user: req.user._id,
      checkoutKey: checkoutKey || undefined,
      cartSnapshot: String(cart._id) + ":" + cart.__v,
      welcomeRedemptionKey: appliedCouponCode === "WELCOME50" ? req.user._id : undefined,

      items: orderItems,

      orderType: hasSipNScoopItems ? "sip-n-scoop" : "restaurant",
      orderMode,
      deliveryDistanceKm,
      deliveryLocation: orderMode === "delivery" ? { latitude: address.latitude, longitude: address.longitude } : undefined,

      address:
        orderMode === "delivery"
          ? {
              name: address.name,
              phone: address.phone,
              addressLine: address.addressLine,
              landmark: address.landmark,
              city: address.city,
              state: address.state,
              pincode: address.pincode,
            }
          : undefined,

      subtotal,

      deliveryCharge,

      couponCode: appliedCouponCode,

      discountAmount,

      totalAmount,

      paymentMethod,

      notes: String(notes || "").trim().slice(0, 500),

      // UPI-on-delivery is still collected in person, same as COD —
      // there is no online payment gateway wired up. Mark it pending
      // until an admin confirms payment was received.
      paymentStatus: "pending",

      orderStatus: "placed",

      orderNumber: generateOrderNumber(hasSipNScoopItems ? "sip-n-scoop" : "restaurant"),
    });

    // Mark WELCOME50 as consumed for this account after the order has
    // been created successfully. The coupon service also checks order history,
    // so a user cannot redeem it twice even if this marker update is delayed.
    if (appliedCouponCode === "WELCOME50") {
      await User.updateOne(
        { _id: req.user._id, welcome50UsedAt: null },
        { $set: { welcome50UsedAt: new Date() } },
      ).catch((error) => console.error("Coupon marker backfill deferred:", error.message));
    }

    // Clear cart after successful order
    // Do not erase a newer cart or report failure after an order has been committed.
    await Cart.updateOne(
      { _id: cart._id, __v: cart.__v },
      { $set: { items: [] }, $inc: { __v: 1 } },
    ).catch((error) => console.error("Post-order cart cleanup deferred:", error.message));

    // Real-time: instantly notify every connected admin dashboard so
    // the order shows up (and the alert bell rings) without needing
    // to refresh.
    emitToAdmins("orders:new", {
      _id: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      orderMode: order.orderMode,
      orderType: order.orderType,
      orderStatus: order.orderStatus,
      notes: order.notes,
      createdAt: order.createdAt,
      customerName: req.user.name || address?.name || "Customer",
      customerPhone: req.user.phone || address?.phone || "",
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    if (error.code === 11000) {
      const checkoutKey = req.get("Idempotency-Key");
      if (checkoutKey) {
        const existing = await Order.findOne({ user: req.user._id, checkoutKey });
        if (existing) return res.status(200).json({ success: true, order: existing });
      }
      return res.status(409).json({ success: false, message: "This cart or welcome coupon has already been used. Please refresh your orders." });
    }
    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to place order",
    });
  }
};

// GET MY ORDERS
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch orders",
    });
  }
};

// Build a safe lookup for either the MongoDB document id or the public
// TRP order number. This also prevents invalid ObjectId strings from turning
// a normal lookup into an HTTP 500 CastError.
const ownedOrderLookup = (identifier, userId) => {
  const value = String(identifier || "").trim();
  return mongoose.isValidObjectId(value)
    ? { _id: value, user: userId }
    : { orderNumber: value, user: userId };
};

// GET SINGLE ORDER
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne(
      ownedOrderLookup(req.params.id, req.user._id),
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch order",
    });
  }
};

// CANCEL ORDER
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne(
      ownedOrderLookup(req.params.id, req.user._id),
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      !["placed", "confirmed"].includes(order.orderStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: "This order can no longer be cancelled",
      });
    }

    const cancelled = await Order.findOneAndUpdate(
      { _id: order._id, orderStatus: { $in: ["placed", "confirmed"] } },
      { $set: { orderStatus: "cancelled", cancelledAt: new Date() } },
      { returnDocument: "after" },
    );
    if (!cancelled) return res.status(409).json({ success: false, message: "This order can no longer be cancelled" });
    order.orderStatus = cancelled.orderStatus;
    order.cancelledAt = cancelled.cancelledAt;
    emitToAdmins("orders:updated", { _id: order._id, orderStatus: "cancelled" });
    emitToUser(order.user, "order:status-changed", { _id: order._id, orderNumber: order.orderNumber, orderStatus: "cancelled" });

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to cancel order",
    });
  }
};