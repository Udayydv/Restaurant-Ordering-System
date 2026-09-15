import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    // 1-5 star ratings for the two things we actually care about.
    websiteRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    foodRating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    comments: {
      type: String,
      trim: true,
      default: "",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Feedback =
  mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);

export default Feedback;
