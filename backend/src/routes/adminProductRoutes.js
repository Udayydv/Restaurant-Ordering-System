import express from "express";

import {
  getAllProductsAdmin,
  getProductAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
} from "../controllers/adminProductController.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(adminMiddleware);

router.get("/", getAllProductsAdmin);

router.get("/:id", getProductAdmin);

router.post("/", createProduct);

router.put("/:id", updateProduct);

router.delete("/:id", deleteProduct);

router.patch(
  "/:id/toggle-availability",
  toggleProductAvailability
);

export default router;