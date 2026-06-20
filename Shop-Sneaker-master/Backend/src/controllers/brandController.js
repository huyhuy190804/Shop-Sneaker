import Brand from "../models/brandModel.js";

// GET all brands
export const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find();

    res.status(200).json({
      success: true,
      message: "Get all brands successfully",
      data: brands,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting brands",
      error: error.message,
    });
  }
};

// GET brand by ID
export const getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findById(id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Get brand successfully",
      data: brand,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error getting brand",
      error: error.message,
    });
  }
};

// CREATE new brand (ADMIN ONLY)
export const createBrand = async (req, res) => {
  try {
    const { name, slug, description, logoUrl } = req.body;

    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Name and slug are required",
      });
    }

    // Check if brand already exists
    const existingBrand = await Brand.findOne({ $or: [{ name }, { slug }] });
    if (existingBrand) {
      return res.status(400).json({
        success: false,
        message: "Brand with this name or slug already exists",
      });
    }

    const brand = new Brand({
      name,
      slug,
      description,
      logoUrl,
    });

    const savedBrand = await brand.save();

    res.status(201).json({
      success: true,
      message: "Brand created successfully",
      data: savedBrand,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating brand",
      error: error.message,
    });
  }
};

// UPDATE brand (ADMIN ONLY)
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, logoUrl } = req.body;

    // Check if brand exists
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    // Check if new name or slug already exists (excluding current brand)
    if (name && name !== brand.name) {
      const existingName = await Brand.findOne({ name, _id: { $ne: id } });
      if (existingName) {
        return res.status(400).json({
          success: false,
          message: "Brand with this name already exists",
        });
      }
    }

    if (slug && slug !== brand.slug) {
      const existingSlug = await Brand.findOne({ slug, _id: { $ne: id } });
      if (existingSlug) {
        return res.status(400).json({
          success: false,
          message: "Brand with this slug already exists",
        });
      }
    }

    // Update fields
    if (name) brand.name = name;
    if (slug) brand.slug = slug;
    if (description !== undefined) brand.description = description;
    if (logoUrl !== undefined) brand.logoUrl = logoUrl;

    const updatedBrand = await brand.save();

    res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      data: updatedBrand,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating brand",
      error: error.message,
    });
  }
};

// DELETE brand (ADMIN ONLY)
export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if brand exists
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    await Brand.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting brand",
      error: error.message,
    });
  }
};
