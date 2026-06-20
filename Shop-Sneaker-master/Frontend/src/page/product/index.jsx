import {
  Fragment,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Download,
  ImagePlus,
  Loader2,
  Menu,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import SidebarAdmin from "@/components/sidebarAdmin";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createProduct,
  deleteProduct,
  getAllBrands,
  getAllCategories,
  getProducts,
  updateProduct,
} from "@/services/api";
import { uploadImagesToCloudinary } from "@/services/cloudinary";

const moneyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const compactMoneyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  notation: "compact",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-US");
const LOW_STOCK_LIMIT = 20;

const createEmptyForm = () => ({
  name: "",
  slug: "",
  description: "",
  brandId: "",
  categoryId: "",
  basePrice: "",
  salePrice: "",
  stock: "0",
  skuPrefix: "",
  status: "active",
  isFeatured: false,
  productImagesText: "",
});

const normalizeList = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
};

const slugify = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parseImageList = (value = "") => [
  ...new Set(
    value
      .split(/[\n,]+/)
      .map((entry) => entry.trim())
      .filter(Boolean),
  ),
];

const getProductImage = (product) =>
  product?.productImages?.[0] ||
  product?.variants?.[0]?.variantImages?.[0] ||
  "";

const getVariantImage = (variant) => variant?.variantImages?.[0] || "";

const getProductPrice = (product) =>
  Number(product?.salePrice ?? product?.basePrice ?? 0);

const getProductStock = (product) => {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (variants.length > 0) {
    return variants.reduce(
      (sum, variant) => sum + Number(variant?.stock ?? 0),
      0,
    );
  }

  return Number(product?.stock ?? 0);
};

const getProductHealth = (product) => {
  const stock = getProductStock(product);
  if (stock <= 0) return "out";
  if (stock <= LOW_STOCK_LIMIT) return "low";
  return "healthy";
};

const getVariantHealth = (variant) => {
  const stock = Number(variant?.stock ?? 0);
  if (stock <= 0) return "out";
  if (stock <= 10) return "low";
  return "healthy";
};

const getStatusMeta = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "active") {
    return {
      label: "Active",
      className: "bg-[#e8f7ee] text-[#11753b]",
    };
  }

  if (normalized === "inactive") {
    return {
      label: "Inactive",
      className: "bg-[#eef0f3] text-[#6b7280]",
    };
  }

  return {
    label: "Draft",
    className: "bg-[#fff3d6] text-[#9a6400]",
  };
};

const getStockMeta = (health) => {
  if (health === "out") {
    return {
      label: "Out of Stock",
      className: "bg-[#e7e7e7] text-[#6b6b6b]",
    };
  }

  if (health === "low") {
    return {
      label: "Low Stock",
      className: "bg-[#fee8e8] text-[#bb1f1f]",
    };
  }

  return {
    label: "Healthy",
    className: "bg-[#dcfce7] text-[#166534]",
  };
};

const getVariantStatusMeta = (health) => {
  if (health === "out") {
    return {
      label: "Out of stock",
      className: "bg-[#e7e7e7] text-[#6b6b6b]",
    };
  }

  if (health === "low") {
    return {
      label: "Low stock",
      className: "bg-[#fff2f2] text-[#c02626]",
    };
  }

  return {
    label: "In stock",
    className: "bg-[#e8f7ee] text-[#11753b]",
  };
};

const getColorSwatch = (value = "") => {
  const token = String(value).toLowerCase();

  if (token.includes("/")) {
    const [left, right] = token.split("/");
    return {
      backgroundImage: `linear-gradient(135deg, ${getColorSwatch(left).backgroundColor || "#d1d5db"} 50%, ${getColorSwatch(right).backgroundColor || "#d1d5db"} 50%)`,
      borderColor: "#d1d5db",
    };
  }

  const palette = {
    black: "#111111",
    stealth: "#111111",
    white: "#f8fafc",
    sail: "#f6f3ec",
    cream: "#f4ecd8",
    beige: "#e7d8c3",
    bone: "#ece5d7",
    gray: "#9ca3af",
    grey: "#9ca3af",
    silver: "#cbd5e1",
    red: "#dc2626",
    crimson: "#dc2626",
    blue: "#2563eb",
    navy: "#0f3f97",
    green: "#16a34a",
    orange: "#f97316",
    yellow: "#eab308",
    purple: "#7c3aed",
    pink: "#ec4899",
    brown: "#92400e",
  };

  for (const [key, color] of Object.entries(palette)) {
    if (token.includes(key)) {
      return {
        backgroundColor: color,
        borderColor: color === "#f8fafc" ? "#d1d5db" : color,
      };
    }
  }

  const hash = [...token].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  const fallback = `hsl(${hue} 38% 56%)`;
  return { backgroundColor: fallback, borderColor: fallback };
};

const formatCreatedYear = (value) => {
  if (!value) return "2026";
  const year = new Date(value).getFullYear();
  return Number.isNaN(year) ? "2026" : String(year);
};

const formatMoney = (value) => moneyFormatter.format(Number(value || 0));

const formatCompact = (value) =>
  compactMoneyFormatter.format(Number(value || 0));

const buildFormFromProduct = (product) => ({
  name: product?.name || "",
  slug: product?.slug || "",
  description: product?.description || "",
  brandId: product?.brand?._id || product?.brand || "",
  categoryId: product?.category?._id || product?.category || "",
  basePrice: product?.basePrice ?? "",
  salePrice: product?.salePrice ?? "",
  stock: product?.stock ?? 0,
  skuPrefix: product?.skuPrefix || "",
  status: product?.status || "active",
  isFeatured: Boolean(product?.isFeatured),
  productImagesText: Array.isArray(product?.productImages)
    ? product.productImages.join("\n")
    : "",
});

