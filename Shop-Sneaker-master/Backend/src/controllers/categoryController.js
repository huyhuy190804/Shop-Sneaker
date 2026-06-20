import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";

// Helper function to create a nested category tree
const createCategoryTree = (categories, parentId = null) => {
  const categoryList = [];
  let category;

  if (parentId == null) {
    category = categories.filter((cat) => cat.parentCategory == null);
  } else {
    category = categories.filter(
      (cat) => cat.parentCategory?._id.toString() === parentId.toString(),
    );
  }

  for (let cat of category) {
    categoryList.push({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      imageUrl: cat.imageUrl,
      children: createCategoryTree(categories, cat._id),
    });
  }

  return categoryList;
};

// GET all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate(
      "parentCategory",
      "name slug",
    );

    const { type } = req.query;
    let responseData = categories;

    if (type === "tree") {
      responseData = createCategoryTree(categories);
    }

    res.status(200).json({
      success: true,
      message: "Get all categories successfully",
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting categories",
      error: error.message,
    });
  }
};

// GET category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id).populate(
      "parentCategory",
      "name slug",
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Get category successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting category",
      error: error.message,
    });
  }
};

// CREATE new category
export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, imageUrl, parentCategory } = req.body;

    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Name and slug are required",
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug }],
    });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name or slug already exists",
      });
    }

    // If parentCategory is provided, verify it exists
    if (parentCategory) {
      const parentCat = await Category.findById(parentCategory);
      if (!parentCat) {
        return res.status(400).json({
          success: false,
          message: "Parent category not found",
        });
      }
    }

    const category = new Category({
      name,
      slug,
      description,
      imageUrl,
      parentCategory: parentCategory || null,
    });

    const savedCategory = await category.save();
    await savedCategory.populate("parentCategory", "name slug");

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: savedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating category",
      error: error.message,
    });
  }
};

// UPDATE category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, imageUrl, parentCategory } = req.body;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if new name or slug already exists (excluding current category)
    if (name && name !== category.name) {
      const existingName = await Category.findOne({ name, _id: { $ne: id } });
      if (existingName) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
      }
    }

    if (slug && slug !== category.slug) {
      const existingSlug = await Category.findOne({ slug, _id: { $ne: id } });
      if (existingSlug) {
        return res.status(400).json({
          success: false,
          message: "Category with this slug already exists",
        });
      }
    }

    // If parentCategory is provided, verify it exists and is not the category itself
    if (parentCategory) {
      if (parentCategory === id) {
        return res.status(400).json({
          success: false,
          message: "A category cannot be its own parent",
        });
      }
      const parentCat = await Category.findById(parentCategory);
      if (!parentCat) {
        return res.status(400).json({
          success: false,
          message: "Parent category not found",
        });
      }
    }

    // Update fields
    if (name) category.name = name;
    if (slug) category.slug = slug;
    if (description !== undefined) category.description = description;
    if (imageUrl !== undefined) category.imageUrl = imageUrl;
    if (parentCategory !== undefined)
      category.parentCategory = parentCategory || null;

    const updatedCategory = await category.save();
    await updatedCategory.populate("parentCategory", "name slug");

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating category",
      error: error.message,
    });
  }
};

// DELETE category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if this category is used as parent category by others
    const childCategories = await Category.find({ parentCategory: id });
    if (childCategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${childCategories.length} child category(ies)`,
        childCount: childCategories.length,
      });
    }

    // Check if this category is used by any products
    const associatedProducts = await Product.find({ category: id });
    if (associatedProducts.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It is associated with ${associatedProducts.length} product(s)`,
        productCount: associatedProducts.length,
      });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
};
