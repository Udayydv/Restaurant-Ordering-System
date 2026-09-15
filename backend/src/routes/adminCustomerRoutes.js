import express from "express";

import {
  getAllCustomers,
  getCustomerById,
  getCustomerOrders,
} from "../controllers/adminCustomerController.js";

import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

router.use(adminMiddleware);

router.get("/", getAllCustomers);

router.get("/:id", getCustomerById);

router.get("/:id/orders", getCustomerOrders);

export default router;