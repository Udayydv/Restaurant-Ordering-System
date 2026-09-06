import express from "express";

import {
  getDashboardStats,
} from "../controllers/adminDashboardController.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(adminMiddleware);

router.get("/stats", getDashboardStats);

export default router;