import Feedback from "../models/Feedback.js";

// GET ALL FEEDBACK — admin, newest first, with a quick summary.
export const getFeedback = async (req, res) => {
  try {
    const items = await Feedback.find().sort({ createdAt: -1 });

    const count = items.length;
    const avgWebsite = count
      ? Number(
          (items.reduce((s, f) => s + f.websiteRating, 0) / count).toFixed(2)
        )
      : 0;
    const avgFood = count
      ? Number(
          (items.reduce((s, f) => s + f.foodRating, 0) / count).toFixed(2)
        )
      : 0;

    return res.status(200).json({
      success: true,
      count,
      avgWebsite,
      avgFood,
      feedback: items,
    });
  } catch (error) {
    console.error("Get feedback error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch feedback",
    });
  }
};
