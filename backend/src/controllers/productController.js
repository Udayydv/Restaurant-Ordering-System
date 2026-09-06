import Product from "../models/Product.js";

const normalizePrices = (prices) => {
  if (!prices || typeof prices !== "object") return null;

  const normalized = {};

  for (const key of ["regular", "half", "full"]) {
    if (prices[key] === undefined || prices[key] === null || prices[key] === "") continue;
    const value = Number(prices[key]);
    if (!Number.isFinite(value) || value < 0) return null;
    normalized[key] = value;
  }

  return Object.keys(normalized).length ? normalized : null;
};

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

    const normalizedPrices = normalizePrices(prices);

    if (!normalizedPrices) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid Regular price or Half/Full prices",
      });
    }

    const product = await Product.create({
      name,
      description,
      category,
      image,
      prices: normalizedPrices,
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
      "isAvailable",
      "isFeatured",
      "isBestseller",
      "sortOrder",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    }

    if (req.body.prices !== undefined) {
      const normalizedPrices = normalizePrices(req.body.prices);
      if (!normalizedPrices) {
        return res.status(400).json({
          success: false,
          message: "Enter a valid Regular price or Half/Full prices",
        });
      }
      product.prices = normalizedPrices;
    }

    await product.save();

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