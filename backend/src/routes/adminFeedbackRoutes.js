import express from "express";
import { getFeedback } from "../controllers/adminFeedbackController.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(adminMiddleware);

router.get("/", getFeedback);

export default router;
