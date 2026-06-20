import mongoose from "mongoose";
import Cart from "../models/cartModel.js";
import Coupon from "../models/couponModel.js";
import Product from "../models/productModel.js";
import Variant from "../models/variantModel.js";

const toPositiveInt = (value, fallback = 1) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const resolveObjectId = (value) => value?._id || value;

const objectIdEquals = (left, right) => String(resolveObjectId(left)) === String(resolveObjectId(right));

const buildEmptyCart = (userId) => ({
  userId,
  items: [],
  couponCode: null,
  discountAmount: 0,
  subtotal: 0,
  totalPrice: 0,
});

const normalizeCart = (cart) => {
  if (!cart) return null;

  const items = cart.items.map((item) => {
    const product = item.productId && typeof item.productId === "object" ? item.productId : null;
    const variant = item.variantId && typeof item.variantId === "object" ? item.variantId : null;
    const price = Number(item.price || 0);
    const quantity = Number(item.quantity || 0);

    return {
      productId: product?._id || item.productId,
      variantId: variant?._id || item.variantId,
      quantity,
      price,
      lineTotal: price * quantity,
      product: product
        ? {
            _id: product._id,
            name: product.name,
            slug: product.slug,
            basePrice: product.basePrice,
            salePrice: product.salePrice,
            productImages: product.productImages,
            status: product.status,
            category: product.category,
            brand: product.brand,
          }
        : null,
      variant: variant
        ? {
            _id: variant._id,
            color: variant.color,
            size: variant.size,
            sku: variant.sku,
            stock: variant.stock,
            variantImages: variant.variantImages,
          }
        : null,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discountAmount = Number(cart.discountAmount || 0);
  const totalPrice = Math.max(subtotal - discountAmount, 0);

  return {
    _id: cart._id,
    userId: cart.userId,
    items,
    couponCode: cart.couponCode || null,
    discountAmount,
    subtotal,
    totalPrice,
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
};

const populateCart = async (cart) => {
  if (!cart) return null;
  await cart.populate([
    { path: "items.productId", select: "name slug basePrice salePrice productImages status category brand" },
    { path: "items.variantId", select: "color size sku stock variantImages" },
  ]);
  return cart;
};

const findCartForUser = async (userId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) return null;
  return populateCart(cart);
};

const calculateCouponDiscount = (cart, coupon) => {
  if (!coupon) return 0;

  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  if (subtotal < Number(coupon.minOrderAmount || 0)) return 0;

  const itemMatchesCoupon = (item) => {
    const productId = resolveObjectId(item.productId);
    const productCategoryId = resolveObjectId(item.productId?.category);

    if (coupon.appliesTo === "products") {
      return (coupon.productIds || []).some((id) => objectIdEquals(id, productId));
    }

    if (coupon.appliesTo === "categories") {
      return (coupon.categoryIds || []).some((id) => objectIdEquals(id, productCategoryId));
    }

    return true;
  };

  const eligibleSubtotal = cart.items
    .filter(itemMatchesCoupon)
    .reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);

  if (eligibleSubtotal <= 0) return 0;

  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = (eligibleSubtotal * Number(coupon.value || 0)) / 100;
    if (Number.isFinite(coupon.maxDiscountAmount) && coupon.maxDiscountAmount > 0) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else {
    discount = Number(coupon.value || 0);
  }

  return Math.max(Math.min(discount, eligibleSubtotal, subtotal), 0);
};

const syncCartTotals = async (cart) => {
  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  let discountAmount = 0;

  if (cart.couponCode) {
    const coupon = await Coupon.findOne({
      code: cart.couponCode.trim().toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
    });

    if (coupon) {
      discountAmount = calculateCouponDiscount(cart, coupon);
    } else {
      cart.couponCode = null;
    }
  }

  cart.subtotal = subtotal;
  cart.discountAmount = discountAmount;
  cart.totalPrice = Math.max(subtotal - discountAmount, 0);
  await cart.save();

  return cart;
};

const validateCartItemPayload = (req, res) => {
  const { productId, variantId } = req.body;
  const quantity = toPositiveInt(req.body.quantity, 0);

  if (!mongoose.isValidObjectId(productId) || !mongoose.isValidObjectId(variantId)) {
    res.status(400).json({ message: "productId và variantId không hợp lệ" });
    return null;
  }

  if (quantity <= 0) {
    res.status(400).json({ message: "quantity phải lớn hơn 0" });
    return null;
  }

  return { productId, variantId, quantity };
};

const getCart = async (req, res) => {
  try {
    const cart = await findCartForUser(req.user._id);

    if (!cart) {
      return res.json(buildEmptyCart(req.user._id));
    }

    await syncCartTotals(cart);
    await populateCart(cart);

    res.json(normalizeCart(cart));
  } catch (error) {
    res.status(500).json({ message: "Không thể lấy giỏ hàng", error: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const payload = validateCartItemPayload(req, res);
    if (!payload) return;

    const product = await Product.findById(payload.productId).lean();
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const variant = await Variant.findById(payload.variantId).lean();
    if (!variant) {
      return res.status(404).json({ message: "Biến thể không tồn tại" });
    }

    if (!objectIdEquals(variant.productId, product._id)) {
      return res.status(400).json({ message: "Biến thể không thuộc sản phẩm đã chọn" });
    }

    if (variant.stock < payload.quantity) {
      return res.status(400).json({ message: "Số lượng vượt quá tồn kho" });
    }

    const unitPrice = Number(product.salePrice ?? product.basePrice ?? 0);
    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = new Cart(buildEmptyCart(req.user._id));
    }

    const existingItem = cart.items.find(
      (item) =>
        objectIdEquals(item.productId, payload.productId) &&
        objectIdEquals(item.variantId, payload.variantId)
    );

    if (existingItem) {
      const nextQuantity = Number(existingItem.quantity) + payload.quantity;
      if (nextQuantity > variant.stock) {
        return res.status(400).json({ message: "Số lượng trong giỏ vượt quá tồn kho" });
      }
      existingItem.quantity = nextQuantity;
      existingItem.price = unitPrice;
    } else {
      cart.items.push({
        productId: payload.productId,
        variantId: payload.variantId,
        quantity: payload.quantity,
        price: unitPrice,
      });
    }

    await syncCartTotals(cart);
    await populateCart(cart);

    res.status(200).json(normalizeCart(cart));
  } catch (error) {
    res.status(500).json({ message: "Không thể thêm sản phẩm vào giỏ", error: error.message });
  }
};

const updateCartItemQuantity = async (req, res) => {
  try {
    const payload = validateCartItemPayload(req, res);
    if (!payload) return;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }

    const item = cart.items.find(
      (entry) =>
        objectIdEquals(entry.productId, payload.productId) &&
        objectIdEquals(entry.variantId, payload.variantId)
    );

    if (!item) {
      return res.status(404).json({ message: "Sản phẩm không có trong giỏ hàng" });
    }

    const variant = await Variant.findById(payload.variantId).lean();
    if (!variant) {
      return res.status(404).json({ message: "Biến thể không tồn tại" });
    }

    if (payload.quantity > variant.stock) {
      return res.status(400).json({ message: "Số lượng vượt quá tồn kho" });
    }

    item.quantity = payload.quantity;
    await syncCartTotals(cart);
    await populateCart(cart);

    res.json(normalizeCart(cart));
  } catch (error) {
    res.status(500).json({ message: "Không thể cập nhật số lượng", error: error.message });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const productId = req.params.productId || req.body.productId;
    const variantId = req.params.variantId || req.body.variantId;

    if (!mongoose.isValidObjectId(productId) || !mongoose.isValidObjectId(variantId)) {
      return res.status(400).json({ message: "productId và variantId không hợp lệ" });
    }

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    }

    cart.items = cart.items.filter(
      (item) =>
        !objectIdEquals(item.productId, productId) || !objectIdEquals(item.variantId, variantId)
    );

    await syncCartTotals(cart);
    await populateCart(cart);

    res.json(normalizeCart(cart));
  } catch (error) {
    res.status(500).json({ message: "Không thể xóa sản phẩm khỏi giỏ", error: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.json(buildEmptyCart(req.user._id));
    }

    cart.items = [];
    cart.couponCode = null;
    cart.discountAmount = 0;
    cart.subtotal = 0;
    cart.totalPrice = 0;
    await cart.save();

    res.json(normalizeCart(await populateCart(cart)));
  } catch (error) {
    res.status(500).json({ message: "Không thể xóa giỏ hàng", error: error.message });
  }
};

const applyCouponToCart = async (req, res) => {
  try {
    const couponCode = String(req.body.couponCode || "").trim().toUpperCase();
    if (!couponCode) {
      return res.status(400).json({ message: "couponCode là bắt buộc" });
    }

    const cart = await findCartForUser(req.user._id);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }

    const coupon = await Coupon.findOne({ code: couponCode })
      .populate("categoryIds")
      .populate("productIds");

    if (!coupon) {
      return res.status(404).json({ message: "Mã giảm giá không tồn tại" });
    }

    const now = new Date();
    if (!coupon.isActive || coupon.validFrom > now || coupon.validUntil < now) {
      return res.status(400).json({ message: "Mã giảm giá không còn hiệu lực" });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Mã giảm giá đã hết lượt sử dụng" });
    }

    const discountAmount = calculateCouponDiscount(cart, coupon);
    if (discountAmount <= 0) {
      return res.status(400).json({ message: "Mã giảm giá không áp dụng cho giỏ hàng hiện tại" });
    }

    const persistedCart = await Cart.findOne({ userId: req.user._id });
    persistedCart.couponCode = coupon.code;
    persistedCart.discountAmount = discountAmount;
    persistedCart.subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
    persistedCart.totalPrice = Math.max(persistedCart.subtotal - discountAmount, 0);

    await persistedCart.save();
    await populateCart(persistedCart);

    res.json(normalizeCart(persistedCart));
  } catch (error) {
    res.status(500).json({ message: "Không thể áp dụng mã giảm giá", error: error.message });
  }
};

export default {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  applyCouponToCart,
};
