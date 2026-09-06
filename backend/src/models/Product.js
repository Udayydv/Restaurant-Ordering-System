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
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
