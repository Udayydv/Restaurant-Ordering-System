import Product from "../models/Product.js";

// GET ALL PRODUCTS
export const getProducts = async (req, res) => {
  try {
    const { category, available, featured, bestseller } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (available !== undefined) {
      filter.isAvailable = available === "true";
    }

    if (featured !== undefined) {
      filter.isFeatured = featured === "true";
    }

    if (bestseller !== undefined) {
      filter.isBestseller = bestseller === "true";
    }

    const products = await Product.find(filter).sort({
      sortOrder: 1,
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch products",
    });
  }
};

// GET SINGLE PRODUCT
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }
};

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      image,
      prices,
      isAvailable,
      isFeatured,
      isBestseller,
      sortOrder,
    } = req.body;

    if (!name || !category || !prices) {
      return res.status(400).json({
        success: false,
        message: "Name, category and prices are required",
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

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create product",
    });
  }
};

// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(400).json({
      success: false,
      message: "Unable to update product",
    });
  }
};

// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(400).json({
      success: false,
      message: "Unable to delete product",
    });
  }
};