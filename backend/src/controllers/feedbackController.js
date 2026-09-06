import Feedback from "../models/Feedback.js";

// SUBMIT FEEDBACK — public, optionally attached to a logged in user.
export const createFeedback = async (req, res) => {
  try {
    const { name, phone, websiteRating, foodRating, comments } = req.body;

    const website = Number(websiteRating);
    const food = Number(foodRating);

    if (
      !Number.isInteger(website) ||
      website < 1 ||
      website > 5 ||
      !Number.isInteger(food) ||
      food < 1 ||
      food > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Please give a 1-5 star rating for both website and food",
      });
    }

    const feedback = await Feedback.create({
      name: (name || "").trim().slice(0, 100),
      phone: (phone || "").replace(/\D/g, "").slice(0, 10),
      websiteRating: website,
      foodRating: food,
      comments: (comments || "").trim().slice(0, 1000),
      user: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Thank you for your feedback!",
      feedback,
    });
  } catch (error) {
    console.error("Create feedback error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit feedback",
    });
  }
};
