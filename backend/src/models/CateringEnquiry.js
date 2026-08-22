import mongoose from "mongoose";

const cateringEnquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: String,
      trim: true,
      default: "",
    },

    guests: {
      type: String,
      trim: true,
      default: "",
    },

    occasion: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    // Set if the enquirer was logged in when they submitted.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["new", "contacted", "confirmed", "cancelled"],
      default: "new",
    },
  },
  {
    timestamps: true,
  }
);

const CateringEnquiry =
  mongoose.models.CateringEnquiry ||
  mongoose.model("CateringEnquiry", cateringEnquirySchema);

export default CateringEnquiry;
