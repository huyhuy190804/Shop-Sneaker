import { useEffect, useMemo, useState } from "react";
import {
  applyCouponToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
} from "@/services/api";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Ticket,
} from "lucide-react";

const money = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    discountAmount: 0,
    totalPrice: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const refreshCart = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getCart();
      setCart(
        data || { items: [], subtotal: 0, discountAmount: 0, totalPrice: 0 },
      );
    } catch (err) {
      setError(err.message || "Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const summary = useMemo(() => {
    const itemCount =
      cart.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) ||
      0;
    return { itemCount };
  }, [cart.items]);

  const updateQuantity = async (item, quantity) => {
    setSubmitting(true);
    setError("");

    try {
      const data = await updateCartItemQuantity({
        productId: item.productId,
        variantId: item.variantId,
        quantity,
      });
      setCart(data);
      setMessage("Đã cập nhật số lượng");
    } catch (err) {
      setError(err.message || "Không thể cập nhật số lượng");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (item) => {
    setSubmitting(true);
    setError("");

    try {
      const data = await removeCartItem({
        productId: item.productId,
        variantId: item.variantId,
      });
      setCart(data);
      setMessage("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch (err) {
      setError(err.message || "Không thể xóa sản phẩm");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = async () => {
    setSubmitting(true);
    setError("");

    try {
      const data = await clearCart();
      setCart(data);
      setMessage("Đã xóa toàn bộ giỏ hàng");
    } catch (err) {
      setError(err.message || "Không thể xóa giỏ hàng");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCoupon = async (event) => {
    event.preventDefault();
    if (!couponCode.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const data = await applyCouponToCart(couponCode.trim());
      setCart(data);
      setMessage("Đã áp dụng mã giảm giá");
      setCouponCode("");
    } catch (err) {
      setError(err.message || "Không thể áp dụng mã giảm giá");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-amber-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-700">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang tải giỏ hàng...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-amber-50">
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 mb-2">
              Shopping Cart
            </p>
            <h1 className="text-3xl lg:text-4xl font-black text-slate-900">
              Giỏ hàng của bạn
            </h1>
            <p className="text-slate-600 mt-2">
              {summary.itemCount} sản phẩm trong giỏ
            </p>
          </div>

          <Link
            to="/shop-all"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
          >
            <ArrowLeft className="w-4 h-4" />
            Tiếp tục mua sắm
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
            {message}
          </div>
        )}

        {!cart?.items?.length ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Giỏ hàng trống
            </h2>
            <p className="text-slate-600 mb-6">
              Thêm một đôi sneaker yêu thích để bắt đầu đặt hàng.
            </p>
            <Link
              to="/shop-all"
              className="inline-flex items-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold !text-white hover:bg-slate-800"
            >
              Mua ngay
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.6fr_0.9fr]">
            <div className="space-y-4">
              {cart.items.map((item) => {
                const title = item.product?.name || "Sản phẩm";
                const image =
                  item.product?.productImages?.[0] ||
                  "https://via.placeholder.com/240";
                const variantLabel = [item.variant?.color, item.variant?.size]
                  .filter(Boolean)
                  .join(" / ");

                return (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex gap-4">
                      <img
                        src={image}
                        alt={title}
                        className="h-24 w-24 rounded-2xl object-cover bg-slate-100"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2 className="text-lg font-bold text-slate-900 truncate">
                              {title}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                              {variantLabel}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                              Giá: {money(item.price)}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => handleRemove(item)}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:border-red-300 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Xóa
                          </button>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50">
                            <button
                              type="button"
                              disabled={submitting || item.quantity <= 1}
                              onClick={() =>
                                updateQuantity(item, item.quantity - 1)
                              }
                              className="px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="min-w-12 px-3 text-center text-sm font-semibold text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={submitting}
                              onClick={() =>
                                updateQuantity(item, item.quantity + 1)
                              }
                              className="px-3 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                              Thành tiền
                            </p>
                            <p className="text-lg font-black text-slate-900">
                              {money(item.lineTotal)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-black text-slate-900 mb-4">
                  Tóm tắt đơn hàng
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Tạm tính</span>
                    <span>{money(cart.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Giảm giá</span>
                    <span>- {money(cart.discountAmount)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-base font-black text-slate-900">
                    <span>Tổng cộng</span>
                    <span>{money(cart.totalPrice)}</span>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <Link
                    to="/checkout"
                    className="w-full block text-center rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold !text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    Tiến hành thanh toán
                  </Link>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleClear}
                    className="w-full rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400 disabled:opacity-50"
                  >
                    Xóa toàn bộ giỏ hàng
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleCoupon}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Ticket className="w-4 h-4" />
                  Mã giảm giá
                </label>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(event) => setCouponCode(event.target.value)}
                    placeholder="Nhập mã giảm giá"
                    className="flex-1 rounded-full border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold !text-white hover:bg-slate-800 disabled:opacity-50"
                  >
                    Áp dụng
                  </button>
                </div>
                {cart.couponCode && (
                  <p className="mt-3 text-sm text-emerald-700">
                    Đang áp dụng: {cart.couponCode}
                  </p>
                )}
              </form>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
