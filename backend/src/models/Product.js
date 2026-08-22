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
    // Stable, human-readable identifier (e.g. "shahi-paneer").
    // Used so the existing frontend menu — which references items by
    // this kind of string id — can be resolved to a real MongoDB
    // product without needing any changes to the menu UI/components.
    // Optional: products created later from the admin panel don't need one.
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