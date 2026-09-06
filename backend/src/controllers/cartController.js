import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const SUPPORTED_PRICE_TYPES = new Set(["regular", "half", "full"]);

/*
 * The existing frontend menu (src/data/menu.ts) references dishes by a
 * string slug (e.g. "shahi-paneer"), not a MongoDB ObjectId. Rather than
 * changing the frontend, we resolve either a real ObjectId OR a slug to
 * the same Product document here. This is the fix for the
 * "Unable to add product to cart" bug: previously Product.findById()
 * was called directly with a slug, which threw a CastError.
 */
const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeSlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/*
 * Resolve products defensively. New frontend builds send the real MongoDB
 * ObjectId, while older carts may still contain a static slug. We also
 * accept an explicit slug/name fallback so a stale browser cart can repair
 * itself instead of failing checkout with a production-only 404.
 */
const findProductByIdOrSlug = async (productId, productSlug, productName) => {
  const idValue = String(productId || "").trim();

  if (idValue && mongoose.Types.ObjectId.isValid(idValue)) {
    const byId = await Product.findById(idValue);
    if (byId) return byId;
  }

  const slugCandidates = [...new Set([
    normalizeSlug(productSlug),
    normalizeSlug(idValue),
    normalizeSlug(productName),
  ].filter(Boolean))];

  if (slugCandidates.length) {
    const bySlug = await Product.findOne({ slug: { $in: slugCandidates } });
    if (bySlug) return bySlug;
  }

  if (productName) {
    const byName = await Product.findOne({
      name: { $regex: `^${escapeRegex(String(productName).trim())}$`, $options: "i" },
    });
    if (byName) return byName;
  }

  return null;
};

const getProductPrice = (product, priceType) => {
  const price = product.prices?.[priceType];

  if (price === undefined || price === null) {
    return null;
  }

  return price;
};

// GET CART
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    if (!cart) {
      return res.status(200).json({
        success: true,
        cart: {
          items: [],
          subtotal: 0,
        },
      });
    }

    let subtotal = 0;

    const items = cart.items
      .filter((item) => item.product)
      .flatMap((item) => {
        const priceType = item.priceType || "regular";
        const price = getProductPrice(item.product, priceType);

        // Old carts may still contain removed Quarter/Family tiers after
        // deployment. Ignore those stale entries instead of returning an
        // invalid cart that can break checkout; checkout rebuilds the cart
        // from the customer's current local menu selection.
        if (!SUPPORTED_PRICE_TYPES.has(priceType) || price === null) {
          return [];
        }

        const itemTotal = price * item.quantity;
        subtotal += itemTotal;

        return [{
          product: item.product,
          quantity: item.quantity,
          priceType,
          price,
          itemTotal,
        }];
      });

    res.status(200).json({
      success: true,
      cart: {
        id: cart._id,
        items,
        subtotal,
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch cart",
    });
  }
};

// ADD TO CART
export const addToCart = async (req, res) => {
  try {
    const {
      productId,
      productSlug,
      productName,
      quantity = 1,
      priceType = "regular",
    } = req.body;

    if (!SUPPORTED_PRICE_TYPES.has(priceType)) {
      return res.status(400).json({
        success: false,
        message: "Only Regular, Half and Full price options are supported",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const product = await findProductByIdOrSlug(productId, productSlug, productName);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        requestedProduct: productSlug || productId || productName || null,
      });
    }

    if (!product.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "This product is currently unavailable",
      });
    }

    const price = getProductPrice(product, priceType);

    if (price === null) {
      return res.status(400).json({
        success: false,
        message: `Selected price option '${priceType}' is not available`,
      });
    }

    let cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    // Always store the resolved real ObjectId, never the raw
    // productId the client sent (which may have been a slug).
    const resolvedProductId = product._id.toString();

    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === resolvedProductId &&
        item.priceType === priceType
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        product: resolvedProductId,
        quantity,
        priceType,
      });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );

    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to add product to cart",
    });
  }
};

// UPDATE CART ITEM
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, priceType = "regular" } = req.body;

    if (!SUPPORTED_PRICE_TYPES.has(priceType)) {
      return res.status(400).json({
        success: false,
        message: "Only Regular, Half and Full price options are supported",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const resolvedProduct = await findProductByIdOrSlug(productId);
    const resolvedProductId = resolvedProduct
      ? resolvedProduct._id.toString()
      : productId;

    const item = cart.items.find(
      (item) =>
        item.product.toString() === resolvedProductId &&
        item.priceType === priceType
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    item.quantity = quantity;

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate(
      "items.product"
    );

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Update cart error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update cart",
    });
  }
};

// REMOVE CART ITEM
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { priceType = "regular" } = req.query;

    if (!SUPPORTED_PRICE_TYPES.has(priceType)) {
      return res.status(400).json({
        success: false,
        message: "Only Regular, Half and Full price options are supported",
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const resolvedProduct = await findProductByIdOrSlug(productId);
    const resolvedProductId = resolvedProduct
      ? resolvedProduct._id.toString()
      : productId;

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.product.toString() === resolvedProductId &&
          item.priceType === priceType
        )
    );

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Remove cart item error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to remove item",
    });
  }
};

// CLEAR CART
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id,
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart already empty",
      });
    }

    cart.items = [];

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear cart error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to clear cart",
    });
  }
};