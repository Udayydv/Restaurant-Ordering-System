import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import Admin from "../models/Admin.js";

export async function verifySession(token, adminOnly = false) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const separateAdmin = decoded.type === "admin";
  const id = separateAdmin ? decoded.id : decoded.userId;
  if (!mongoose.isValidObjectId(id)) throw new Error("Invalid session");
  const account = await (separateAdmin ? Admin : User).findById(id);
  if (!account || account.isActive === false || (decoded.tokenVersion || 0) !== (account.tokenVersion || 0)) {
    throw new Error("Session revoked");
  }
  if ((!separateAdmin && !["customer", "admin"].includes(account.role)) ||
      (adminOnly && !["admin", "superadmin"].includes(account.role)) ||
      (!adminOnly && separateAdmin)) throw new Error("Access denied");
  return { decoded: { ...decoded, role: account.role }, account };
}
