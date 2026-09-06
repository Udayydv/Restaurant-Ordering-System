import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import Admin from "../models/Admin.js";

const MONGO_URI = process.env.MONGO_URI;

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("🍃 MongoDB connected");

    const email = "admin@tripathirestaurant.com";
    const password = "Admin@12345";

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await Admin.create({
      name: "Tripathi Restaurant Admin",
      email,
      password: hashedPassword,
      role: "superadmin",
    });

    console.log("✅ Admin created successfully");
    console.log("Email:", admin.email);
    console.log("Password:", password);

    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to create admin:", error);
    process.exit(1);
  }
};

createAdmin();