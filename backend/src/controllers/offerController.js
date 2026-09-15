import {
  evaluateCoupon,
  FIRST_ORDER_COUPON,
  getWelcome50Status,
} from "../services/couponService.js";

export const validateCoupon = async (req, res) => {
  try {
    const result = await evaluateCoupon({
      userId: req.user._id,
      code: req.body?.code,
      subtotal: req.body?.subtotal,
    });

    return res.status(result.valid ? 200 : 400).json({
      success: result.valid,
      ...result,
      minimumSubtotal: FIRST_ORDER_COUPON.minimumSubtotal,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to validate coupon right now",
    });
  }
};

export const welcome50Status = async (req, res) => {
  try {
    const status = await getWelcome50Status(req.user._id);

    return res.status(200).json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error("Coupon status error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load coupon status right now",
    });
  }
};
