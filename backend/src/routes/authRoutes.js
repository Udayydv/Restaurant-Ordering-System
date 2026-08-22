import express from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  changePassword,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Per-IP limits protect against credential stuffing / brute-forcing
// passwords across many phone numbers from a single device.
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many signup attempts from this device. Please try again later.",
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.post("/change-password", authMiddleware, changePassword);

router.get("/me", authMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      phone: req.user.phone,
      name: req.user.name || "",
      role: req.user.role,
    },
  });
});

export default router;
