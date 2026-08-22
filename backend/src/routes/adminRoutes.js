import express from "express";

import {
  adminLogin,
  getCurrentAdmin,
} from "../controllers/adminController.js";

import {
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
} from "../controllers/adminOrderController.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public
router.post("/login", adminLogin);

// Protected
router.get("/me", adminMiddleware, getCurrentAdmin);

// Orders
router.get("/orders", adminMiddleware, getAllOrders);

router.get(
  "/orders/:id",
  adminMiddleware,
  getAdminOrderById
);

router.patch(
  "/orders/:id/status",
  adminMiddleware,
  updateOrderStatus
);

export default router;