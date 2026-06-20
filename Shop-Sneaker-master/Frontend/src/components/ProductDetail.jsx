import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  ShoppingCart,
  Share2,
  Truck,
  RotateCcw,
  Shield,
} from "lucide-react";
import { createReview, getReviewsForProduct } from "@/services/api";

const moneyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const ProductDetail = ({ product, onClose, onAddToCart }) => {
  const safeProduct = product || {};
  const sizes = safeProduct.sizes || [];
  const colors = safeProduct.colors || ["black"];
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });

  const productId = safeProduct.backendProductId || safeProduct._id || safeProduct.id;
  const canReview = useMemo(
    () => /^[a-f\d]{24}$/i.test(String(productId || "")),
    [productId]
  );

  if (!product) return null;

  useEffect(() => {
    let cancelled = false;

    const loadReviews = async () => {
      if (!canReview) {
        setReviews([]);
        return;
      }

      setReviewsLoading(true);
      setReviewsError("");

      try {
        const data = await getReviewsForProduct(productId);
        if (!cancelled) {
          setReviews(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!cancelled) {
          setReviewsError(error.message || "Không thể tải review");
        }
      } finally {
        if (!cancelled) {
          setReviewsLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, [canReview, productId]);

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    if (!canReview) {
      setReviewMessage("Review chỉ áp dụng cho sản phẩm thật.");
      return;
    }

    setReviewSubmitting(true);
    setReviewsError("");
    setReviewMessage("");

    try {
      await createReview(productId, reviewForm);
      setReviewMessage("Đã gửi đánh giá, đang chờ duyệt.");
      setReviewForm({ rating: 5, comment: "" });
      const data = await getReviewsForProduct(productId);
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      setReviewsError(error.message || "Không thể gửi review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-5xl w-full">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          >
            ✕
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="flex items-center justify-center bg-gray-100 rounded-lg aspect-square">
              <img
                src={safeProduct.image}
                alt={safeProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-between">
              {/* Header */}
              <div>
                <p className="text-gray-600 uppercase text-xs tracking-widest mb-2">
                  {safeProduct.collection}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {safeProduct.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < Math.floor(safeProduct.rating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {safeProduct.rating} ({Math.floor(Math.random() * 100) + 50}{" "}
                    reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-3xl font-bold text-gray-900">
                    {moneyFormatter.format(Number(safeProduct.price || 0))}
                  </span>
                  {safeProduct.originalPrice !== safeProduct.price && (
                    <span className="text-lg text-gray-500 line-through ml-2">
                      {moneyFormatter.format(
                        Number(safeProduct.originalPrice || 0),
                      )}
                    </span>
                  )}
                </div>

                <p className="text-gray-700 mb-6">{safeProduct.description}</p>

                {/* Size Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Select Size
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                          selectedSize === size
                            ? "bg-black text-white"
                            : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Select Color
                  </label>
                  <div className="flex gap-3">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === color
                            ? "border-black scale-110"
                            : "border-gray-300"
                        }`}
                        style={{
                          backgroundColor:
                            color === "black"
                              ? "#000000"
                              : color === "white"
                                ? "#FFFFFF"
                                : color === "gray"
                                  ? "#808080"
                                  : color === "red"
                                    ? "#FF0000"
                                    : color === "blue"
                                      ? "#0000FF"
                                      : color === "neon"
                                        ? "#00FF00"
                                        : "#808080",
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-12 text-center border-none focus:outline-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() =>
                    onAddToCart?.({
                      product,
                      quantity,
                      size: selectedSize,
                      color: selectedColor,
                    })
                  }
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  ADD TO CART
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`flex-1 py-3 rounded-lg font-bold transition-colors border-2 flex items-center justify-center gap-2 ${
                      isFavorite
                        ? "bg-red-50 text-red-600 border-red-600"
                        : "bg-white text-gray-900 border-gray-300 hover:border-red-600"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${isFavorite ? "fill-red-600" : ""}`}
                    />
                  </button>
                  <button className="flex-1 py-3 rounded-lg font-bold border-2 border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center gap-2">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="border-t border-gray-200 pt-6 mt-6 space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Free Shipping</p>
                    <p className="text-gray-600">
                      On orders over {moneyFormatter.format(1000000)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RotateCcw className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      30 Day Returns
                    </p>
                    <p className="text-gray-600">Easy returns and exchanges</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-gray-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Authentic</p>
                    <p className="text-gray-600">100% authentic guarantee</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Reviews</h2>

                {!canReview ? (
                  <p className="text-sm text-gray-500 mb-4">
                    Review sẽ hiển thị khi sản phẩm có ID thật từ backend.
                  </p>
                ) : (
                  <form onSubmit={handleSubmitReview} className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-semibold text-gray-900">
                        Rating
                      </label>
                      <select
                        value={reviewForm.rating}
                        onChange={(e) =>
                          setReviewForm((prev) => ({
                            ...prev,
                            rating: Number(e.target.value),
                          }))
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      >
                        <option value={5}>5</option>
                        <option value={4}>4</option>
                        <option value={3}>3</option>
                        <option value={2}>2</option>
                        <option value={1}>1</option>
                      </select>
                    </div>

                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) =>
                        setReviewForm((prev) => ({
                          ...prev,
                          comment: e.target.value,
                        }))
                      }
                      placeholder="Viết cảm nhận của bạn..."
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
                    />

                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {reviewSubmitting ? "Đang gửi..." : "Gửi review"}
                    </button>
                  </form>
                )}

                {reviewMessage && (
                  <p className="mb-4 text-sm text-emerald-600">{reviewMessage}</p>
                )}

                {reviewsError && (
                  <p className="mb-4 text-sm text-red-600">{reviewsError}</p>
                )}

                {reviewsLoading ? (
                  <p className="text-sm text-gray-500">Đang tải review...</p>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {review.userId?.name || "Anonymous"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-yellow-600">
                            {review.rating}/5
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-700">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Chưa có review nào.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
