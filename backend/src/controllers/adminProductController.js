import Product from "../models/Product.js";
import { emitToCustomers } from "../socket.js";

// GET ALL PRODUCTS — ADMIN
export const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find().sort({
      sortOrder: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Admin get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch products",
    });
  }
};

// GET SINGLE PRODUCT — ADMIN
export const getProductAdmin = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Admin get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch product",
    });
  }
};

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description = "",
      category,
      image = "",
      prices,
      isAvailable = true,
      isFeatured = false,
      isBestseller = false,
      sortOrder = 0,
    } = req.body;

    if (!name || !category || !prices) {
      return res.status(400).json({
        success: false,
        message: "Name, category and prices are required",
      });
    }

    if (
      typeof prices !== "object" ||
      prices === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid prices",
      });
    }

    const hasPrice =
      prices.regular !== undefined ||
      prices.half !== undefined ||
      prices.full !== undefined;

    if (!hasPrice) {
      return res.status(400).json({
        success: false,
        message: "At least one price is required",
      });
    }

    const product = await Product.create({
      name,
      description,
      category,
      image,
      prices,
      isAvailable,
      isFeatured,
      isBestseller,
      sortOrder,
    });

    emitToCustomers("products:changed", {
      type: "created",
      product,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create product",
    });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const allowedFields = [
      "name",
      "description",
      "category",
      "image",
      "prices",
      "isAvailable",
      "isFeatured",
      "isBestseller",
      "sortOrder",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    }

    await product.save();

    emitToCustomers("products:changed", {
      type: "updated",
      product,
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update product",
    });
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    emitToCustomers("products:changed", {
      type: "deleted",
      productId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete product",
    });
  }
};

// TOGGLE AVAILABILITY
export const toggleProductAvailability = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isAvailable = !product.isAvailable;

    await product.save();

    emitToCustomers("products:changed", {
      type: "updated",
      product,
    });

    return res.status(200).json({
      success: true,
      message: `Product ${
        product.isAvailable ? "enabled" : "disabled"
      } successfully`,
      product,
    });
  } catch (error) {
    console.error("Toggle availability error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update product availability",
    });
  }
};