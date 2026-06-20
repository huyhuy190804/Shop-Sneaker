import Product from "../models/productModel.js";
import Variant from "../models/variantModel.js";

const attachVariants = async (products) => {
  const ids = products.map((product) => product._id);
  const variants = await Variant.find({ productId: { $in: ids } }).lean();

  const grouped = variants.reduce((acc, variant) => {
    const key = String(variant.productId);
    if (!acc[key]) acc[key] = [];
    acc[key].push(variant);
    return acc;
  }, {});

  return products.map((product) => {
    const plainProduct = product.toObject ? product.toObject() : product;
    return {
      ...plainProduct,
      variants: grouped[String(plainProduct._id)] || [],
    };
  });
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).populate("category").populate("brand");
    res.json(await attachVariants(products));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category").populate("brand");
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const variants = await Variant.find({ productId: product._id }).lean();
    const plainProduct = product.toObject();
    res.json({
      ...plainProduct,
      variants,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    Object.assign(product, req.body);
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    await Variant.deleteMany({ productId: product._id });
    await product.deleteOne();
    res.json({ message: "Sản phẩm đã được xóa cùng các biến thể liên quan" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// Variant CRUD
// ──────────────────────────────────────────────

export const createVariant = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const { color, size, sku, stock, variantImages } = req.body;

    const variant = new Variant({
      productId: product._id,
      color,
      size,
      sku,
      stock,
      variantImages,
    });

    const savedVariant = await variant.save();
    res.status(201).json(savedVariant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateVariant = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const variant = await Variant.findOne({
      _id: req.params.variantId,
      productId: product._id,
    });
    if (!variant) {
      return res.status(404).json({ message: "Biến thể không tồn tại" });
    }

    const { color, size, sku, stock, variantImages } = req.body;
    if (color !== undefined) variant.color = color;
    if (size !== undefined) variant.size = size;
    if (sku !== undefined) variant.sku = sku;
    if (stock !== undefined) variant.stock = stock;
    if (variantImages !== undefined) variant.variantImages = variantImages;

    const updatedVariant = await variant.save();
    res.json(updatedVariant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteVariant = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const variant = await Variant.findOne({
      _id: req.params.variantId,
      productId: product._id,
    });
    if (!variant) {
      return res.status(404).json({ message: "Biến thể không tồn tại" });
    }

    await variant.deleteOne();
    res.json({ message: "Biến thể đã được xóa" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
