import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Search, Sparkles } from "lucide-react";
import Footer from "@/components/Footer";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import ProductDetail from "@/components/ProductDetail";
import ProductFilter from "@/components/ProductFilter";
import {
  addToCart,
  getAllCategories,
  getProducts,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "@/services/api";
import { useNavigate } from "react-router-dom";

const TEN_DAYS_IN_MS = 10 * 24 * 60 * 60 * 1000;

const mapProduct = (product) => {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const sizes = [
    ...new Set(variants.map((variant) => variant.size).filter(Boolean)),
  ];
  const colors = [
    ...new Set(variants.map((variant) => variant.color).filter(Boolean)),
  ];
  const image =
    product.productImages?.[0] ||
    variants[0]?.variantImages?.[0] ||
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80";
  const basePrice = Number(product.basePrice ?? product.salePrice ?? 0);
  const salePrice = Number(product.salePrice);
  const hasSalePrice = product.salePrice !== null && product.salePrice !== "";
  const isSale =
    hasSalePrice && Number.isFinite(salePrice) && salePrice < basePrice;

  return {
    id: product._id,
    backendProductId: product._id,
    name: product.name,
    price: isSale ? salePrice : basePrice,
    originalPrice: basePrice,
    image,
    category: product.category?.name || "Sneakers",
    collection: product.brand?.name || product.category?.name || "Collection",
    sizes: sizes.length ? sizes : ["OS"],
    colors: colors.length ? colors : ["black"],
    description: product.description,
    rating: Number(product.averageRating ?? 0),
    isSale: Boolean(product.salePrice && product.salePrice < product.basePrice),
    createdAt: product.createdAt,
    variants,
  };
};

const normalizeCategoryList = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

const ShopAll = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { collectionMode, searchFromUrl } = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      collectionMode: params.get("collection") || "",
      searchFromUrl: (params.get("search") || params.get("q") || "").trim(),
    };
  }, [location.search]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pageState, setPageState] = useState({
    collectionMode: "",
    page: 1,
  });
  const [sortBy, setSortBy] = useState("featured");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loadingCart, setLoadingCart] = useState(null);
  const [, setLoadingWishlist] = useState(null);
  const [searchState, setSearchState] = useState(() => {
    const params = new URLSearchParams(location.search);
    const initialSearch = (params.get("search") || params.get("q") || "").trim();
    return {
      source: location.search,
      value: initialSearch,
    };
  });
  const [newArrivalReferenceTime] = useState(() => Date.now());
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: [0, 10000000],
    sizes: [],
    colors: [],
  });

  const itemsPerPage = 9;
  const searchTerm =
    searchState.source === location.search ? searchState.value : searchFromUrl;
  const deferredSearch = useDeferredValue(searchTerm);
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const collectionMode = queryParams.get("collection") || "";

  useEffect(() => {
    const nextSearchTerm = (
      queryParams.get("search") ||
      queryParams.get("q") ||
      ""
    ).trim();
    setSearchTerm(nextSearchTerm);
  }, [queryParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [collectionMode]);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [productRes, categoryRes, wishlistRes] = await Promise.all([
          getProducts(),
          getAllCategories(),
          getWishlist().catch(() => []),
        ]);
        if (cancelled) return;

        setProducts(
          Array.isArray(productRes) ? productRes.map(mapProduct) : [],
        );
        setCategories(normalizeCategoryList(categoryRes));

        // Load wishlist
        const wishlistArray = Array.isArray(wishlistRes?.data)
          ? wishlistRes.data
          : Array.isArray(wishlistRes)
            ? wishlistRes
            : [];
        const wishlistProductIds = new Set(
          wishlistArray.map((item) => item.productId || item._id || item.id),
        );
        setWishlistIds(wishlistProductIds);
      } catch (error) {
        if (!cancelled) {
          setProducts([]);
          setCategories([]);
          setNotice(error.message || "Không thể tải sản phẩm");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const priceMax = useMemo(() => {
    const maxPrice = Math.max(
      ...products.map((product) => Number(product.price || 0)),
      1000000,
    );
    return Math.ceil(maxPrice / 100000) * 100000;
  }, [products]);

  const normalizedFilters = useMemo(
    () => ({
      ...filters,
      priceRange: [
        Math.min(filters.priceRange[0], priceMax),
        Math.min(filters.priceRange[1], priceMax),
      ],
    }),
    [filters, priceMax],
  );

  const filteredProducts = useMemo(() => {
    const keyword = deferredSearch.trim().toLowerCase();
    const now = Date.now();
    const tenDaysInMs = 10 * 24 * 60 * 60 * 1000;

    const filtered = products.filter((product) => {
      if (collectionMode === "new-arrivals") {
        const createdAt = new Date(product.createdAt).getTime();
        if (!Number.isFinite(createdAt) || now - createdAt > tenDaysInMs) {
          return false;
        }
      } else if (collectionMode === "sale" && !product.isSale) {
        return false;
      }

      if (keyword) {
        const searchable = [product.name, product.category, product.collection]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchable.includes(keyword)) {
          return false;
        }
      }

      if (
        product.price < normalizedFilters.priceRange[0] ||
        product.price > normalizedFilters.priceRange[1]
      ) {
        return false;
      }

      if (
        normalizedFilters.categories.length > 0 &&
        !normalizedFilters.categories.includes(product.category)
      ) {
        return false;
      }

      if (
        normalizedFilters.colors.length > 0 &&
        !product.colors.some((color) =>
          normalizedFilters.colors.includes(color),
        )
      ) {
        return false;
      }

      if (
        normalizedFilters.sizes.length > 0 &&
        !product.sizes.some((size) => normalizedFilters.sizes.includes(size))
      ) {
        return false;
      }

      return true;
    });

    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  }, [collectionMode, deferredSearch, normalizedFilters, products, sortBy]);

  const pageCopy = useMemo(() => {
    if (collectionMode === "new-arrivals") {
      return {
        badge: "New arrivals",
        title: "Latest products from the last 10 days",
        description:
          "Browse the latest products from the last 10 days and refine them with the same storefront filters.",
        countLabel: "new arrivals",
        emptyMessage: "Chua co san pham moi trong 10 ngay gan day.",
      };
    }

    if (collectionMode === "sale") {
      return {
        badge: "Sale",
        title: "Products currently on sale",
        description:
          "Browse products currently on sale and narrow the list by category, size, color, and price.",
        countLabel: "sale products",
        emptyMessage: "Chua co san pham dang sale.",
      };
    }

    return {
      badge: "Shop all",
      title: "Discover the latest sneaker drop",
      description:
        "Browse the full catalog, filter by brand or category, and jump into product details without leaving the storefront.",
      countLabel: "products",
      emptyMessage: "No products found.",
    };
  }, [collectionMode]);

  const categoryOptions = useMemo(() => {
    const fromApi = categories
      .map((category) => category?.name)
      .filter(Boolean);
    const fromProducts = products
      .map((product) => product.category)
      .filter(Boolean);
    return [...new Set([...fromApi, ...fromProducts])];
  }, [categories, products]);

  const sizeOptions = useMemo(() => {
    const sizeSet = new Set(products.flatMap((product) => product.sizes || []));
    return [...sizeSet].sort((a, b) => String(a).localeCompare(String(b)));
  }, [products]);

  const colorOptions = useMemo(() => {
    const colorSet = new Set(
      products.flatMap((product) => product.colors || []),
    );
    return [...colorSet].sort();
  }, [products]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage),
  );
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSetFilters = (updater) => {
    setCurrentPage(1);
    setFilters((prev) =>
      typeof updater === "function" ? updater(prev) : updater,
    );
  };

  const handleAddToCart = async ({ product, quantity, size, color }) => {
    const variant =
      product.variants?.find(
        (entry) =>
          String(entry.size) === String(size || entry.size) &&
          String(entry.color).toLowerCase() ===
            String(color || entry.color).toLowerCase(),
      ) || product.variants?.[0];

    if (!product.backendProductId || !variant?._id) {
      setNotice("Sản phẩm này chưa có variant thật để thêm vào giỏ hàng.");
      return;
    }

    try {
      setLoadingCart(product.id);
      await addToCart({
        productId: product.backendProductId,
        variantId: variant._id,
        quantity,
      });
      setNotice("Đã thêm sản phẩm vào giỏ hàng");
      setSelectedProduct(null);
    } catch (error) {
      setNotice(error.message || "Không thể thêm vào giỏ hàng");
    } finally {
      setLoadingCart(null);
    }
  };

  const handleQuickAddToCart = async (product) => {
    const firstVariant = product.variants?.[0];

    if (!product.backendProductId || !firstVariant?._id) {
      setNotice(
        "Sản phẩm này chưa có variant thật để thêm nhanh vào giỏ hàng.",
      );
      return;
    }

    try {
      setLoadingCart(product.id);
      await addToCart({
        productId: product.backendProductId,
        variantId: firstVariant._id,
        quantity: 1,
      });
      setNotice("Đã thêm nhanh vào giỏ hàng");
    } catch (error) {
      setNotice(error.message || "Không thể thêm vào giỏ hàng");
    } finally {
      setLoadingCart(null);
    }
  };

  const handleToggleWishlist = async (product) => {
    if (!product.backendProductId) {
      setNotice("Sản phẩm này không hợp lệ");
      return;
    }

    try {
      setLoadingWishlist(product.id);
      const isInWishlist = wishlistIds.has(product.id);

      if (isInWishlist) {
        await removeFromWishlist({ productId: product.backendProductId });
        setWishlistIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(product.id);
          return newSet;
        });
        setNotice("Đã xóa khỏi danh sách yêu thích");
      } else {
        await addToWishlist({ productId: product.backendProductId });
        setWishlistIds((prev) => new Set(prev).add(product.id));
        setNotice("Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      setNotice(error.message || "Không thể cập nhật danh sách yêu thích");
    } finally {
      setLoadingWishlist(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f2]">
      <section className="border-b border-[#ece6db] bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#eef4ff] px-3 py-1 text-[10px] font-black uppercase tracking-[1.4px] text-[#0f3f97]">
                <Sparkles className="h-3.5 w-3.5" />
                {pageCopy.badge}
              </div>
              <h1 className="mt-4 text-[34px] font-black uppercase leading-[0.95] tracking-[-1.8px] sm:text-[54px]">
                {pageCopy.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6f6a61]">
                {pageCopy.description}
              </p>
            </div>

            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b847a]" />
              <input
                value={searchTerm}
                onChange={(event) => {
                  setSearchState({
                    source: location.search,
                    value: event.target.value,
                  });
                  setCurrentPage(1);
                }}
                className="h-12 w-full rounded-2xl border border-[#e4ddd1] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#111] focus:ring-2 focus:ring-black/5"
                placeholder="Search by name or brand"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {notice && (
          <div className="mb-6 rounded-2xl border border-[#e4ddd1] bg-white px-4 py-3 text-sm text-[#2d2a26] shadow-sm">
            {notice}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-sm text-[#6f6a61]">
            Đang tải sản phẩm...
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <ProductFilter
              filters={normalizedFilters}
              setFilters={handleSetFilters}
              categoryOptions={categoryOptions}
              sizeOptions={sizeOptions}
              colorOptions={colorOptions}
              priceMax={priceMax}
            />

            <div>
              <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-[#e4ddd1] bg-white px-4 py-3">
                <div className="text-sm font-semibold text-[#2d2a26]">
                  {filteredProducts.length} {pageCopy.countLabel}
                </div>
                <select
                  value={sortBy}
                  onChange={(event) => {
                    setSortBy(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-10 rounded-xl border border-[#e4ddd1] bg-[#fbfaf6] px-3 text-sm outline-none"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              {currentProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {currentProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() =>
                          navigate(`/product-details/${product.id}`)
                        }
                        className="cursor-pointer"
                      >
                        <ProductCard
                          product={product}
                          onAddToCart={() => handleQuickAddToCart(product)}
                          isFavorite={wishlistIds.has(product.id)}
                          onToggleWishlist={handleToggleWishlist}
                          isLoading={loadingCart === product.id}
                        />
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </>
              ) : (
                <div className="rounded-[28px] border border-dashed border-[#d9d2c5] bg-white py-16 text-center">
                  <p className="text-sm font-semibold text-[#6f6a61]">
                    {pageCopy.emptyMessage}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      <Footer />
    </div>
  );
};

export default ShopAll;
