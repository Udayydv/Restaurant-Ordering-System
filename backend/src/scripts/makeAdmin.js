import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

const makeAdmin = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI ||
      "mongodb://127.0.0.1:27017/TripathiRestaurant";

    await mongoose.connect(mongoURI);

    console.log("🍃 MongoDB connected");

    const phone = String(process.env.ADMIN_PHONE || "").replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(phone)) {
      throw new Error("Set ADMIN_PHONE to the existing account you intend to promote");
    }

    const user = await User.findOne({ phone });

    if (!user) {
      console.log("❌ User not found:", phone);
      process.exit(1);
    }

    user.role = "admin";
    user.isVerified = true;

    await user.save();

    console.log("✅ User promoted to admin");
    console.log("Phone:", user.phone);
    console.log("Role:", user.role);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to make admin:", error);

    await mongoose.disconnect();
    process.exit(1);
  }
};

makeAdmin();