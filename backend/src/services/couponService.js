import Order from "../models/Order.js";
import User from "../models/User.js";

export const FIRST_ORDER_COUPON = {
  code: "WELCOME50",
  minimumSubtotal: 399,
  discount: 50,
};

// WELCOME50 is a one-time new-customer benefit. We keep a fast marker on
// the User document and also check order history so accounts that used the
// coupon before the marker was introduced can never redeem it twice.
export const hasUsedWelcome50 = async (userId) => {
  const user = await User.findById(userId).select("welcome50UsedAt");

  if (user?.welcome50UsedAt) {
    return true;
  }

  const previousRedemption = await Order.findOne({
    user: userId,
    couponCode: FIRST_ORDER_COUPON.code,
    orderStatus: { $ne: "cancelled" },
  })
    .select("_id createdAt")
    .lean();

  if (!previousRedemption) {
    return false;
  }

  // One-time migration/backfill for existing users.
  await User.updateOne(
    { _id: userId, welcome50UsedAt: null },
    { $set: { welcome50UsedAt: previousRedemption.createdAt || new Date() } },
  );

  return true;
};

export const getWelcome50Status = async (userId) => {
  const used = await hasUsedWelcome50(userId);

  return {
    code: FIRST_ORDER_COUPON.code,
    eligible: !used,
    used,
    minimumSubtotal: FIRST_ORDER_COUPON.minimumSubtotal,
    discountAmount: FIRST_ORDER_COUPON.discount,
  };
};

export const evaluateCoupon = async ({ userId, code, subtotal }) => {
  const normalizedCode = String(code || "").trim().toUpperCase();
  const amount = Number(subtotal);

  if (!normalizedCode) {
    return {
      valid: false,
      code: "",
      discountAmount: 0,
      message: "Enter a coupon code",
    };
  }

  if (normalizedCode !== FIRST_ORDER_COUPON.code) {
    return {
      valid: false,
      code: normalizedCode,
      discountAmount: 0,
      message: "Invalid coupon code",
    };
  }

  if (await hasUsedWelcome50(userId)) {
    return {
      valid: false,
      code: normalizedCode,
      discountAmount: 0,
      message: `${FIRST_ORDER_COUPON.code} has already been used on this account`,
    };
  }

  if (!Number.isFinite(amount) || amount < FIRST_ORDER_COUPON.minimumSubtotal) {
    return {
      valid: false,
      code: normalizedCode,
      discountAmount: 0,
      message: `Add items worth ₹${FIRST_ORDER_COUPON.minimumSubtotal} or more to use ${FIRST_ORDER_COUPON.code}`,
    };
  }

  return {
    valid: true,
    code: FIRST_ORDER_COUPON.code,
    discountAmount: FIRST_ORDER_COUPON.discount,
    message: `Coupon applied — you saved ₹${FIRST_ORDER_COUPON.discount}`,
  };
};
