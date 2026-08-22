import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { emitToCustomers } from "../socket.js";

// GET ALL CATEGORIES
// GET ALL CATEGORIES
export const getCategories = async (req, res) => {
  try {
    // Get all unique category names from products
    const productCategories = await Product.distinct("category");

    // Create missing Category documents
    for (const categoryName of productCategories) {
      if (!categoryName || !categoryName.trim()) {
        continue;
      }

      const trimmedName = categoryName.trim();

      await Category.findOneAndUpdate(
        { name: trimmedName },
        {
          $setOnInsert: {
            name: trimmedName,
            description: "",
            image: "",
            isActive: true,
            sortOrder: 0,
          },
        },
        {
          upsert: true,
          // new: true,
        }
      );
    }

    // Now fetch categories
    const categories = await Category.find().sort({
      sortOrder: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch categories",
    });
  }
};
// GET CATEGORY SUMMARY
export const getCategorySummary = async (req, res) => {
  try {
    const categories = await Category.find().sort({
      sortOrder: 1,
      createdAt: -1,
    });

    const summary = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          category: category.name,
        });

        const availableProducts = await Product.countDocuments({
          category: category.name,
          isAvailable: true,
        });

            return {
      _id: category._id,
      categoryId: category._id,
      name: category.name,
      description: category.description,
      image: category.image,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      productCount,
      availableProducts,
    };
      })
    );

    return res.status(200).json({
      success: true,
      categories: summary,
    });
  } catch (error) {
    console.error("Category summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch category summary",
    });
  }
};

// GET PRODUCTS OF CATEGORY
export const getCategoryDetails = async (req, res) => {
  try {
    const category = req.params.category;

    const products = await Product.find({
      category,
    }).sort({
      sortOrder: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      category,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get category details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch category",
    });
  }
};

// CREATE CATEGORY
export const createCategory = async (req, res) => {
  try {
    const {
      name,
      description = "",
      image = "",
      isActive = true,
      sortOrder = 0,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const existingCategory = await Category.findOne({
      name: name.trim(),
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description,
      image,
      isActive,
      sortOrder,
    });

    // Real-time: push the new category to every connected customer
    // browser so it shows up on the menu instantly.
    emitToCustomers("categories:changed", {
      type: "created",
      category,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create category",
    });
  }
};

// UPDATE CATEGORY
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const oldName = category.name;

    const {
      name,
      description,
      image,
      isActive,
      sortOrder,
    } = req.body;

    if (name !== undefined) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: "Category name cannot be empty",
        });
      }

      const duplicate = await Category.findOne({
        name: trimmedName,
        _id: { $ne: category._id },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Category already exists",
        });
      }

      category.name = trimmedName;
    }

    if (description !== undefined) {
      category.description = description;
    }

    if (image !== undefined) {
      category.image = image;
    }

    if (isActive !== undefined) {
      category.isActive = isActive;
    }

    if (sortOrder !== undefined) {
      category.sortOrder = sortOrder;
    }

    await category.save();

    // If category name changed, update products using old category
    if (name !== undefined && oldName !== category.name) {
      await Product.updateMany(
        { category: oldName },
        { $set: { category: category.name } }
      );
    }

    emitToCustomers("categories:changed", {
      type: "updated",
      category,
    });

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update category",
    });
  }
};

// DELETE CATEGORY
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const productCount = await Product.countDocuments({
      category: category.name,
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category because ${productCount} product(s) belong to it`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    emitToCustomers("categories:changed", {
      type: "deleted",
      categoryId: req.params.id,
    });

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete category",
    });
  }
};

// TOGGLE CATEGORY STATUS
export const toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.isActive = !category.isActive;

    await category.save();

    emitToCustomers("categories:changed", {
      type: "updated",
      category,
    });

    return res.status(200).json({
      success: true,
      message: `Category ${
        category.isActive ? "enabled" : "disabled"
      } successfully`,
      category,
    });
  } catch (error) {
    console.error("Toggle category error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update category status",
    });
  }
};