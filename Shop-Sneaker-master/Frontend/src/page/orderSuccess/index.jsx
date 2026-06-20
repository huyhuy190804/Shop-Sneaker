import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { getOrderById } from "@/services/api";

const money = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const state = location.state;
    if (!state?.orderId) {
      const timer = setTimeout(() => navigate("/"), 2000);
      return () => clearTimeout(timer);
    }

    setOrderId(state.orderId);

    let mounted = true;
    const loadOrder = async () => {
      setLoading(true);
      try {
        const data = await getOrderById(state.orderId);
        if (mounted) setOrder(data);
      } catch {
        // Order ID from navigation state is still shown if fetch fails
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadOrder();

    return () => {
      mounted = false;
    };
  }, [location.state, navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-pulse"></div>
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-white" strokeWidth={3} />
              </div>
            </div>
          </div>
        </div>

        {/* Header */}
        <h1 className="text-4xl lg:text-5xl font-black text-black mb-4">
          ORDER SUCCESS
        </h1>

        {/* Progress */}
        <div className="flex items-center justify-center gap-8 mb-8 text-xs font-bold uppercase tracking-wider">
          <span className="text-slate-400">01 CART</span>
          <div className="flex-1 h-px bg-slate-300 max-w-12"></div>
          <span className="text-slate-400">02 CHECKOUT</span>
          <div className="flex-1 h-px bg-slate-300 max-w-12"></div>
          <span className="text-black">03 SUCCESS</span>
        </div>

        {/* Order Details */}
        <div className="mb-8">
          <p className="text-slate-600 text-lg mb-4">
            Thank you for your purchase!
          </p>
          {loading && (
            <div className="mb-4 flex items-center justify-center gap-2 text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading order details...</span>
            </div>
          )}
          {orderId && (
            <div className="inline-block bg-slate-50 border border-slate-200 rounded-lg px-6 py-4 mb-4">
              <p className="text-xs text-slate-600 uppercase tracking-wide mb-1">
                Order Number
              </p>
              <p className="text-2xl font-black text-black font-mono">
                {orderId.slice(-8).toUpperCase()}
              </p>
              {order && (
                <div className="mt-4 space-y-1 text-sm text-slate-600">
                  <p>
                    Status:{" "}
                    <span className="font-semibold text-black">
                      {order.orderStatus}
                    </span>
                  </p>
                  <p>
                    Total:{" "}
                    <span className="font-semibold text-black">
                      {money(order.totalPrice)}
                    </span>
                  </p>
                  <p>
                    Payment:{" "}
                    <span className="font-semibold text-black">
                      {order.paymentMethod}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
          <p className="text-slate-600">
            A confirmation email has been sent to your inbox with order details
            and tracking information.
          </p>
        </div>

        {/* Quote */}
        <div className="mb-8 py-6 border-y border-slate-200 max-w-lg mx-auto">
          <p className="text-xs text-slate-500 italic">
            "Every step is an architectural statement. Your order represents
            more than a purchase—it's a commitment to excellence."
          </p>
          <p className="text-xs text-slate-600 font-bold mt-3">— SOLESTYLE</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/order-history")}
            className="px-8 py-3 bg-black text-white font-bold uppercase tracking-wider rounded hover:bg-slate-800 transition"
          >
            View Order History
          </button>
          <button
            onClick={() => navigate("/shop-all")}
            className="px-8 py-3 border-2 border-black text-black font-bold uppercase tracking-wider rounded hover:bg-black hover:text-white transition"
          >
            Continue Shopping
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-slate-200 text-xs text-slate-500">
          <p className="mb-2">🔒 Your transaction is secure and encrypted</p>
          <p>Need help? Contact our support team</p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
