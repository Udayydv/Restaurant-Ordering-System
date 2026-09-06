import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    // Hashed with bcrypt. Never store or return the plain password.
    // `select: false` keeps it out of normal queries (req.user etc.)
    // unless explicitly requested with .select("+passwordHash").
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    name: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    isVerified: {
      type: Boolean,
      default: true,
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    addresses: [
      {
        label: {
          type: String,
          trim: true,
        },
        addressLine: {
          type: String,
          required: true,
          trim: true,
        },
        landmark: {
          type: String,
          trim: true,
        },
        city: {
          type: String,
          trim: true,
        },
        pincode: {
          type: String,
          trim: true,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],

    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
