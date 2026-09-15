import express from "express";
import rateLimit from "express-rate-limit";

import {
  adminLogin,
  getCurrentAdmin,
} from "../controllers/adminController.js";



import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Public
router.post("/login", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again later." },
}), adminLogin);

// Protected
router.get("/me", adminMiddleware, getCurrentAdmin);

// Order routes are mounted once through adminOrderRoutes in app.js.

export default router;