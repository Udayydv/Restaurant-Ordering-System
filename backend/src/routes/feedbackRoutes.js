import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import rateLimit from "express-rate-limit";
import { createFeedback } from "../controllers/feedbackController.js";

const router = express.Router();
router.use((req, res, next) => req.headers.authorization ? authMiddleware(req, res, next) : next());

const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many submissions. Please try again later.",
  },
});

// Public — anyone (logged in or not) can leave feedback.
router.post("/", feedbackLimiter, createFeedback);

export default router;
