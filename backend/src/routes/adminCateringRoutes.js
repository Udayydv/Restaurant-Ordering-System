import express from "express";
import {
  getEnquiries,
  updateEnquiryStatus,
} from "../controllers/adminCateringController.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(adminMiddleware);

router.get("/", getEnquiries);
router.patch("/:id/status", updateEnquiryStatus);

export default router;
