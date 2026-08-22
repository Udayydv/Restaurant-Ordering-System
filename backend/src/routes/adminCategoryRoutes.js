import express from "express";

import {
  getCategories,
  getCategoryDetails,
  getCategorySummary,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "../controllers/adminCategoryController.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(adminMiddleware);

// GET
router.get("/", getCategories);

router.get("/summary", getCategorySummary);

router.get("/:category", getCategoryDetails);

// CREATE
router.post("/", createCategory);

// UPDATE
router.put("/:id", updateCategory);

// DELETE
router.delete("/:id", deleteCategory);

// TOGGLE ACTIVE STATUS
router.patch("/:id/toggle-status", toggleCategoryStatus);

export default router;