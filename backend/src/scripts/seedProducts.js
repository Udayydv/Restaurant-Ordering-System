/**
 * Synchronize MongoDB with the restaurant menu used by the frontend.
 *
 * Usage:
 *   cd backend
 *   npm run seed-products
 */
import "dotenv/config";
import mongoose from "mongoose";

import { syncMenuDatabase } from "../services/menuSync.js";

const run = async () => {
  const mongoURI =
    process.env.MONGO_URI ||
    "mongodb://127.0.0.1:27017/TripathiRestaurant";

  await mongoose.connect(mongoURI);
  console.log("🍃 MongoDB connected");

  await syncMenuDatabase({ log: true });

  await mongoose.disconnect();
};

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  });