const buildPayloadFromForm = (form) => {
  const name = form.name.trim();
  const slug = slugify(form.slug || form.name);
  const description = form.description.trim();
  const basePrice = Number(form.basePrice);
  const salePriceValue = String(form.salePrice).trim();
  const stockValue = String(form.stock).trim();
  const productImages = parseImageList(form.productImagesText);

  if (!name) throw new Error("Product name is required");
  if (!slug) throw new Error("Product slug is required");
  if (!description) throw new Error("Product description is required");
  if (!form.brandId) throw new Error("Please select a brand");
  if (!form.categoryId) throw new Error("Please select a category");
  if (!Number.isFinite(basePrice) || basePrice <= 0)
    throw new Error("Base price must be greater than 0");
  if (
    !Number.isFinite(Number(stockValue || 0)) ||
    Number(stockValue || 0) < 0
  ) {
    throw new Error("Stock must be 0 or greater");
  }

  const payload = {
    name,
    slug,
    description,
    brand: form.brandId,
    category: form.categoryId,
    basePrice,
    salePrice: salePriceValue === "" ? null : Number(salePriceValue),
    stock: Number(stockValue || 0),
    status: form.status,
    isFeatured: Boolean(form.isFeatured),
    skuPrefix: form.skuPrefix.trim(),
    productImages,
  };

  if (salePriceValue !== "") {
    if (!Number.isFinite(payload.salePrice) || payload.salePrice < 0) {
      throw new Error("Sale price must be a valid number");
    }
  }

  return payload;
};

