import mongoose from "mongoose";

const priceSchema = new mongoose.Schema(
  {
    regular: {
      type: Number,
      min: 0,
    },
    half: {
      type: Number,
      min: 0,
    },
    full: {
      type: Number,
      min: 0,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    // Stable identifier used by the curated frontend menu and cart API.
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    // Keeps the restaurant menu and the fast-delivery Sip n Scoop catalog
    // separate while still using one product/cart/order system.
    section: {
      type: String,
      enum: ["restaurant", "sip-n-scoop"],
      default: "restaurant",
      index: true,
    },

    // Customer menu supports exactly these pricing modes:
    // Regular (single-price dishes) OR Half / Full.
    // Quarter/Family were removed to keep frontend, cart and orders aligned.
    prices: {
      type: priceSchema,
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isBestseller: {
      type: Boolean,
      default: false,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },

    // Version of a curated seed entry. This lets a deployment perform a
    // one-time catalog migration (for example the Sip n Scoop V9 refresh)
    // without overwriting later edits made by the admin panel on every
    // backend restart.
    seedVersion: {
      type: Number,
      default: 0,
    },

    // Soft delete prevents curated seed products from being silently
    // recreated by the startup menu synchronizer after an admin deletes them.
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
