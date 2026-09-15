import express from "express";
import Category from "../models/Category.js";

const router = express.Router();

// PUBLIC — only active categories, for the customer-facing menu.
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      sortOrder: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get public categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch categories",
    });
  }
});

export default router;
