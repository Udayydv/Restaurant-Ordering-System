import express from "express";

import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getDeliveryQuoteForCoords,
} from "../controllers/addressController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getAddresses);

router.get("/delivery-quote", getDeliveryQuoteForCoords);

router.post("/", createAddress);

router.put("/:id", updateAddress);

router.delete("/:id", deleteAddress);

export default router;