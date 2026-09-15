import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  validateCoupon,
  welcome50Status,
} from "../controllers/offerController.js";

const router = express.Router();
router.use(authMiddleware);
router.get("/welcome50/status", welcome50Status);
router.post("/validate", validateCoupon);

export default router;
