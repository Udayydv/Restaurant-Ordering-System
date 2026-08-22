import Order from "../models/Order.js";
import { emitToAdmins, emitToUser } from "../socket.js";

// GET ALL ORDERS
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch orders",
    });
  }
};

// GET SINGLE ORDER
export const getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name phone email");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get admin order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch order",
    });
  }
};

// GET ORDER HISTORY FOR A SPECIFIC DATE
// Since every order already carries its own createdAt timestamp,
// "today's" dashboard numbers naturally reset every midnight without
// any extra bookkeeping — this endpoint just lets the admin look back
// at any single day by filtering the same Order collection by date,
// with its own revenue total computed fresh each time.
export const getOrderHistoryByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Provide a date in YYYY-MM-DD format",
      });
    }

    // Interpret the given date in IST (UTC+5:30), matching how the
    // rest of the app reasons about "the restaurant's day".
    const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

    const startOfDayUTC = new Date(
      new Date(`${date}T00:00:00.000Z`).getTime() - IST_OFFSET_MS
    );
    const endOfDayUTC = new Date(
      startOfDayUTC.getTime() + 24 * 60 * 60 * 1000
    );

    const orders = await Order.find({
      createdAt: { $gte: startOfDayUTC, $lt: endOfDayUTC },
    })
      .populate("user", "name phone")
      .sort({ createdAt: -1 });

    const revenue = orders
      .filter((o) => o.orderStatus !== "cancelled")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const statusCounts = orders.reduce((acc, o) => {
      acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      date,
      count: orders.length,
      revenue: Number(revenue.toFixed(2)),
      statusCounts,
      orders,
    });
  } catch (error) {
    console.error("Get order history error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch order history",
    });
  }
};

// UPDATE ORDER STATUS
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "placed",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = status;

    if (status === "delivered") {
      order.deliveredAt = new Date();
    }

    if (status === "cancelled") {
      order.cancelledAt = new Date();
    }

    await order.save();

    // Real-time: tell every connected admin dashboard the status
    // changed (this is what clears the "NEW" badge instantly across
    // every device an admin has open), and tell the customer who
    // placed it so their order tracking view updates live too.
    emitToAdmins("orders:updated", {
      _id: order._id,
      orderStatus: order.orderStatus,
    });

    emitToUser(order.user, "order:status-changed", {
      _id: order._id,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
    });

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update order status",
    });
  }
};