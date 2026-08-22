import express from "express";

import {
  getAllOrders,
  getAdminOrderById,
  updateOrderStatus,
  getOrderHistoryByDate,
} from "../controllers/adminOrderController.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(adminMiddleware);

router.get("/", getAllOrders);

// Must come before "/:id" so "history" isn't swallowed as an id param.
router.get("/history", getOrderHistoryByDate);

router.get("/:id", getAdminOrderById);

router.patch("/:id/status", updateOrderStatus);

export default router;