import mongoose from "mongoose";
import Review from "../models/reviewModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";

const isValidObjectId = (id) => mongoose.isValidObjectId(id);

const recalculateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    {
      $match: {
        productId: new mongoose.Types.ObjectId(productId),
        status: "approved",
      },
    },
    {
      $group: {
        _id: "$productId",
        averageRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  const update = stats.length
    ? {
        averageRating: Number(stats[0].averageRating.toFixed(1)),
        numReviews: stats[0].numReviews,
      }
    : {
        averageRating: 0,
        numReviews: 0,
      };

  await Product.findByIdAndUpdate(productId, update, { new: true });
};

const hasPurchasedProduct = async (userId, productId) => {
  const order = await Order.findOne({
    userId,
    "orderItems.productId": productId,
    orderStatus: { $ne: "Cancelled" },
  }).lean();

  return Boolean(order);
};

export const getReviewsForProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ message: "productId không hợp lệ" });
    }

    const reviews = await Review.find({
      productId,
      status: "approved",
    })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Không thể lấy review", error: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ message: "productId không hợp lệ" });
    }

    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "rating phải từ 1 đến 5" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }

    const purchased = await hasPurchasedProduct(req.user._id, productId);
    if (!purchased) {
      return res.status(403).json({ message: "Chỉ người đã mua sản phẩm mới được đánh giá" });
    }

    const existingReview = await Review.findOne({
      userId: req.user._id,
      productId,
    });

    if (existingReview) {
      return res.status(409).json({ message: "Bạn đã đánh giá sản phẩm này rồi" });
    }

    const review = await Review.create({
      userId: req.user._id,
      productId,
      rating: numericRating,
      comment,
      status: "pending",
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Không thể tạo review", error: error.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "review id không hợp lệ" });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review không tồn tại" });
    }

    if (String(review.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Bạn không có quyền sửa review này" });
    }

    const previousStatus = review.status;

    if (rating !== undefined) {
      const numericRating = Number(rating);
      if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ message: "rating phải từ 1 đến 5" });
      }
      review.rating = numericRating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    review.status = "pending";
    const updatedReview = await review.save();

    if (previousStatus === "approved") {
      await recalculateProductRating(review.productId);
    }

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: "Không thể cập nhật review", error: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "review id không hợp lệ" });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review không tồn tại" });
    }

    if (String(review.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Bạn không có quyền xóa review này" });
    }

    const productId = review.productId;
    const wasApproved = review.status === "approved";

    await review.deleteOne();

    if (wasApproved) {
      await recalculateProductRating(productId);
    }

    res.json({ message: "Đã xóa review" });
  } catch (error) {
    res.status(500).json({ message: "Không thể xóa review", error: error.message });
  }
};

export const getAllReviewsAdmin = async (req, res) => {
  try {
    const { status, productId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (productId && isValidObjectId(productId)) filter.productId = productId;

    const reviews = await Review.find(filter)
      .populate("userId", "name email")
      .populate("productId", "name slug productImages")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Không thể lấy danh sách review", error: error.message });
  }
};

export const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "review id không hợp lệ" });
    }

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "status không hợp lệ" });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review không tồn tại" });
    }

    review.status = status;
    const updatedReview = await review.save();

    await recalculateProductRating(review.productId);

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: "Không thể cập nhật trạng thái review", error: error.message });
  }
};
