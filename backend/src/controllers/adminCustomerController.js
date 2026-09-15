import User from "../models/User.js";
import Order from "../models/Order.js";

// GET ALL CUSTOMERS
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({
      role: { $ne: "admin" },
    })
      .select("-password")
      .sort({ createdAt: -1 });

    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.find({
          user: customer._id,
        }).select("totalAmount orderStatus");

        const totalOrders = orders.length;

        const totalSpent = orders
          .filter((order) => order.orderStatus !== "cancelled")
          .reduce(
            (sum, order) => sum + (order.totalAmount || 0),
            0
          );

        return {
          ...customer.toObject(),
          totalOrders,
          totalSpent,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: customersWithStats.length,
      customers: customersWithStats,
    });
  } catch (error) {
    console.error("Get customers error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch customers",
    });
  }
};

// GET CUSTOMER DETAILS
export const getCustomerById = async (req, res) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: { $ne: "admin" },
    }).select("-password");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const orders = await Order.find({
      user: customer._id,
    }).sort({ createdAt: -1 });

    const totalOrders = orders.length;

    const totalSpent = orders
      .filter((order) => order.orderStatus !== "cancelled")
      .reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      );

    return res.status(200).json({
      success: true,
      customer: {
        ...customer.toObject(),
        totalOrders,
        totalSpent,
      },
      orders,
    });
  } catch (error) {
    console.error("Get customer details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch customer",
    });
  }
};

// GET CUSTOMER ORDERS
export const getCustomerOrders = async (req, res) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: { $ne: "admin" },
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const orders = await Order.find({
      user: customer._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get customer orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch customer orders",
    });
  }
};