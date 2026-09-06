import express from "express";
import rateLimit from "express-rate-limit";
import { createFeedback } from "../controllers/feedbackController.js";

const router = express.Router();

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
