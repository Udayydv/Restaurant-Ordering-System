import Order from "../models/Order.js";
import User from "../models/User.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalOrders,
      pendingOrders,
      preparingOrders,
      outForDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
      totalCustomers,
      revenueData,
      todayOrders,
      todayRevenueData,
    ] = await Promise.all([
      Order.countDocuments(),

      Order.countDocuments({
        orderStatus: {
          $in: ["placed", "confirmed"],
        },
      }),

      Order.countDocuments({
        orderStatus: "preparing",
      }),

      Order.countDocuments({
        orderStatus: "out_for_delivery",
      }),

      Order.countDocuments({
        orderStatus: "delivered",
      }),

      Order.countDocuments({
        orderStatus: "cancelled",
      }),

      User.countDocuments({
  role: "customer",
  }),

      Order.aggregate([
        {
          $match: {
            orderStatus: { $ne: "cancelled" },
            paymentStatus: { $ne: "failed" },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]),

      Order.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      }),

      Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
            orderStatus: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
          },
        },
      ]),
    ]);

    const totalRevenue = revenueData[0]?.total || 0;
    const todayRevenue = todayRevenueData[0]?.total || 0;

    return res.status(200).json({
      success: true,

      stats: {
        totalOrders,

        pendingOrders,

        preparingOrders,

        outForDeliveryOrders,

        deliveredOrders,

        cancelledOrders,

        totalCustomers,

        totalRevenue,

        todayOrders,

        todayRevenue,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch dashboard statistics",
    });
  }
};