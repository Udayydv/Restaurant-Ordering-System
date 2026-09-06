import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const SALT_ROUNDS = 12;

const normalizePhone = (phone) => {
  return String(phone || "").replace(/\D/g, "");
};

const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

/*
 * A password policy that's strict enough to be meaningful but not so
 * strict it locks real people out: at least 8 characters, at least
 * one letter and one number.
 */
const isValidPassword = (password) => {
  const value = String(password || "");

  return (
    value.length >= 8 &&
    value.length <= 128 &&
    /[A-Za-z]/.test(value) &&
    /\d/.test(value)
  );
};

const signToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      phone: user.phone,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

const publicUser = (user) => ({
  id: user._id,
  phone: user.phone,
  name: user.name || "",
  role: user.role,
});

// REGISTER — create a new account with phone + password.
// The password is hashed with bcrypt before it ever touches the
// database; the plaintext password is never stored or logged.
export const register = async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const { password, name } = req.body;

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid Indian mobile number",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters and include a letter and a number",
      });
    }

    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this mobile number already exists. Please login instead.",
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const adminPhone = normalizePhone(process.env.ADMIN_PHONE);

    const user = await User.create({
      phone,
      passwordHash,
      name: (name || "").trim(),
      isVerified: true,
      role: phone === adminPhone ? "admin" : "customer",
      lastLoginAt: new Date(),
    });

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create account",
    });
  }
};

// LOGIN — verify phone + password against the stored bcrypt hash.
export const login = async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const { password } = req.body;

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid Indian mobile number",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Please enter your password",
      });
    }

    // Explicitly select passwordHash since the schema hides it by default.
    const user = await User.findOne({ phone }).select("+passwordHash");

    // Use the same generic error for "no such user" and "wrong
    // password" so we don't leak which phone numbers are registered.
    const genericError = {
      success: false,
      message: "Invalid mobile number or password",
    };

    if (!user) {
      return res.status(401).json(genericError);
    }

    const isValidPasswordMatch = await bcrypt.compare(
      String(password),
      user.passwordHash
    );

    if (!isValidPasswordMatch) {
      return res.status(401).json(genericError);
    }

    const adminPhone = normalizePhone(process.env.ADMIN_PHONE);

    user.role = phone === adminPhone ? "admin" : user.role;
    user.lastLoginAt = new Date();

    await user.save();

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login",
    });
  }
};

// CHANGE PASSWORD — requires the current password, keeps the account
// secure even if the JWT leaks.
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 8 characters and include a letter and a number",
      });
    }

    const user = await User.findById(req.user._id).select("+passwordHash");

    const isValidCurrent = await bcrypt.compare(
      String(currentPassword || ""),
      user.passwordHash
    );

    if (!isValidCurrent) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.passwordHash = await bcrypt.hash(String(newPassword), SALT_ROUNDS);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to change password",
    });
  }
};