const FormSection = ({ eyebrow, title, description, action, children }) => (
  <section className="rounded-[28px] border border-[#ebe5da] bg-white p-5 shadow-[0_10px_30px_rgba(17,17,17,0.03)] md:p-6">
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[1.5px] text-[#9b968d]">
          {eyebrow}
        </p>
        <h3 className="mt-2 text-[18px] font-black uppercase tracking-[-0.8px] text-[#111] md:text-[20px]">
          {title}
        </h3>
        {description && (
          <p className="mt-2 text-[13px] leading-6 text-[#6f6a61]">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const ProductFormDialog = ({
  brands,
  categories,
  open,
  product,
  saving,
  mode,
  onOpenChange,
  onSubmit,
}) => {
  const [form, setForm] = useState(() =>
    product ? buildFormFromProduct(product) : createEmptyForm(),
  );
  const [error, setError] = useState("");
  const [slugAuto, setSlugAuto] = useState(() => !product);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingImageCount, setUploadingImageCount] = useState(0);

  const updateField = (field) => (event) => {
    const { type, checked, value } = event.target;
    setForm((prev) => {
      const nextValue = type === "checkbox" ? checked : value;
      const nextForm = {
        ...prev,
        [field]: nextValue,
      };

      if (field === "name" && slugAuto && !prev.slug) {
        nextForm.slug = slugify(nextValue);
      }

      return nextForm;
    });

    if (field === "slug") {
      setSlugAuto(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (uploadingImages) {
      setError("Please wait for image upload to finish.");
      return;
    }

    try {
      const payload = buildPayloadFromForm(form);
      await onSubmit(payload);
      onOpenChange(false);
    } catch (submissionError) {
      setError(submissionError.message || "Unable to save product");
    }
  };

  const handleImageFilesChange = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length) return;

    setError("");
    setUploadingImages(true);
    setUploadingImageCount(files.length);

    try {
      const uploadedUrls = await uploadImagesToCloudinary(files);
      setForm((prev) => {
        const currentUrls = parseImageList(prev.productImagesText);
        const nextUrls = [...new Set([...currentUrls, ...uploadedUrls])];

        return {
          ...prev,
          productImagesText: nextUrls.join("\n"),
        };
      });
    } catch (uploadError) {
      setError(uploadError.message || "Unable to upload product images");
    } finally {
      setUploadingImages(false);
      setUploadingImageCount(0);
    }
  };

  const updateProductImageUrls = (urls) => {
    setForm((prev) => ({
      ...prev,
      productImagesText: urls.join("\n"),
    }));
  };

  const handleRemoveImage = (urlToRemove) => {
    updateProductImageUrls(productImageUrls.filter((url) => url !== urlToRemove));
  };

  const handleMakeCoverImage = (urlToPromote) => {
    updateProductImageUrls([
      urlToPromote,
      ...productImageUrls.filter((url) => url !== urlToPromote),
    ]);
  };

  const handleUseNameAsSlug = () => {
    setSlugAuto(true);
    setForm((prev) => ({
      ...prev,
      slug: slugify(prev.name || ""),
    }));
  };

  const imagePreview = form.productImagesText
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .find(Boolean);
  const productImageUrls = parseImageList(form.productImagesText);
  const selectedBrand = brands.find(
    (brand) => String(brand._id) === String(form.brandId),
  );
  const selectedCategory = categories.find(
    (category) => String(category._id) === String(form.categoryId),
  );
  const basePriceValue = Number(form.basePrice || 0);
  const salePriceValue = form.salePrice === "" ? null : Number(form.salePrice);
  const stockPreviewValue = Number(form.stock || 0);
  const primaryImage = imagePreview || getProductImage(product);
  const statusMeta = getStatusMeta(form.status);
  const submitLabel = uploadingImages
    ? "Uploading..."
    : saving
      ? "Saving..."
      : mode === "create"
        ? "Create product"
        : "Save changes";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-6xl w-[calc(100vw-1rem)] overflow-hidden rounded-[28px] border border-black/10 bg-[#fbfaf6] p-0 shadow-[0_40px_120px_rgba(0,0,0,0.28)] sm:w-[calc(100vw-2rem)]">
        <div className="flex max-h-[92vh] flex-col overflow-hidden">
          <div className="border-b border-[#ebe5da] bg-white px-6 py-5 md:px-8">
            <DialogHeader className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#eef4ff] px-3 py-1 text-[10px] font-black uppercase tracking-[1.6px] text-[#0f3f97]">
                  <span className="h-2 w-2 rounded-full bg-[#0f3f97]" />
                  {mode === "create" ? "Create product" : "Edit product"}
                </div>
              </div>
              <div>
                <DialogTitle className="text-[28px] font-black tracking-[-1.3px] md:text-[34px]">
                  {mode === "create" ? "New product" : "Update product"}
                </DialogTitle>
                <DialogDescription className="mt-3 max-w-2xl text-[13px] leading-6 text-[#6f6a61]">
                  Fill the product basics first, then refine pricing, stock, and
                  media. The preview panel updates as you type.
                </DialogDescription>
              </div>
            </DialogHeader>
          </div>

          <form
            id="product-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-6 py-6 md:px-8"
          >
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#f4c7c7] bg-[#fff5f5] px-4 py-3 text-sm text-[#b42318]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid gap-6">
              <div className="space-y-6">
                <FormSection
                  eyebrow="Step 1"
                  title="Core details"
                  description="Use a clear product name and a clean slug. The slug can be generated from the name with one click."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 md:col-span-2">
                      <span className="text-[11px] font-black uppercase tracking-[1.3px] text-[#7a746b]">
                        Product name <span className="text-[#b42318]">*</span>
                      </span>
                      <input
                        value={form.name}
                        onChange={updateField("name")}
                        className="h-12 w-full rounded-2xl border border-[#e3ddd3] bg-white px-4 text-sm outline-none transition focus:border-[#111] focus:ring-2 focus:ring-black/5"
                        placeholder="Air Max 97"
                      />
                    </label>

                    <label className="space-y-2 md:col-span-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-black uppercase tracking-[1.3px] text-[#7a746b]">
                          Slug
                        </span>
                        <button
                          type="button"
                          onClick={handleUseNameAsSlug}
                          className="text-[10px] font-black uppercase tracking-[1.2px] text-[#0f3f97] transition hover:text-[#0a2c6f]"
                        >
                          Use name
                        </button>
                      </div>
                      <input
                        value={form.slug}
                        onChange={updateField("slug")}
                        className="h-12 w-full rounded-2xl border border-[#e3ddd3] bg-white px-4 text-sm outline-none transition focus:border-[#111] focus:ring-2 focus:ring-black/5"
                        placeholder="air-max-97"
                      />
                      <p className="text-[11px] text-[#8a8278]">
                        This is the URL-friendly identifier. Keep it short and
                        lowercase.
                      </p>
                    </label>

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-[11px] font-black uppercase tracking-[1.3px] text-[#7a746b]">
                        Description <span className="text-[#b42318]">*</span>
                      </span>
                      <textarea
                        rows={5}
                        value={form.description}
                        onChange={updateField("description")}
                        className="w-full rounded-3xl border border-[#e3ddd3] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#111] focus:ring-2 focus:ring-black/5"
                        placeholder="Describe the product, collection, fit, and highlights."
                      />
                    </label>
                  </div>
                </FormSection>

                <FormSection
                  eyebrow="Step 2"
                  title="Catalog and pricing"
                  description="Choose where the product lives in the catalog, then set the base and sale price."
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-[1.3px] text-[#7a746b]">
                        Brand <span className="text-[#b42318]">*</span>
                      </span>
                      <select
                        value={form.brandId}
                        onChange={updateField("brandId")}
                        className="h-12 w-full rounded-2xl border border-[#e3ddd3] bg-white px-4 text-sm outline-none transition focus:border-[#111] focus:ring-2 focus:ring-black/5"
                      >
                        <option value="">Select brand</option>
                        {brands.map((brand) => (
                          <option key={brand._id} value={brand._id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-[1.3px] text-[#7a746b]">
                        Category <span className="text-[#b42318]">*</span>
                      </span>
                      <select
                        value={form.categoryId}
                        onChange={updateField("categoryId")}
                        className="h-12 w-full rounded-2xl border border-[#e3ddd3] bg-white px-4 text-sm outline-none transition focus:border-[#111] focus:ring-2 focus:ring-black/5"
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-[1.3px] text-[#7a746b]">
                        Base price <span className="text-[#b42318]">*</span>
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={form.basePrice}
                        onChange={updateField("basePrice")}
                        className="h-12 w-full rounded-2xl border border-[#e3ddd3] bg-white px-4 text-sm outline-none transition focus:border-[#111] focus:ring-2 focus:ring-black/5"
                        placeholder="4500000"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-[1.3px] text-[#7a746b]">
                        Sale price
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={form.salePrice}
                        onChange={updateField("salePrice")}
                        className="h-12 w-full rounded-2xl border border-[#e3ddd3] bg-white px-4 text-sm outline-none transition focus:border-[#111] focus:ring-2 focus:ring-black/5"
                        placeholder="3990000"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-[1.3px] text-[#7a746b]">
                        Stock
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={form.stock}
                        onChange={updateField("stock")}
                        className="h-12 w-full rounded-2xl border border-[#e3ddd3] bg-white px-4 text-sm outline-none transition focus:border-[#111] focus:ring-2 focus:ring-black/5"
                        placeholder="120"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-[1.3px] text-[#7a746b]">
                        Status
                      </span>
                      <select
                        value={form.status}
                        onChange={updateField("status")}
                        className="h-12 w-full rounded-2xl border border-[#e3ddd3] bg-white px-4 text-sm outline-none transition focus:border-[#111] focus:ring-2 focus:ring-black/5"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                      </select>
                    </label>

                    <label className="space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-[1.3px] text-[#7a746b]">
                        SKU prefix
                      </span>
                      <input
                        value={form.skuPrefix}
                        onChange={updateField("skuPrefix")}
                        className="h-12 w-full rounded-2xl border border-[#e3ddd3] bg-white px-4 text-sm outline-none transition focus:border-[#111] focus:ring-2 focus:ring-black/5"
                        placeholder="AM97"
                      />
                    </label>

                    <label className="flex items-center gap-3 rounded-2xl border border-[#e3ddd3] bg-[#fbfaf6] px-4 py-3 md:col-span-2">
                      <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={updateField("isFeatured")}
                        className="h-4 w-4 rounded border-[#c9c1b2] text-black focus:ring-black/20"
                      />
                      <div>
                        <div className="text-sm font-semibold text-[#2d2a26]">
                          Featured product
                        </div>
                        <div className="text-[11px] text-[#8a8278]">
                          Highlight this product in collections and the
                          storefront.
                        </div>
                      </div>
                    </label>
                  </div>
                </FormSection>

                <FormSection
                  eyebrow="Step 3"
                  title="Media"
                  description="Upload product images to Cloudinary. The first image becomes the cover image."
                >
                  <div className="space-y-5">
                    <label
                      className={`relative flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed px-4 py-8 text-center transition ${
                        uploadingImages
                          ? "border-[#111] bg-[#f2f2f0]"
                          : "border-[#cfc6b8] bg-[#fbfaf6] hover:border-[#111] hover:bg-white"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageFilesChange}
                        disabled={uploadingImages}
                        className="sr-only"
                      />
                      {uploadingImages ? (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_10px_24px_rgba(17,17,17,0.08)]">
                          <Loader2 className="h-6 w-6 animate-spin text-[#111]" />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_10px_24px_rgba(17,17,17,0.08)]">
                          <ImagePlus className="h-6 w-6 text-[#111]" />
                        </div>
                      )}
                      <span className="mt-4 text-[12px] font-black uppercase tracking-[1.3px] text-[#111]">
                        {uploadingImages
                          ? `Uploading ${uploadingImageCount} image${uploadingImageCount > 1 ? "s" : ""}...`
                          : "Upload product images"}
                      </span>
                      <span className="mt-1 max-w-sm text-[12px] leading-5 text-[#8a8278]">
                        Choose one or more images. Uploaded Cloudinary URLs will
                        be added below automatically.
                      </span>
                    </label>

                    {productImageUrls.length > 0 ? (
                      <div className="rounded-3xl border border-[#e3ddd3] bg-white p-3">
                        <div className="mb-3 flex items-center justify-between gap-3 px-1">
                          <span className="text-[11px] font-black uppercase tracking-[1.3px] text-[#7a746b]">
                            Gallery ({productImageUrls.length})
                          </span>
                          <span className="text-[11px] font-semibold text-[#8a8278]">
                            First image is cover
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                          {productImageUrls.map((url, index) => (
                            <div
                              key={url}
                              className="group relative overflow-hidden rounded-2xl border border-[#e3ddd3] bg-[#f8f6f1]"
                            >
                              <div className="aspect-square overflow-hidden">
                                <img
                                  src={url}
                                  alt={`Product ${index + 1}`}
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                              </div>
                              <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
                                <span
                                  className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[1px] ${
                                    index === 0
                                      ? "bg-black text-white"
                                      : "bg-white/90 text-[#111]"
                                  }`}
                                >
                                  {index === 0 ? "Cover" : `Image ${index + 1}`}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(url)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-[#b42318] shadow-sm transition hover:bg-[#fff1f1]"
                                  aria-label="Remove image"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              {index !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleMakeCoverImage(url)}
                                  className="absolute inset-x-2 bottom-2 rounded-xl bg-black px-3 py-2 text-[9px] font-black uppercase tracking-[1px] text-white opacity-0 transition group-hover:opacity-100"
                                >
                                  Make cover
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                     <div></div>
                    )}

                    <details className="rounded-3xl border border-[#e3ddd3] bg-white px-4 py-3">
                      <summary className="cursor-pointer text-[11px] font-black uppercase tracking-[1.3px] text-[#7a746b]">
                        Edit image URLs manually
                      </summary>
                      <label className="mt-3 block space-y-2">
                      <span className="text-[11px] font-black uppercase tracking-[1.3px] text-[#7a746b]">
                        Image URLs
                      </span>
                      <textarea
                        rows={5}
                        value={form.productImagesText}
                        onChange={updateField("productImagesText")}
                        className="w-full rounded-3xl border border-[#e3ddd3] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#111] focus:ring-2 focus:ring-black/5"
                        placeholder="One URL per line"
                      />
                      <p className="text-[11px] text-[#8a8278]">
                        Uploaded Cloudinary URLs appear here. You can reorder
                        them manually; first URL is used as the cover image.
                      </p>
                      </label>
                    </details>
                  </div>
                </FormSection>
              </div>
            </div>
          </form>

          <div className="border-t border-[#ebe5da] bg-white/95 px-6 py-4 backdrop-blur md:px-8">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* <p className="text-[11px] text-[#8a8278]">
                Changes are saved to `POST /api/products` or `PUT
                /api/products/:id`.
              </p> */}
              <div className="flex gap-3 w-full justify-end">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex items-center justify-center rounded-2xl border border-[#e2dbcf] bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[1.4px] text-[#111] transition hover:bg-[#f7f5ef]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="product-form"
                  disabled={saving || uploadingImages}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-[11px] font-black uppercase tracking-[1.4px] text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ProductManagementPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeProductId, setActiveProductId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortKey, setSortKey] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [notice, setNotice] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [editingProduct, setEditingProduct] = useState(null);

  const deferredSearch = useDeferredValue(searchTerm);

  const loadInventory = async () => {
    setLoading(true);

    try {
      const [productsResult, categoriesResult, brandsResult] =
        await Promise.allSettled([
          getProducts(),
          getAllCategories(),
          getAllBrands(),
        ]);

      if (productsResult.status !== "fulfilled") {
        throw productsResult.reason;
      }

      const nextProducts = Array.isArray(productsResult.value)
        ? productsResult.value
        : [];

      setProducts(nextProducts);
      setCategories(
        normalizeList(
          categoriesResult.status === "fulfilled" ? categoriesResult.value : [],
        ),
      );
      setBrands(
        normalizeList(
          brandsResult.status === "fulfilled" ? brandsResult.value : [],
        ),
      );

      if (!activeProductId && nextProducts.length > 0) {
        setActiveProductId(nextProducts[0]._id);
      }

      return nextProducts;
    } catch (error) {
      setProducts([]);
      setCategories([]);
      setBrands([]);
      setNotice({
        type: "error",
        text: error.message || "Unable to load product inventory",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadInventory();
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizedBrandFilter = useMemo(
    () => brandFilter.trim(),
    [brandFilter],
  );
  const normalizedCategoryFilter = useMemo(
    () => categoryFilter.trim(),
    [categoryFilter],
  );
  const normalizedSearch = deferredSearch.trim().toLowerCase();

  const inventoryRows = useMemo(() => {
    const filtered = products.filter((product) => {
      const brandId = product?.brand?._id || product?.brand;
      const categoryId = product?.category?._id || product?.category;
      const brandName = product?.brand?.name || "";
      const categoryName = product?.category?.name || "";
      const keyword = [
        product?.name,
        product?.slug,
        brandName,
        categoryName,
        product?.skuPrefix,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const stockHealth = getProductHealth(product);

      if (normalizedSearch && !keyword.includes(normalizedSearch)) {
        return false;
      }

      if (
        normalizedBrandFilter !== "all" &&
        String(brandId) !== normalizedBrandFilter
      ) {
        return false;
      }

      if (
        normalizedCategoryFilter !== "all" &&
        String(categoryId) !== normalizedCategoryFilter
      ) {
        return false;
      }

      if (stockFilter !== "all" && stockHealth !== stockFilter) {
        return false;
      }

      return true;
    });

    return filtered.sort((left, right) => {
      let leftValue = "";
      let rightValue = "";

      if (sortKey === "price") {
        leftValue = getProductPrice(left);
        rightValue = getProductPrice(right);
      } else if (sortKey === "stock") {
        leftValue = getProductStock(left);
        rightValue = getProductStock(right);
      } else if (sortKey === "brand") {
        leftValue = left?.brand?.name || "";
        rightValue = right?.brand?.name || "";
      } else {
        leftValue = left?.name || "";
        rightValue = right?.name || "";
      }

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return sortDirection === "asc"
          ? leftValue - rightValue
          : rightValue - leftValue;
      }

      const comparison = String(leftValue).localeCompare(String(rightValue));
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [
    products,
    normalizedSearch,
    normalizedBrandFilter,
    normalizedCategoryFilter,
    stockFilter,
    sortKey,
    sortDirection,
  ]);

  const selectedProduct = useMemo(
    () =>
      inventoryRows.find((product) => product._id === activeProductId) ||
      inventoryRows[0] ||
      null,
    [inventoryRows, activeProductId],
  );

  const dashboardMetrics = useMemo(() => {
    const totalStock = products.reduce(
      (sum, product) => sum + getProductStock(product),
      0,
    );
    const totalValue = products.reduce(
      (sum, product) =>
        sum + getProductPrice(product) * getProductStock(product),
      0,
    );
    const lowStockProducts = products.filter(
      (product) => getProductHealth(product) === "low",
    ).length;
    return [
      {
        label: "Total Products",
        value: numberFormatter.format(products.length),
        tone: "bg-black text-white",
      },
      {
        label: "Warehouse Value",
        value: formatCompact(totalValue),
        tone: "bg-[#f2f2f0] text-[#111]",
      },
      {
        label: "Low Stock Alerts",
        value: numberFormatter.format(lowStockProducts),
        tone: "bg-[#f2f2f0] text-[#c81e1e]",
      },
      {
        label: "Incoming Stock",
        value: numberFormatter.format(totalStock),
        tone: "bg-[#0f3f97] text-white",
      },
    ];
  }, [products]);

  const openCreateDialog = () => {
    setDialogMode("create");
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const openEditDialog = (product) => {
    setDialogMode("edit");
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleSaveProduct = async (payload) => {
    setSaving(true);

    try {
      const result =
        dialogMode === "create"
          ? await createProduct(payload)
          : await updateProduct(editingProduct._id, payload);

      const nextProducts = await loadInventory();
      const nextActiveId =
        result?._id || editingProduct?._id || nextProducts[0]?._id || "";
      if (nextActiveId) {
        setActiveProductId(nextActiveId);
      }

      setNotice({
        type: "success",
        text:
          dialogMode === "create"
            ? "Product created successfully"
            : "Product updated successfully",
      });

      return result;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}" and its variants?`,
    );
    if (!confirmed) return;

    setDeletingId(product._id);

    try {
      await deleteProduct(product._id);
      const nextProducts = await loadInventory();
      if (nextProducts.length > 0) {
        setActiveProductId(nextProducts[0]._id);
      } else {
        setActiveProductId("");
      }

      setNotice({
        type: "success",
        text: "Product deleted successfully",
      });
    } catch (error) {
      setNotice({
        type: "error",
        text: error.message || "Unable to delete product",
      });
    } finally {
      setDeletingId("");
    }
  };

  const handleExport = () => {
    const header = [
      "Name",
      "Slug",
      "Brand",
      "Category",
      "Base Price",
      "Sale Price",
      "Stock",
      "Status",
      "Variants",
    ];

    const rows = inventoryRows.map((product) => [
      product.name,
      product.slug || "",
      product.brand?.name || "",
      product.category?.name || "",
      product.basePrice ?? "",
      product.salePrice ?? "",
      getProductStock(product),
      product.status || "",
      Array.isArray(product.variants) ? product.variants.length : 0,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "product-inventory.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const setSort = (key) => {
    if (sortKey === key) {
      setSortDirection((value) => (value === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection(key === "price" || key === "stock" ? "desc" : "asc");
  };

  return (
    <div className="flex min-h-screen bg-[#f4f3ef] text-[#111]">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0`}
      >
        <SidebarAdmin />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <header className="sticky top-0 z-30 border-b border-white/70 bg-white/92 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-10 lg:px-14 lg:py-5">
            <div className="flex items-center gap-4 md:gap-6">
              <button
                onClick={() => setIsSidebarOpen((value) => !value)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#ece7dd] bg-white text-[#111] transition hover:bg-[#f6f4ef] lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="space-y-2">
                <div className="text-[18px] font-black tracking-[-0.5px] md:text-[22px]">
                  DASHBOARD
                </div>
                <div className="hidden items-center gap-6 md:flex">
                  <span className="text-[14px] font-medium text-[#6f6a61]">
                    Overview
                  </span>
                  <span className="text-[14px] font-semibold text-[#0f3f97]">
                    Inventory
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={handleExport}
                className="hidden h-11 items-center justify-center rounded-sm bg-black px-6 text-[10px] font-black uppercase tracking-[1.5px] text-white transition hover:bg-black/90 sm:inline-flex"
              >
                Quick Export
              </button>
              <button
                onClick={handleExport}
                className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-black text-white transition hover:bg-black/90 sm:hidden"
              >
                <Download className="h-4 w-4" />
              </button>
              <div className="h-10 w-10 overflow-hidden rounded-sm border border-[#d6d1c6] bg-[#e9ecef]">
                <img
                  src="https://i.pravatar.cc/100?u=sole-admin"
                  alt="Admin avatar"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1320px] px-4 py-6 md:px-10 md:py-8 lg:px-14 lg:py-10">
          <section className="mb-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[1.6px] text-[#9b968d]">
                System controller v1.0
              </p>
              <h1 className="mt-3 text-[42px] font-black uppercase leading-[0.92] tracking-[-3px] md:text-[70px]">
                Product Inventory
              </h1>
              <p className="mt-3 text-[14px] font-medium uppercase tracking-[1.2px] text-[#5f5950] md:text-[16px]">
                Manage global catalog and stock variants
              </p>
            </div>

            <button
              onClick={openCreateDialog}
              className="inline-flex h-14 items-center justify-center gap-3 rounded-sm bg-black px-8 text-[12px] font-black uppercase tracking-[1.4px] text-white transition hover:bg-black/90 md:h-16 md:min-w-[330px]"
            >
              <Plus className="h-5 w-5" />
              Create new product
            </button>
          </section>

          {notice && (
            <div
              className={`mb-6 rounded-2xl border px-4 py-3 text-sm shadow-sm ${
                notice.type === "error"
                  ? "border-[#f5c2c7] bg-[#fff5f5] text-[#b42318]"
                  : "border-[#cfe8d5] bg-[#f0fbf4] text-[#11753b]"
              }`}
            >
              {notice.text}
            </div>
          )}

          <section className="mb-6 rounded-[26px] border border-white/80 bg-white/90 p-4 shadow-[0_12px_40px_rgba(17,17,17,0.04)] backdrop-blur md:p-5">
            <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
              <div className="flex items-center gap-3 rounded-2xl border border-[#ece8df] bg-[#fbfaf6] px-4 py-4">
                <Search className="h-5 w-5 shrink-0 text-[#8b847a]" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full bg-transparent text-sm font-semibold uppercase tracking-[1px] placeholder:text-[#b8b2a8] focus:outline-none"
                  placeholder="Search by name or brand"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-[1.4px]">
                <span className="text-[#a9a39b]">Filter by</span>
                <select
                  value={brandFilter}
                  onChange={(event) => setBrandFilter(event.target.value)}
                  className="h-11 rounded-2xl border border-[#e3ddd3] bg-white px-4 text-[11px] font-black uppercase tracking-[1.2px] outline-none"
                >
                  <option value="all">All brands</option>
                  {brands.map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="h-11 rounded-2xl border border-[#e3ddd3] bg-white px-4 text-[11px] font-black uppercase tracking-[1.2px] outline-none"
                >
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() =>
                    setStockFilter((value) => (value === "low" ? "all" : "low"))
                  }
                  className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 ${
                    stockFilter === "low"
                      ? "border-[#bb1f1f] bg-[#fff1f1] text-[#bb1f1f]"
                      : "border-[#e3ddd3] bg-white text-[#7a746b]"
                  }`}
                >
                  <span className="h-2 w-2 rounded-sm bg-[#bb1f1f]" />
                  Low stock
                </button>
                <button
                  onClick={() =>
                    setStockFilter((value) => (value === "out" ? "all" : "out"))
                  }
                  className={`inline-flex h-11 items-center gap-2 rounded-2xl border px-4 ${
                    stockFilter === "out"
                      ? "border-[#6b6b6b] bg-[#f0f0f0] text-[#4f4f4f]"
                      : "border-[#e3ddd3] bg-white text-[#7a746b]"
                  }`}
                >
                  <span className="h-2 w-2 rounded-sm bg-[#6b6b6b]" />
                  Out of stock
                </button>
                <button
                  onClick={() => {
                    setBrandFilter("all");
                    setCategoryFilter("all");
                    setStockFilter("all");
                    setSearchTerm("");
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[#e3ddd3] bg-white px-4 text-[#7a746b] transition hover:bg-[#faf8f4]"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[30px] border border-[#e9e6df] bg-white shadow-[0_12px_40px_rgba(17,17,17,0.04)]">
            <div className="border-b border-[#f0ebe3] px-5 py-4 md:px-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[1.4px] text-[#9b968d]">
                    Inventory list
                  </p>
                  <p className="mt-2 text-[22px] font-black uppercase tracking-[-1px]">
                    {numberFormatter.format(inventoryRows.length)} products
                    shown
                  </p>
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-[1.2px] text-[#8b847a]">
                  Live data from /api/products
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] border-collapse">
                <thead>
                  <tr className="border-b border-[#f0ebe3] text-left text-[10px] font-black uppercase tracking-[1.4px] text-[#9b968d]">
                    <th className="px-6 py-5">Image</th>
                    <th className="px-6 py-5">
                      <button
                        onClick={() => setSort("name")}
                        className="inline-flex items-center gap-2 transition hover:text-[#111]"
                      >
                        Product name
                        {sortKey === "name" ? (
                          sortDirection === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-5">Brand</th>
                    <th className="px-6 py-5">Category</th>
                    <th className="px-6 py-5">
                      <button
                        onClick={() => setSort("price")}
                        className="inline-flex items-center gap-2 transition hover:text-[#111]"
                      >
                        Price
                        {sortKey === "price" ? (
                          sortDirection === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-5">
                      <button
                        onClick={() => setSort("stock")}
                        className="inline-flex items-center gap-2 transition hover:text-[#111]"
                      >
                        Total stock
                        {sortKey === "stock" ? (
                          sortDirection === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <tr key={index} className="border-b border-[#f5f1ea]">
                        <td className="px-6 py-6" colSpan={7}>
                          <div className="h-20 animate-pulse rounded-2xl bg-[#f5f3ee]" />
                        </td>
                      </tr>
                    ))
                  ) : inventoryRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="mx-auto max-w-md">
                          <p className="text-[11px] font-black uppercase tracking-[1.4px] text-[#9b968d]">
                            No products found
                          </p>
                          <p className="mt-3 text-sm text-[#6f6a61]">
                            Try another search term or reset the filters to see
                            the full catalog.
                          </p>
                          <button
                            onClick={openCreateDialog}
                            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-black px-4 text-[11px] font-black uppercase tracking-[1.3px] text-white"
                          >
                            <Plus className="h-4 w-4" />
                            Create product
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    inventoryRows.map((product) => {
                      const isActive = product._id === selectedProduct?._id;
                      const health = getProductHealth(product);
                      const healthMeta = getStockMeta(health);
                      const statusMeta = getStatusMeta(product.status);
                      const totalStock = getProductStock(product);
                      const image = getProductImage(product);
                      const year = formatCreatedYear(product.createdAt);

                      return (
                        <Fragment key={product._id}>
                          <tr
                            onClick={() => setActiveProductId(product._id)}
                            className={`cursor-pointer border-b border-[#f5f1ea] transition ${
                              isActive ? "bg-[#faf8f4]" : "hover:bg-[#fcfbf7]"
                            }`}
                          >
                            <td className="px-6 py-6 align-middle">
                              <div className="h-16 w-16 overflow-hidden rounded-2xl border border-[#ece5d8] bg-[#f7f5ef]">
                                {image ? (
                                  <img
                                    src={image}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[10px] font-black uppercase tracking-[1px] text-[#9b968d]">
                                    no img
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-6 align-middle">
                              <div className="max-w-[280px]">
                                <div className="text-[17px] font-black uppercase leading-[1.05] tracking-[-0.6px]">
                                  {product.name}
                                </div>
                                <div className="mt-2 text-[11px] uppercase tracking-[1.1px] text-[#a39c92]">
                                  SKU:{" "}
                                  {product.skuPrefix ||
                                    product.variants?.[0]?.sku ||
                                    "N/A"}{" "}
                                  · {year}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-6 align-middle">
                              <div className="text-[12px] font-black uppercase tracking-[1.1px]">
                                {product.brand?.name || "—"}
                              </div>
                            </td>
                            <td className="px-6 py-6 align-middle">
                              <span className="inline-flex rounded-sm bg-[#f1ede7] px-3 py-1.5 text-[10px] font-black uppercase tracking-[1.1px] text-[#111]">
                                {product.category?.name || "—"}
                              </span>
                            </td>
                            <td className="px-6 py-6 align-middle">
                              <div className="text-[18px] font-black tracking-[-0.6px]">
                                {formatMoney(getProductPrice(product))}
                              </div>
                            </td>
                            <td className="px-6 py-6 align-middle">
                              <div className="flex items-center gap-3">
                                <div className="text-[18px] font-black tracking-[-0.6px]">
                                  {numberFormatter.format(totalStock)}
                                </div>
                                <span
                                  className={`inline-flex rounded-sm px-3 py-1.5 text-[10px] font-black uppercase tracking-[1.1px] ${healthMeta.className}`}
                                >
                                  {healthMeta.label}
                                </span>
                                <span
                                  className={`inline-flex rounded-sm px-3 py-1.5 text-[10px] font-black uppercase tracking-[1.1px] ${statusMeta.className}`}
                                >
                                  {statusMeta.label}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-6 align-middle">
                              <div
                                className="flex items-center gap-2"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <button
                                  onClick={() => openEditDialog(product)}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#ebe4d8] bg-white text-[#111] transition hover:bg-[#faf8f4]"
                                  title="Edit product"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product)}
                                  disabled={deletingId === product._id}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#ebe4d8] bg-white text-[#111] transition hover:bg-[#faf8f4] disabled:cursor-not-allowed disabled:opacity-60"
                                  title="Delete product"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    setActiveProductId(product._id)
                                  }
                                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                                    isActive
                                      ? "border-[#0f3f97] bg-[#0f3f97] text-white"
                                      : "border-[#ebe4d8] bg-white text-[#111] hover:bg-[#faf8f4]"
                                  }`}
                                  title={
                                    isActive
                                      ? "Collapse variant panel"
                                      : "Expand variant panel"
                                  }
                                >
                                  {isActive ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {isActive && (
                            <tr className="border-b border-[#f5f1ea]">
                              <td
                                colSpan={7}
                                className="bg-[#f8f6f1] px-0 py-0"
                              >
                                <div className="border-l-4 border-[#0f3f97] bg-white px-5 py-6 md:px-6">
                                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div>
                                      <p className="text-[11px] font-black uppercase tracking-[1.5px] text-[#0f3f97]">
                                        Variant management
                                      </p>
                                      <p className="mt-2 max-w-2xl text-sm text-[#6f6a61]">
                                        {Array.isArray(product.variants) &&
                                        product.variants.length > 0
                                          ? `${product.variants.length} variants are synced from the product response.`
                                          : "This product does not have variants yet."}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="inline-flex rounded-sm bg-[#f1ede7] px-3 py-1.5 text-[10px] font-black uppercase tracking-[1.1px] text-[#111]">
                                        {numberFormatter.format(
                                          Array.isArray(product.variants)
                                            ? product.variants.length
                                            : 0,
                                        )}{" "}
                                        variants
                                      </span>
                                      <button
                                        disabled
                                        className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-black px-5 text-[11px] font-black uppercase tracking-[1.3px] text-white opacity-50"
                                        title="Variant CRUD is not exposed by the backend yet"
                                      >
                                        <Plus className="h-4 w-4" />
                                        Create variant
                                      </button>
                                    </div>
                                  </div>

                                  <div className="mt-5 overflow-x-auto">
                                    <table className="w-full min-w-[860px] border-collapse">
                                      <thead>
                                        <tr className="border-b border-[#f0ebe3] text-left text-[10px] font-black uppercase tracking-[1.4px] text-[#9b968d]">
                                          <th className="px-4 py-4">Color</th>
                                          <th className="px-4 py-4">Size</th>
                                          <th className="px-4 py-4">SKU</th>
                                          <th className="px-4 py-4">Stock</th>
                                          <th className="px-4 py-4">Status</th>
                                          <th className="px-4 py-4 text-right">
                                            Actions
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {Array.isArray(product.variants) &&
                                        product.variants.length > 0 ? (
                                          product.variants.map((variant) => {
                                            const variantHealth =
                                              getVariantHealth(variant);
                                            const variantMeta =
                                              getVariantStatusMeta(
                                                variantHealth,
                                              );
                                            const swatchStyle = getColorSwatch(
                                              variant.color,
                                            );
                                            const variantImage =
                                              getVariantImage(variant);

                                            return (
                                              <tr
                                                key={variant._id}
                                                className="border-b border-[#f5f1ea]"
                                              >
                                                <td className="px-4 py-4 align-middle">
                                                  <div className="flex items-center gap-3">
                                                    <div
                                                      className="h-4 w-4 shrink-0 rounded-sm border"
                                                      style={swatchStyle}
                                                    />
                                                    {variantImage ? (
                                                      <div className="h-10 w-10 overflow-hidden rounded-xl border border-[#ece5d8] bg-[#f7f5ef]">
                                                        <img
                                                          src={variantImage}
                                                          alt={variant.color}
                                                          className="h-full w-full object-cover"
                                                        />
                                                      </div>
                                                    ) : null}
                                                    <div className="text-[12px] font-black uppercase tracking-[1.1px]">
                                                      {variant.color || "—"}
                                                    </div>
                                                  </div>
                                                </td>
                                                <td className="px-4 py-4 align-middle text-[13px] font-semibold">
                                                  {variant.size || "—"}
                                                </td>
                                                <td className="px-4 py-4 align-middle text-[12px] font-semibold uppercase tracking-[1px] text-[#6f6a61]">
                                                  {variant.sku || "—"}
                                                </td>
                                                <td className="px-4 py-4 align-middle text-[14px] font-black uppercase tracking-[0.8px]">
                                                  {numberFormatter.format(
                                                    Number(variant.stock ?? 0),
                                                  )}{" "}
                                                  units
                                                </td>
                                                <td className="px-4 py-4 align-middle">
                                                  <span
                                                    className={`inline-flex rounded-sm px-3 py-1.5 text-[10px] font-black uppercase tracking-[1.1px] ${variantMeta.className}`}
                                                  >
                                                    {variantMeta.label}
                                                  </span>
                                                </td>
                                                <td className="px-4 py-4 align-middle text-right">
                                                  <div className="inline-flex items-center gap-2">
                                                    <button
                                                      disabled
                                                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#ebe4d8] bg-white text-[#111] opacity-40"
                                                      title="Variant editing is not available yet"
                                                    >
                                                      <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                      disabled
                                                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#ebe4d8] bg-white text-[#111] opacity-40"
                                                      title="Variant deletion is not available yet"
                                                    >
                                                      <Trash2 className="h-4 w-4" />
                                                    </button>
                                                  </div>
                                                </td>
                                              </tr>
                                            );
                                          })
                                        ) : (
                                          <tr>
                                            <td
                                              colSpan={6}
                                              className="px-4 py-8 text-center text-sm text-[#6f6a61]"
                                            >
                                              No variants available for this
                                              product.
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {dashboardMetrics.map((metric) => (
              <article
                key={metric.label}
                className={`rounded-[26px] px-5 py-5 shadow-[0_12px_40px_rgba(17,17,17,0.04)] ${metric.tone}`}
              >
                <p
                  className={`text-[10px] font-black uppercase tracking-[1.4px] ${
                    metric.tone.includes("text-white")
                      ? "text-white/60"
                      : "text-[#7d766d]"
                  }`}
                >
                  {metric.label}
                </p>
                <div className="mt-4 text-[34px] font-black leading-none tracking-[-1.6px]">
                  {metric.value}
                </div>
              </article>
            ))}
          </section>

          <footer className="mt-6 rounded-[32px] bg-black px-6 py-8 text-white md:px-10 md:py-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-[28px] font-black uppercase tracking-[-1px]">
                  SOLESTYLE
                </div>
                <p className="mt-3 text-[11px] uppercase tracking-[1.2px] text-white/45">
                  © 2026 SOLESTYLE MONOLITH. ALL RIGHTS RESERVED.
                </p>
              </div>
              <div className="flex flex-wrap gap-7 text-[11px] uppercase tracking-[1.3px] text-white/45">
                <span>Privacy</span>
                <span>Terms</span>
                <span>Returns</span>
                <span>Locations</span>
              </div>
            </div>
          </footer>
        </main>
      </div>

      <ProductFormDialog
        key={`${dialogMode}-${editingProduct?._id || "new"}-${dialogOpen ? "open" : "closed"}`}
        brands={brands}
        categories={categories}
        open={dialogOpen}
        product={editingProduct}
        saving={saving}
        mode={dialogMode}
        onOpenChange={setDialogOpen}
        onSubmit={handleSaveProduct}
      />
    </div>
  );
};

export default ProductManagementPage;
