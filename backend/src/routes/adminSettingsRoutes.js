import express from "express";
import {
  getAdminSettings,
  updateAdminSettings,
} from "../controllers/settingsController.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(adminMiddleware);

router.get("/", getAdminSettings);
router.patch("/", updateAdminSettings);

export default router;
