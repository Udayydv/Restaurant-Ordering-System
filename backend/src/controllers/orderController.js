import mongoose from "mongoose";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";
import { getDeliveryQuote } from "../utils/geo.js";
import { isRestaurantOpenNow, getOperatingHours } from "../utils/hours.js";
import { emitToAdmins } from "../socket.js";

// Fallback used only when an existing address has no stored
// coordinates (e.g. created before geolocation support was added).
const FALLBACK_DELIVERY_CHARGE = 5;

const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);

  return `TRP-${timestamp}-${random}`;
};

// CREATE ORDER
export const createOrder = async (req, res) => {
  try {
    const {
      addressId,
      orderMode = "delivery",
      notes = "",
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

    const orderItems = [];
    let subtotal = 0;

    // Validate every cart item
    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.product);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One of the products in your cart no longer exists",
        });
      }

      // Check availability
      if (!product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is currently unavailable`,
        });
      }

      const priceType = cartItem.priceType || "regular";

      // Product schema uses prices.regular / prices.half / prices.full
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
        quantity,
        itemTotal,
      });
    }

    subtotal = Number(subtotal.toFixed(2));

    // Delivery charge is always computed server-side from the saved
    // address coordinates using the distance slabs — never trusted
    // from the client — so it can't be tampered with.
    let deliveryCharge = 0;

    if (orderMode === "delivery") {
      if (
        address.latitude !== undefined &&
        address.latitude !== null &&
        address.longitude !== undefined &&
        address.longitude !== null
      ) {
        const quote = getDeliveryQuote(address.latitude, address.longitude);

        if (!quote.deliverable) {
          return res.status(400).json({
            success: false,
            message:
              "Sorry, this delivery address is outside our 10 km delivery range",
          });
        }

        deliveryCharge = quote.deliveryFee;
      } else {
        // Address has no coordinates on file (older address / manual
        // entry without location) — fall back to the base fee rather
        // than blocking the order.
        deliveryCharge = FALLBACK_DELIVERY_CHARGE;
      }
    }

    const totalAmount = Number(
      (subtotal + deliveryCharge).toFixed(2)
    );

    // Create order
    const order = await Order.create({
      user: req.user._id,

      items: orderItems,

      orderMode,

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

      totalAmount,

      paymentMethod,

      notes: String(notes || "").trim().slice(0, 500),

      // UPI-on-delivery is still collected in person, same as COD —
      // there is no online payment gateway wired up. Mark it pending
      // until an admin confirms payment was received.
      paymentStatus: "pending",

      orderStatus: "placed",

      orderNumber: generateOrderNumber(),
    });

    // Clear cart after successful order
    cart.items = [];

    await cart.save();

    // Real-time: instantly notify every connected admin dashboard so
    // the order shows up (and the alert bell rings) without needing
    // to refresh.
    emitToAdmins("orders:new", {
      _id: order._id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      orderMode: order.orderMode,
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

// GET SINGLE ORDER
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

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
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

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

    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();

    await order.save();

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