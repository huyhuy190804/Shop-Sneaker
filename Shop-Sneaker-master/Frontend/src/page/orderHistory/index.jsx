import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Clock3, Loader2, ShoppingBag } from "lucide-react";
import { getMyOrders } from "@/services/api";

const money = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const data = await getMyOrders();
        if (mounted) setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        if (mounted) setError(err.message || "Không thể tải lịch sử đơn hàng");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const total = orders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0);
    return {
      count: orders.length,
      total,
    };
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] flex items-center justify-center">
        <div className="flex items-center gap-3 text-black/70">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang tải lịch sử đơn hàng...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-black">
      <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-10">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-semibold shadow-sm hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <header className="mt-8 mb-8">
          <p className="text-[10px] font-black tracking-[0.45em] uppercase text-black/45 mb-2">
            Purchase records
          </p>
          <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-[-0.05em]">
            ORDER HISTORY
          </h1>
          <p className="mt-3 max-w-2xl text-sm uppercase tracking-[0.35em] text-black/45">
            Review past orders and jump back into product details.
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 mb-6">
          <article className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-black tracking-[1.5px] uppercase text-[#7b7266]">Orders</p>
            <h2 className="mt-3 text-[32px] font-black tracking-[-0.05em]">{summary.count}</h2>
          </article>
          <article className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-black tracking-[1.5px] uppercase text-[#7b7266]">Total spent</p>
            <h2 className="mt-3 text-[32px] font-black tracking-[-0.05em]">{money(summary.total)}</h2>
          </article>
          <article className="rounded-3xl border border-black/10 bg-black p-5 text-white shadow-sm">
            <p className="text-[10px] font-black tracking-[1.5px] uppercase text-white/60">Shortcuts</p>
            <div className="mt-4 flex items-center gap-3 text-sm font-semibold">
              <Clock3 className="h-4 w-4" />
              Track your recent purchases
            </div>
          </article>
        </section>

        {!orders.length ? (
          <div className="rounded-[32px] border border-dashed border-black/10 bg-white/70 p-10 text-center shadow-sm">
            <ShoppingBag className="mx-auto h-12 w-12 text-black/30" />
            <h2 className="mt-4 text-2xl font-black">No orders yet</h2>
            <p className="mt-2 text-sm text-black/60">
              Your completed purchases will show up here.
            </p>
            <Link
              to="/shop-all"
              className="mt-6 inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-bold uppercase tracking-[0.15em] !text-white"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={order._id}
                className="overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-sm"
              >
                <div className="flex flex-col gap-4 p-5 md:p-6 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-[10px] font-black tracking-[1.5px] uppercase text-[#7b7266]">
                      {order.orderStatus || "Order"}
                    </p>
                    <h3 className="mt-2 text-2xl font-black tracking-[-0.05em]">
                      {order._id}
                    </h3>
                    <p className="mt-1 text-sm text-black/55">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-black tracking-[1.5px] uppercase text-[#7b7266]">
                      Total
                    </p>
                    <p className="mt-2 text-2xl font-black">{money(order.totalPrice)}</p>
                    <p className="mt-1 text-sm text-black/55">
                      {order.paymentMethod || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="border-t border-black/10 bg-[#faf7f1] p-5 md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-black tracking-[1.5px] uppercase text-[#7b7266]">
                      Products
                    </p>
                    <span className="text-[11px] font-bold text-black/55">
                      {Array.isArray(order.orderItems) ? order.orderItems.length : 0} items
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {(order.orderItems || []).map((item, index) => (
                      <Link
                        key={`${item.productId}-${item.variantId || index}`}
                        to={item.productId ? `/product-details/${item.productId}` : "/shop-all"}
                        className="flex gap-3 rounded-2xl border border-black/10 bg-white p-3 transition-colors hover:bg-[#fcfbf8]"
                      >
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-black text-white">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-semibold text-[#2d2a26]">
                            {item.name || "Unnamed item"}
                          </div>
                          <div className="mt-1 text-[11px] text-black/55">
                            {[item.color, item.size ? `Size ${item.size}` : "", item.quantity ? `Qty ${item.quantity}` : ""]
                              .filter(Boolean)
                              .join(" | ")}
                          </div>
                        </div>
                        <ChevronRight className="mt-1 h-4 w-4 text-black/30" />
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
