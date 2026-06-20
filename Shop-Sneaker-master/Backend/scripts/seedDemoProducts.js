import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../src/config/db.js";
import Category from "../src/models/categoryModel.js";
import Brand from "../src/models/brandModel.js";
import Product from "../src/models/productModel.js";
import Variant from "../src/models/variantModel.js";

dotenv.config();

const ids = {
  categories: {
    running: new mongoose.Types.ObjectId("665000000000000000000001"),
    basketball: new mongoose.Types.ObjectId("665000000000000000000002"),
    casual: new mongoose.Types.ObjectId("665000000000000000000003"),
  },
  brands: {
    nike: new mongoose.Types.ObjectId("665000000000000000000011"),
    adidas: new mongoose.Types.ObjectId("665000000000000000000012"),
  },
  products: {
    runnerAlpha: new mongoose.Types.ObjectId("665000000000000000000101"),
    courtBeta: new mongoose.Types.ObjectId("665000000000000000000102"),
    streetGamma: new mongoose.Types.ObjectId("665000000000000000000103"),
    trailDelta: new mongoose.Types.ObjectId("665000000000000000000104"),
  },
  variants: {
    runnerAlphaBlack40: new mongoose.Types.ObjectId("665000000000000000001001"),
    runnerAlphaBlack41: new mongoose.Types.ObjectId("665000000000000000001002"),
    runnerAlphaWhite40: new mongoose.Types.ObjectId("665000000000000000001003"),
    courtBetaBlue41: new mongoose.Types.ObjectId("665000000000000000001004"),
    courtBetaBlack42: new mongoose.Types.ObjectId("665000000000000000001005"),
    streetGammaWhite40: new mongoose.Types.ObjectId("665000000000000000001006"),
    streetGammaRed41: new mongoose.Types.ObjectId("665000000000000000001007"),
    trailDeltaKhaki42: new mongoose.Types.ObjectId("665000000000000000001008"),
    trailDeltaBlack43: new mongoose.Types.ObjectId("665000000000000000001009"),
  },
};

const categories = [
  {
    _id: ids.categories.running,
    name: "Running",
    slug: "running",
    description: "Giày chạy bộ",
  },
  {
    _id: ids.categories.basketball,
    name: "Basketball",
    slug: "basketball",
    description: "Giày bóng rổ",
  },
  {
    _id: ids.categories.casual,
    name: "Casual",
    slug: "casual",
    description: "Giày lifestyle",
  },
];

const brands = [
  {
    _id: ids.brands.nike,
    name: "Nike",
    slug: "nike",
    description: "Sneaker performance và lifestyle",
  },
  {
    _id: ids.brands.adidas,
    name: "Adidas",
    slug: "adidas",
    description: "Thiết kế thể thao tối giản",
  },
];

const demoProducts = [
  {
    _id: ids.products.runnerAlpha,
    name: "Demo Runner Alpha",
    slug: "demo-runner-alpha",
    description: "Mẫu giày chạy bộ demo để test add to cart.",
    brand: ids.brands.nike,
    category: ids.categories.running,
    basePrice: 2490000,
    salePrice: 2190000,
    productImages: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900"],
    skuPrefix: "DRA",
    averageRating: 4.6,
    numReviews: 12,
    isFeatured: true,
    status: "active",
    variants: [
      {
        _id: ids.variants.runnerAlphaBlack40,
        color: "black",
        size: "40",
        sku: "DRA-BLK-40",
        stock: 10,
        variantImages: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900"],
      },
      {
        _id: ids.variants.runnerAlphaBlack41,
        color: "black",
        size: "41",
        sku: "DRA-BLK-41",
        stock: 8,
        variantImages: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900"],
      },
      {
        _id: ids.variants.runnerAlphaWhite40,
        color: "white",
        size: "40",
        sku: "DRA-WHT-40",
        stock: 7,
        variantImages: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900"],
      },
    ],
  },
  {
    _id: ids.products.courtBeta,
    name: "Demo Court Beta",
    slug: "demo-court-beta",
    description: "Mẫu giày bóng rổ demo để test biến thể và số lượng.",
    brand: ids.brands.adidas,
    category: ids.categories.basketball,
    basePrice: 2890000,
    salePrice: null,
    productImages: ["https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=900"],
    skuPrefix: "DCB",
    averageRating: 4.4,
    numReviews: 9,
    isFeatured: false,
    status: "active",
    variants: [
      {
        _id: ids.variants.courtBetaBlue41,
        color: "blue",
        size: "41",
        sku: "DCB-BLU-41",
        stock: 6,
        variantImages: ["https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=900"],
      },
      {
        _id: ids.variants.courtBetaBlack42,
        color: "black",
        size: "42",
        sku: "DCB-BLK-42",
        stock: 5,
        variantImages: ["https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=900"],
      },
    ],
  },
  {
    _id: ids.products.streetGamma,
    name: "Demo Street Gamma",
    slug: "demo-street-gamma",
    description: "Mẫu lifestyle demo để thử add to cart nhanh.",
    brand: ids.brands.nike,
    category: ids.categories.casual,
    basePrice: 1790000,
    salePrice: 1590000,
    productImages: ["https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=900"],
    skuPrefix: "DSG",
    averageRating: 4.2,
    numReviews: 6,
    isFeatured: false,
    status: "active",
    variants: [
      {
        _id: ids.variants.streetGammaWhite40,
        color: "white",
        size: "40",
        sku: "DSG-WHT-40",
        stock: 12,
        variantImages: ["https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=900"],
      },
      {
        _id: ids.variants.streetGammaRed41,
        color: "red",
        size: "41",
        sku: "DSG-RED-41",
        stock: 9,
        variantImages: ["https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=900"],
      },
    ],
  },
  {
    _id: ids.products.trailDelta,
    name: "Demo Trail Delta",
    slug: "demo-trail-delta",
    description: "Mẫu outdoor demo để test giỏ hàng nhiều sản phẩm.",
    brand: ids.brands.adidas,
    category: ids.categories.running,
    basePrice: 1990000,
    salePrice: 1790000,
    productImages: ["https://images.unsplash.com/photo-1539185441755-769473a23570?w=900"],
    skuPrefix: "DTD",
    averageRating: 4.7,
    numReviews: 15,
    isFeatured: true,
    status: "active",
    variants: [
      {
        _id: ids.variants.trailDeltaKhaki42,
        color: "khaki",
        size: "42",
        sku: "DTD-KHK-42",
        stock: 4,
        variantImages: ["https://images.unsplash.com/photo-1539185441755-769473a23570?w=900"],
      },
      {
        _id: ids.variants.trailDeltaBlack43,
        color: "black",
        size: "43",
        sku: "DTD-BLK-43",
        stock: 3,
        variantImages: ["https://images.unsplash.com/photo-1539185441755-769473a23570?w=900"],
      },
    ],
  },
];

const main = async () => {
  await connectDB();

  for (const category of categories) {
    await Category.findOneAndUpdate({ slug: category.slug }, category, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }

  for (const brand of brands) {
    await Brand.findOneAndUpdate({ slug: brand.slug }, brand, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }

  for (const demo of demoProducts) {
    const { variants, ...productData } = demo;
    const product = await Product.findOneAndUpdate(
      { slug: productData.slug },
      productData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await Variant.deleteMany({ productId: product._id });
    await Variant.insertMany(
      variants.map((variant) => ({
        ...variant,
        productId: product._id,
      }))
    );
  }

  console.log("Seed demo products done.");
  await mongoose.connection.close();
};

main().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
