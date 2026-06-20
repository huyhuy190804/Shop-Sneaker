import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCart,
  applyCouponToCart,
  getUserProfile,
  createOrder,
  confirmPayment,
} from "@/services/api";
import { Loader2, ArrowLeft } from "lucide-react";
import vietQrImage from "@/assets/QR.png";

const money = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const emptyCheckoutAddress = {
  shippingAddress: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

const getAddressLine = (address) =>
  [
    address?.street,
    address?.city,
    address?.state,
    address?.zipCode,
    address?.country,
  ]
    .filter(Boolean)
    .join(", ");

const getUsableAddresses = (addresses = []) =>
  (Array.isArray(addresses) ? addresses : []).filter((address) =>
    [
      address?.street,
      address?.city,
      address?.state,
      address?.zipCode,
      address?.country,
    ].some(Boolean),
  );

const splitName = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    discountAmount: 0,
    totalPrice: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressKey, setSelectedAddressKey] = useState("new");
  const [orderConfirmation, setOrderConfirmation] = useState(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [confirmationError, setConfirmationError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    phoneNumber: "",
    firstName: "",
    lastName: "",
    shippingAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    paymentMethod: "COD",
    shippingMethod: "standard",
  });

  const isUsingSavedAddress = selectedAddressKey !== "new";

  const applyAddressToForm = (address) => {
    setFormData((prev) => ({
      ...prev,
      shippingAddress: address?.street || "",
      city: address?.city || "",
      state: address?.state || "",
      postalCode: address?.zipCode || "",
      country: address?.country || "",
    }));
  };

  // Load cart and user data
  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        setLoading(true);
        const cartData = await getCart();
        setCart(
          cartData || {
            items: [],
            subtotal: 0,
            discountAmount: 0,
            totalPrice: 0,
          },
        );

        const fallbackUser = getStoredUser();
        const profile = await getUserProfile().catch(() => fallbackUser);
        const profileName = splitName(profile?.name || "");
        const addresses = getUsableAddresses(profile?.shippingAddresses);
        const defaultAddressIndex = addresses.findIndex(
          (address) => address.isDefault,
        );
        const selectedIndex =
          defaultAddressIndex >= 0 ? defaultAddressIndex : 0;
        const selectedAddress = addresses[selectedIndex];

        setSavedAddresses(addresses);
        setSelectedAddressKey(selectedAddress ? String(selectedIndex) : "new");

        setFormData((prev) => ({
          ...prev,
          email: profile?.email || prev.email,
          phoneNumber: profile?.phone || prev.phoneNumber,
          firstName:
            profile?.firstName || profileName.firstName || prev.firstName,
          lastName: profile?.lastName || profileName.lastName || prev.lastName,
          ...(selectedAddress
            ? {
                shippingAddress: selectedAddress.street || "",
                city: selectedAddress.city || "",
                state: selectedAddress.state || "",
                postalCode: selectedAddress.zipCode || "",
                country: selectedAddress.country || "",
              }
            : emptyCheckoutAddress),
        }));
      } catch (err) {
        setError("Không thể tải dữ liệu giỏ hàng");
      } finally {
        setLoading(false);
      }
    };

    loadCheckoutData();
  }, []);

  // Redirect to cart if empty
  useEffect(() => {
    if (
      !loading &&
      !orderConfirmation &&
      (!cart?.items || cart.items.length === 0)
    ) {
      navigate("/cart");
    }
  }, [loading, cart?.items, orderConfirmation, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectSavedAddress = (index) => {
    setSelectedAddressKey(String(index));
    applyAddressToForm(savedAddresses[index]);
  };

  const handleAddNewAddress = () => {
    setSelectedAddressKey("new");
    setFormData((prev) => ({
      ...prev,
      email: "",
      phoneNumber: "",
      firstName: "",
      lastName: "",
      ...emptyCheckoutAddress,
    }));
  };

  const handleCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setSubmitting(true);
    setError("");
    setMessage("");

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

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validate form
    if (
      !formData.email ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.shippingAddress ||
      !formData.city ||
      !formData.postalCode
    ) {
      setError("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    const orderTotal =
      (cart.totalPrice || 0) +
      (formData.shippingMethod === "express" ? 50000 : 15000) +
      Math.round((cart.totalPrice || 0) * 0.08);
    const orderCustomerName = [formData.firstName, formData.lastName]
      .filter(Boolean)
      .join(" ");
    const orderDeliveryAddress = [
      formData.shippingAddress,
      formData.city,
      formData.state,
      formData.postalCode,
      formData.country,
    ]
      .filter(Boolean)
      .join(", ");
    const shippingAddress = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.shippingAddress,
      city: formData.city,
      state: formData.state,
      postalCode: formData.postalCode,
      country: formData.country,
    };

    setOrderConfirmation({
      paymentMethod: formData.paymentMethod,
      customerName: orderCustomerName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      shippingMethod: formData.shippingMethod,
      shippingAddress,
      deliveryAddress: orderDeliveryAddress,
      total: orderTotal,
    });
    setConfirmationError("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-700">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  const shippingCost = formData.shippingMethod === "express" ? 50000 : 15000;
  const tax = Math.round(cart.totalPrice * 0.08);
  const finalTotal = (cart.totalPrice || 0) + shippingCost + tax;
  const isBankTransferConfirmation =
    orderConfirmation?.paymentMethod === "BankTransfer";
  const handleCancelConfirmation = () => {
    setOrderConfirmation(null);
    setConfirmationError("");
  };
  const handleConfirmPayment = async () => {
    if (!orderConfirmation) return;
    setConfirmationError("");
    setPaymentSubmitting(true);

    let orderId = orderConfirmation.orderId;

    try {
      if (!orderId) {
        const orderData = await createOrder({
          shippingAddress: orderConfirmation.shippingAddress,
          paymentMethod: orderConfirmation.paymentMethod,
          shippingMethod: orderConfirmation.shippingMethod,
        });

        orderId = orderData._id;
        setOrderConfirmation((prev) => ({
          ...prev,
          orderId,
        }));

        setCart({
          items: [],
          subtotal: 0,
          discountAmount: 0,
          totalPrice: 0,
        });
        window.dispatchEvent(new Event("cart-updated"));
      }

      if (isBankTransferConfirmation) {
        await confirmPayment(orderId, {
          paymentResult: {
            status: "paid",
            email_address: orderConfirmation.email,
          },
        });
      }

      navigate("/order-success", {
        state: { orderId },
      });
    } catch (err) {
      setConfirmationError(err.message || "Không thể xác nhận đơn hàng");
    } finally {
      setPaymentSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-black">SOLESTYLE</h1>
            </div>
            <button
              onClick={() => navigate("/cart")}
              className="flex items-center gap-2 text-slate-600 hover:text-black"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">01</span>
              <span className="text-xs font-bold text-slate-400">CART</span>
            </div>
            <div className="flex-1 h-px bg-slate-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-black">02</span>
              <span className="text-xs font-bold text-black">CHECKOUT</span>
            </div>
            <div className="flex-1 h-px bg-slate-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">03</span>
              <span className="text-xs font-bold text-slate-400">SUCCESS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-4xl font-black text-black mb-12">
          COMPLETE THE FIT.
        </h2>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div className="grid gap-12 lg:grid-cols-[1.6fr_0.9fr]">
            {/* Left Column - Cart Items & Form */}
            <div className="space-y-8">
              {/* Cart Items */}
              <div className="bg-slate-50 rounded-lg p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-black mb-6">
                  YOUR CART ({cart.items?.length || 0})
                </h3>

                <div className="space-y-6 mb-6">
                  {cart.items?.map((item) => {
                    const title = item.product?.name || "Sản phẩm";
                    const image =
                      item.product?.productImages?.[0] ||
                      "https://via.placeholder.com/100";
                    const variantLabel = [
                      item.variant?.color,
                      item.variant?.size,
                    ]
                      .filter(Boolean)
                      .join(" / ");

                    return (
                      <div
                        key={`${item.productId}-${item.variantId}`}
                        className="flex gap-4 pb-6 border-b border-slate-200 last:border-b-0 last:pb-0"
                      >
                        <img
                          src={image}
                          alt={title}
                          className="w-20 h-20 rounded object-cover bg-white"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-black text-sm">
                            {title}
                          </h4>
                          <p className="text-xs text-slate-600 mb-2">
                            REF: SNK-
                            {Math.random()
                              .toString()
                              .slice(2, 8)
                              .toUpperCase()}{" "}
                            / {variantLabel}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-600">
                              QTY: {item.quantity}
                            </span>
                            <span className="font-bold text-black">
                              {money(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Promo Code */}
                <div className="border-t border-slate-200 pt-6">
                  <label className="text-xs font-bold uppercase tracking-wider text-black block mb-3">
                    PROMO CODE
                  </label>
                  <form onSubmit={handleCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="ENTER CODE"
                      className="flex-1 px-4 py-3 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:border-black"
                      disabled={submitting}
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-black text-white text-xs font-bold rounded hover:bg-slate-800 disabled:opacity-50"
                      disabled={submitting}
                    >
                      APPLY
                    </button>
                  </form>
                </div>
              </div>

              {/* Shipping Details */}
              <div>
                <h3 className="text-xl font-bold text-black mb-6 uppercase tracking-wider">
                  SHIPPING DETAILS
                </h3>

                <div className="space-y-4">
                  {savedAddresses.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <label className="block text-xs font-bold uppercase text-black">
                          SAVED ADDRESS
                        </label>
                        <button
                          type="button"
                          onClick={handleAddNewAddress}
                          className={`shrink-0 rounded bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white transition hover:bg-blue-700 ${
                            selectedAddressKey === "new"
                              ? "ring-2 ring-blue-200"
                              : ""
                          }`}
                        >
                          Add New
                        </button>
                      </div>
                      <div className="-mx-1 overflow-x-auto px-1 pb-2">
  <div className="flex gap-3">
    {savedAddresses.map((address, index) => (
      <button
        key={`checkout-address-${index}`}
        type="button"
        onClick={() => handleSelectSavedAddress(index)}
        className={`min-h-[96px] w-full max-w-[300px] shrink-0 rounded border-2 p-4 text-left transition ${
          selectedAddressKey === String(index)
            ? "border-black bg-black text-white"
            : "border-slate-300 bg-white text-black hover:border-black"
        }`}
      >
        <span className="block text-xs font-black uppercase tracking-wider">
          Address {index + 1}
        </span>
        <span className="mt-2 block text-xs leading-5 opacity-80">
          {getAddressLine(address)}
        </span>
      </button>
    ))}
  </div>
</div>  
                    </div>
                  )}

                  {/* Email & Phone Number */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-black mb-2">
                        EMAIL ADDRESS
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="alex.v@design-studio.com"
                        className="w-full px-4 py-3 border border-slate-300 rounded bg-white focus:outline-none focus:border-black text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-black mb-2">
                        PHONE NUMBER
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="+84 123 456 789"
                        className="w-full px-4 py-3 border border-slate-300 rounded bg-white focus:outline-none focus:border-black text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-black mb-2">
                        FIRST NAME
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="ALEX"
                        className="w-full px-4 py-3 border border-slate-300 rounded bg-white focus:outline-none focus:border-black text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-black mb-2">
                        LAST NAME
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="VANCE"
                        className="w-full px-4 py-3 border border-slate-300 rounded bg-white focus:outline-none focus:border-black text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-black mb-2">
                      SHIPPING ADDRESS
                    </label>
                    <input
                      type="text"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      placeholder="123 BRUTALIST AVENUE"
                      disabled={isUsingSavedAddress}
                      className="w-full px-4 py-3 border border-slate-300 rounded bg-white focus:outline-none focus:border-black text-sm disabled:bg-slate-100 disabled:text-slate-600"
                      required
                    />
                  </div>

                  {/* City & Postal Code */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-black mb-2">
                        CITY
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="NEW YORK"
                        disabled={isUsingSavedAddress}
                        className="w-full px-4 py-3 border border-slate-300 rounded bg-white focus:outline-none focus:border-black text-sm disabled:bg-slate-100 disabled:text-slate-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-black mb-2">
                        POSTAL CODE
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="10001"
                        disabled={isUsingSavedAddress}
                        className="w-full px-4 py-3 border border-slate-300 rounded bg-white focus:outline-none focus:border-black text-sm disabled:bg-slate-100 disabled:text-slate-600"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-xl font-bold text-black mb-6 uppercase tracking-wider">
                  PAYMENT METHOD
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`p-6 border-2 rounded cursor-pointer text-center transition ${
                      formData.paymentMethod === "COD"
                        ? "border-black bg-black text-white"
                        : "border-slate-300 bg-white text-black hover:border-black"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === "COD"}
                      onChange={handleInputChange}
                      className="hidden"
                    />
                    <div className="text-2xl mb-2">🚚</div>
                    <span className="font-bold uppercase text-sm">
                      CASH ON DELIVERY (COD)
                    </span>
                  </label>

                  <label
                    className={`p-6 border-2 rounded cursor-pointer text-center transition ${
                      formData.paymentMethod === "BankTransfer"
                        ? "border-black bg-black text-white"
                        : "border-slate-300 bg-white text-black hover:border-black"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BankTransfer"
                      checked={formData.paymentMethod === "BankTransfer"}
                      onChange={handleInputChange}
                      className="hidden"
                    />
                    <div className="text-2xl mb-2">📱</div>
                    <span className="font-bold uppercase text-sm">
                      BANK TRANSFER
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="h-fit sticky top-4">
              <div className="bg-black text-white rounded-lg p-8">
                <h3 className="text-lg font-bold uppercase tracking-wider mb-8">
                  ORDER SUMMARY
                </h3>

                <div className="space-y-4 mb-8 border-b border-slate-700 pb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">SUBTOTAL</span>
                    <span className="font-bold">
                      {money(cart.subtotal || 0)}
                    </span>
                  </div>

                  {cart.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">DISCOUNT</span>
                      <span className="font-bold text-emerald-400">
                        -{money(cart.discountAmount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      SHIPPING ({formData.shippingMethod})
                    </span>
                    <span className="font-bold">{money(shippingCost)}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">ESTIMATED TAX</span>
                    <span className="font-bold">{money(tax)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-8">
                  <span className="text-slate-400 uppercase text-sm">
                    TOTAL
                  </span>
                  <span className="text-3xl font-bold">
                    {money(finalTotal)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded uppercase tracking-wider transition"
                >
                  {submitting ? "Processing..." : "COMPLETE ORDER"}
                </button>

                <div className="text-xs text-slate-500 mt-4 text-center">
                  <p>🔒 SECURE 256-BIT SSL CHECKOUT</p>
                </div>

                <div className="text-xs text-slate-400 mt-6 pt-6 border-t border-slate-700">
                  <p>
                    *THE MONOLITH SNEAKERS IS DESIGNED FOR ENDURANCE. EVERY STEP
                    IS AN ARCHITECTURAL STATEMENT.*
                  </p>
                  <p className="mt-3 font-bold">CHIEF DESIGNER, SOLESTYLE</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {orderConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 text-black shadow-2xl">
            {isBankTransferConfirmation ? (
              <>
                <div className="mb-5">
                  <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-600">
                    QR CODE PAYMENT
                  </p>
                  <h2 className="mt-2 text-2xl font-black uppercase">
                    Xác nhận thanh toán
                  </h2>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <img
                    src={vietQrImage}
                    alt="VietQR payment code"
                    className="mx-auto w-full max-w-[320px] rounded"
                  />
                </div>

                <div className="mt-5 space-y-3 rounded-lg border border-slate-200 p-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="font-bold uppercase text-slate-500">
                      Tên người dùng
                    </span>
                    <span className="text-right font-semibold">
                      {orderConfirmation.customerName || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="font-bold uppercase text-slate-500">
                      SĐT
                    </span>
                    <span className="text-right font-semibold">
                      {orderConfirmation.phoneNumber || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="font-bold uppercase text-slate-500">
                      Mail
                    </span>
                    <span className="text-right font-semibold">
                      {orderConfirmation.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="font-bold uppercase text-slate-500">
                      Giao đến
                    </span>
                    <span className="text-right font-semibold">
                      {orderConfirmation.shippingMethod || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="font-bold uppercase text-slate-500">
                      Địa chỉ
                    </span>
                    <span className="max-w-[62%] text-right font-semibold">
                      {orderConfirmation.deliveryAddress || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-slate-200 pt-3">
                    <span className="font-bold uppercase text-slate-500">
                      Tổng tiền
                    </span>
                    <span className="text-right text-lg font-black">
                      {money(orderConfirmation.total)}
                    </span>
                  </div>
                </div>

                {confirmationError && (
                  <div className="mt-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {confirmationError}
                  </div>
                )}

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleCancelConfirmation}
                    disabled={paymentSubmitting}
                    className="rounded border-2 border-slate-300 px-5 py-4 text-sm font-black uppercase tracking-wider text-slate-700 transition hover:border-black hover:text-black disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    disabled={paymentSubmitting}
                    className="rounded bg-blue-600 px-5 py-4 text-sm font-black uppercase tracking-wider text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {paymentSubmitting
                      ? "Đang xác nhận..."
                      : "Xác nhận thanh toán"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <span className="text-3xl font-black text-emerald-600">
                    ✓
                  </span>
                </div>
                <p className="text-center text-xs font-black uppercase tracking-[0.25em] text-emerald-600">
                  Cash on delivery
                </p>
                <h2 className="mt-2 text-center text-2xl font-black uppercase">
                  Xác nhận đơn hàng thành công
                </h2>
                <p className="mt-3 text-center text-sm text-slate-600">
                  Đơn hàng của bạn đã được tạo. Vui lòng xác nhận để xem thông
                  tin đơn hàng.
                </p>
                {confirmationError && (
                  <div className="mt-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {confirmationError}
                  </div>
                )}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleCancelConfirmation}
                    disabled={paymentSubmitting}
                    className="rounded border-2 border-slate-300 px-5 py-4 text-sm font-black uppercase tracking-wider text-slate-700 transition hover:border-black hover:text-black disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    disabled={paymentSubmitting}
                    className="rounded bg-black px-5 py-4 text-sm font-black uppercase tracking-wider text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    {paymentSubmitting ? "Đang xác nhận..." : "Xác nhận"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
