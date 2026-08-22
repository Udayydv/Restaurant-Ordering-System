import express from "express";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getCart);

router.post("/items", addToCart);

router.put("/items/:productId", updateCartItem);

router.delete("/items/:productId", removeFromCart);

router.delete("/", clearCart);

export default router;