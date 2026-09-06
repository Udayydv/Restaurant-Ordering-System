import express from "express";
import rateLimit from "express-rate-limit";
import { createEnquiry } from "../controllers/cateringController.js";

const router = express.Router();

const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many enquiries submitted. Please try again later.",
  },
});

// Public — anyone (logged in or not) can submit a catering enquiry.
router.post("/", enquiryLimiter, createEnquiry);

export default router;
