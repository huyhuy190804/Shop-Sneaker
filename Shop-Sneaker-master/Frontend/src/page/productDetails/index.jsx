import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  Box,
  Copy,
  Heart,
  Layers3,
  MapPin,
  Package,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Warehouse,
} from "lucide-react";
import {
  addToCart,
  addToWishlist,
  getProductById,
  getUserProfile,
  removeFromWishlist,
} from "@/services/api";
import { ensureValidAuthSession } from "@/services/authSession";

const formatPrice = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const normalizeProduct = (product) => {
  if (!product) return null;

  return {
    ...product,
    brand:
      typeof product.brand === "object"
        ? product.brand
        : { name: product.brand || "N/A" },
    category:
      typeof product.category === "object"
        ? product.category
        : { name: product.category || "N/A" },
    productImages:
      Array.isArray(product.productImages) && product.productImages.length
        ? product.productImages
        : [],
    variants:
      Array.isArray(product.variants) && product.variants.length
        ? product.variants
        : [],
  };
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(
    Boolean(id) && !location.state?.product,
  );
  const [error, setError] = useState("");
  const [product, setProduct] = useState(() =>
    normalizeProduct(location.state?.product),
  );
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProductAndWishlist = async () => {
      setLoading(true);
      setError("");

      try {
        const productData =
          location.state?.product || (await getProductById(id));
        const userProfile = await getUserProfile().catch(() => null);

        if (cancelled) {
          return;
        }

        const normalized = normalizeProduct(productData);
        setProduct(normalized);

        if (userProfile?.wishlist) {
          const isInWishlist = userProfile.wishlist.some(
            (item) => (item._id || item) === normalized._id,
          );
          setIsFavorite(isInWishlist);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(err.message || "Unable to load product details.");
        setProduct(normalizeProduct(location.state?.product));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (id || location.state?.product) {
      loadProductAndWishlist();
    }

    return () => {
      cancelled = true;
    };
  }, [id, location.state?.product]);

  const variants = product?.variants || [];
  const basePrice = product?.basePrice || 0;
  const salePrice = product?.salePrice || 0;

  const selectedVariant =
    variants.find((variant) => variant._id === selectedVariantId) ||
    variants[0];

  const galleryImages = [
    ...new Set([
      ...(Array.isArray(selectedVariant?.variantImages)
        ? selectedVariant.variantImages
        : []),
      ...(Array.isArray(product?.productImages) ? product.productImages : []),
    ]),
  ].filter(Boolean);

  const hasProduct = Boolean(product?._id);

  const saleDiscount =
    !salePrice || !basePrice || salePrice >= basePrice
      ? 0
      : Math.round(((basePrice - salePrice) / basePrice) * 100);

  const stockLabel = selectedVariant
    ? `${selectedVariant.stock} in stock`
    : "Limited stock";

  const handleCopySku = async () => {
    try {
      await navigator.clipboard.writeText(
        `${product.skuPrefix}-${selectedVariant?.sku || "SKU"}`,
      );
    } catch {
      // no-op for browsers without clipboard access
    }
  };

  const handleToggleWishlist = async () => {
    if (!ensureValidAuthSession()) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }

    if (togglingWishlist) return;

    setTogglingWishlist(true);
    try {
      if (isFavorite) {
        await removeFromWishlist({ productId: product._id });
        setIsFavorite(false);
      } else {
        await addToWishlist({ productId: product._id });
        setIsFavorite(true);
      }
    } catch (err) {
      alert(err.message || "Please log in to use this feature.");
    } finally {
      setTogglingWishlist(false);
    }
  };

  const handleAddToCart = async () => {
    if (!ensureValidAuthSession()) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }

    if (!selectedVariant?._id) {
      setActionMessage("Please select a valid variant first.");
      return;
    }

    setIsAddingToCart(true);
    setActionMessage("");

    try {
      await addToCart({
        productId: product._id,
        variantId: selectedVariant._id,
        quantity,
      });
      setActionMessage("Added to cart successfully.");
    } catch (err) {
      setActionMessage(err.message || "Unable to add item to cart.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4efe8] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-black/10 border-t-black" />
          <p className="mt-4 text-sm font-semibold text-[#5c5448]">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  if (!hasProduct) {
    return (
      <div className="min-h-screen bg-[#f4efe8] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-lg font-bold text-[#2d2822]">
            Không tìm thấy sản phẩm
          </p>
          <p className="mt-2 text-sm text-[#5c5448]">
            Sản phẩm không tồn tại hoặc đã bị xóa. Vui lòng quay lại trang danh
            sách sản phẩm.
          </p>
          <button
            onClick={() => navigate("/shop-all")}
            className="mt-5 inline-flex items-center rounded-full bg-black px-5 py-3 text-sm font-bold text-white"
          >
            Quay lại Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4efe8] text-[#111]">
      <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.14),transparent_35%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.55),transparent_30%),linear-gradient(180deg,#f7f2ea,transparent)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8 lg:px-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur hover:bg-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="hidden sm:flex items-center gap-2 rounded-full border border-black/10 bg-white/75 px-4 py-2 text-[11px] font-black tracking-[1.5px] uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            Product Details
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {error}
          </div>
        )}

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <article className="overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-[0_16px_40px_rgba(17,17,17,0.08)]">
            <div className="grid gap-0 lg:grid-cols-[1fr_110px]">
              <div className="relative aspect-square bg-[#f7f3eb]">
                <img
                  src={galleryImages[selectedImage] || galleryImages[0]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-5 top-5 flex gap-2">
                  {product.isFeatured && (
                    <span className="rounded-full bg-black px-3 py-1 text-[10px] font-black tracking-[1px] uppercase text-white">
                      Featured
                    </span>
                  )}
                  {saleDiscount > 0 && (
                    <span className="rounded-full bg-[#0f766e] px-3 py-1 text-[10px] font-black tracking-[1px] uppercase text-white">
                      -{saleDiscount}%
                    </span>
                  )}
                </div>
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                  <div className="rounded-2xl bg-black/80 px-4 py-3 text-white backdrop-blur">
                    <p className="text-[10px] font-black tracking-[1.5px] uppercase text-white/60">
                      Status
                    </p>
                    <p className="mt-1 text-sm font-bold">{product.status}</p>
                  </div>
                  <button
                    onClick={handleToggleWishlist}
                    disabled={togglingWishlist}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-70 ${
                      isFavorite
                        ? "bg-black text-white"
                        : "bg-white text-black border border-black/5"
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
                    />
                    {isFavorite ? "Wishlisted" : "Wishlist"}
                  </button>
                </div>
              </div>

              <div className="border-t border-black/10 bg-[#faf7f1] p-4 lg:border-l lg:border-t-0">
                <div className="grid grid-cols-4 gap-3 lg:grid-cols-1">
                  {galleryImages.map((image, index) => (
                    <button
                      key={image}
                      onClick={() => setSelectedImage(index)}
                      className={`overflow-hidden rounded-2xl border transition-all ${
                        selectedImage === index
                          ? "border-black ring-2 ring-black/10"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="aspect-square w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <aside className="space-y-6">
            <article className="rounded-[32px] border border-black/10 bg-white p-6 shadow-[0_16px_40px_rgba(17,17,17,0.08)]">
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-black tracking-[1.5px] uppercase text-[#736a5e]">
                <span>{product.brand?.name}</span>
                <span className="h-1 w-1 rounded-full bg-black/25" />
                <span>{product.category?.name}</span>
                <span className="h-1 w-1 rounded-full bg-black/25" />
                <span>{product.skuPrefix}</span>
              </div>

              <h1 className="mt-4 text-[32px] leading-[0.95] font-black tracking-[-1.8px] md:text-[42px]">
                {product.name}
              </h1>
              <p className="mt-4 text-sm leading-6 text-[#5d564b]">
                {product.description}
              </p>

              <div className="mt-5 flex items-end gap-3">
                <div className="text-[34px] font-black tracking-[-1.5px] text-black">
                  {formatPrice(product.salePrice || product.basePrice)}
                </div>
                {product.salePrice && product.salePrice < product.basePrice && (
                  <div className="pb-1 text-sm text-[#8c8477] line-through">
                    {formatPrice(product.basePrice)}
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`h-4 w-4 ${index < Math.floor(product.averageRating) ? "fill-[#f59e0b] text-[#f59e0b]" : "text-[#d6cfc3]"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-[#5d564b]">
                    {product.averageRating} rating
                  </span>
                </div>
                <div className="text-sm font-semibold text-[#5d564b]">
                  {product.numReviews} reviews
                </div>
                <div className="text-sm font-semibold text-[#5d564b]">
                  {stockLabel}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-[#f7f3eb] p-4">
                  <p className="text-[10px] font-black tracking-[1.5px] uppercase text-[#8c8477]">
                    Brand
                  </p>
                  <p className="mt-2 text-sm font-bold">
                    {product.brand?.name}
                  </p>
                </div>
                <div className="rounded-2xl bg-[#f7f3eb] p-4">
                  <p className="text-[10px] font-black tracking-[1.5px] uppercase text-[#8c8477]">
                    Category
                  </p>
                  <p className="mt-2 text-sm font-bold">
                    {product.category?.name}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="h-11 w-11 rounded-full border border-black/10 bg-[#faf7f1] text-lg font-black"
                >
                  -
                </button>
                <div className="min-w-16 rounded-full border border-black/10 bg-white px-5 py-3 text-center text-sm font-bold">
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity((value) => value + 1)}
                  className="h-11 w-11 rounded-full border border-black/10 bg-[#faf7f1] text-lg font-black"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="ml-auto inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-black tracking-[1px] uppercase text-white transition-colors hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {isAddingToCart ? "Adding..." : "Add to cart"}
                </button>
              </div>

              {actionMessage && (
                <p className="mt-3 text-sm font-medium text-[#5c5448]">
                  {actionMessage}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  onClick={handleCopySku}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[11px] font-black tracking-[1px] uppercase text-[#4d463c] hover:bg-[#faf7f1]"
                >
                  <Copy className="h-4 w-4" />
                  Copy SKU
                </button>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f7f3eb] px-4 py-2 text-[11px] font-black tracking-[1px] uppercase text-[#7b7266]">
                  <BadgeCheck className="h-4 w-4" />
                  {product.status}
                </span>
              </div>
            </article>

            <article className="rounded-[32px] border border-black/10 bg-black p-6 text-white shadow-[0_16px_40px_rgba(17,17,17,0.08)]">
              <p className="text-[10px] font-black tracking-[1.5px] uppercase text-white/55">
                Variant stack
              </p>
              <div className="mt-4 space-y-3">
                {product.variants.map((variant) => {
                  const active = variant._id === selectedVariant?._id;
                  return (
                    <button
                      key={variant._id}
                      onClick={() => {
                        setSelectedVariantId(variant._id);
                        setSelectedImage(0);
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                        active
                          ? "border-white bg-white text-black"
                          : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-bold">
                            {variant.color} / Size {variant.size}
                          </div>
                          <div className="mt-1 text-[11px] uppercase tracking-[1px] text-current/70">
                            {variant.sku}
                          </div>
                        </div>
                        <div className="rounded-full bg-black/10 px-3 py-1 text-[11px] font-black">
                          {variant.stock} stock
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </article>
          </aside>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[32px] border border-black/10 bg-white p-6 shadow-[0_16px_40px_rgba(17,17,17,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black tracking-[1.5px] uppercase text-[#8c8477]">
                  Product intel
                </p>
                <h2 className="mt-2 text-[22px] font-black tracking-[-1px]">
                  Schema-driven product summary
                </h2>
              </div>
              <div className="inline-flex rounded-full bg-[#f7f3eb] p-1 text-[11px] font-black uppercase tracking-[1px]">
                {["overview", "variants"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-4 py-2 transition-colors ${
                      activeTab === tab
                        ? "bg-black text-white"
                        : "text-[#6a6155] hover:text-black"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              {activeTab === "overview" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-[#faf7f1] p-4">
                    <div className="flex items-center gap-3 text-sm font-bold">
                      <Layers3 className="h-4 w-4" />
                      Identification
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-[#5d564b]">
                      <div className="flex justify-between gap-4">
                        <span>Product ID</span>
                        <span className="font-semibold">{product._id}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Slug</span>
                        <span className="font-semibold">{product.slug}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>SKU Prefix</span>
                        <span className="font-semibold">
                          {product.skuPrefix}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#faf7f1] p-4">
                    <div className="flex items-center gap-3 text-sm font-bold">
                      <Warehouse className="h-4 w-4" />
                      Commerce
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-[#5d564b]">
                      <div className="flex justify-between gap-4">
                        <span>Base price</span>
                        <span className="font-semibold">
                          {formatPrice(product.basePrice)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Sale price</span>
                        <span className="font-semibold">
                          {formatPrice(product.salePrice)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span>Featured</span>
                        <span className="font-semibold">
                          {product.isFeatured ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#faf7f1] p-4">
                    <div className="flex items-center gap-3 text-sm font-bold">
                      <ShieldCheck className="h-4 w-4" />
                      Variant coverage
                    </div>
                    <div className="mt-3 text-sm text-[#5d564b]">
                      {product.variants.length} variants with stock by color and
                      size.
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#faf7f1] p-4">
                    <div className="flex items-center gap-3 text-sm font-bold">
                      <Package className="h-4 w-4" />
                      Fulfillment
                    </div>
                    <div className="mt-3 text-sm text-[#5d564b]">
                      Active status: {product.status}. Ready for product page,
                      cart, and admin workflows.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "variants" && (
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="text-left text-[10px] font-black tracking-[1.4px] uppercase text-[#8c8477]">
                        <th className="border-b border-black/10 px-3 py-3">
                          Color
                        </th>
                        <th className="border-b border-black/10 px-3 py-3">
                          Size
                        </th>
                        <th className="border-b border-black/10 px-3 py-3">
                          SKU
                        </th>
                        <th className="border-b border-black/10 px-3 py-3">
                          Stock
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.variants.map((variant) => (
                        <tr key={variant._id} className="align-middle">
                          <td className="border-b border-black/5 px-3 py-4 text-sm font-semibold">
                            {variant.color}
                          </td>
                          <td className="border-b border-black/5 px-3 py-4 text-sm font-semibold">
                            {variant.size}
                          </td>
                          <td className="border-b border-black/5 px-3 py-4 text-sm text-[#5d564b]">
                            {variant.sku}
                          </td>
                          <td className="border-b border-black/5 px-3 py-4 text-sm font-bold">
                            {variant.stock}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </article>

          <article className="rounded-[32px] border border-black/10 bg-black p-6 text-white shadow-[0_16px_40px_rgba(17,17,17,0.08)]">
            <p className="text-[10px] font-black tracking-[1.5px] uppercase text-white/55">
              Delivery & trust
            </p>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-white/8 p-4">
                <div className="flex items-center gap-3 text-sm font-bold">
                  <Truck className="h-4 w-4" />
                  Shipping ready
                </div>
                <p className="mt-2 text-sm text-white/70">
                  The product detail page reflects `shippingMethod` and
                  stock-driven fulfillment signals.
                </p>
              </div>
              <div className="rounded-2xl bg-white/8 p-4">
                <div className="flex items-center gap-3 text-sm font-bold">
                  <MapPin className="h-4 w-4" />
                  Catalog metadata
                </div>
                <p className="mt-2 text-sm text-white/70">
                  Based on backend fields: brand, category, basePrice,
                  salePrice, skuPrefix, status, and variants.
                </p>
              </div>
              <div className="rounded-2xl bg-white/8 p-4">
                <div className="flex items-center gap-3 text-sm font-bold">
                  <Box className="h-4 w-4" />
                  Inventory health
                </div>
                <p className="mt-2 text-sm text-white/70">
                  {selectedVariant
                    ? `${selectedVariant.stock} units for the active variant.`
                    : "No active variant selected."}
                </p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
