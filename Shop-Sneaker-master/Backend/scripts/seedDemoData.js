import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../src/config/db.js";
import Category from "../src/models/categoryModel.js";
import Brand from "../src/models/brandModel.js";
import Product from "../src/models/productModel.js";
import Variant from "../src/models/variantModel.js";
import User from "../src/models/userModel.js";
import Coupon from "../src/models/couponModel.js";
import Cart from "../src/models/cartModel.js";
import Order from "../src/models/orderModel.js";
import Review from "../src/models/reviewModel.js";

dotenv.config();

const ids = {
  users: {
    storefrontDemo: new mongoose.Types.ObjectId("6634e7e2f1b2c2a1b2c3d4e5"),
    adminDemo: new mongoose.Types.ObjectId("6634e7e2f1b2c2a1b2c3d4e6"),
    sneakerCollector: new mongoose.Types.ObjectId("6634e7e2f1b2c2a1b2c3d4e7"),
  },
};

const categories = [
  {
    name: "Running",
    slug: "running",
    description: "Giày chạy bộ, êm chân và nhẹ",
  },
  {
    name: "Basketball",
    slug: "basketball",
    description: "Giày bóng rổ, hỗ trợ cổ chân tốt",
  },
  {
    name: "Casual",
    slug: "casual",
    description: "Giày lifestyle dễ phối đồ",
  },
  {
    name: "Outdoor",
    slug: "outdoor",
    description: "Giày đi dã ngoại, bền bỉ",
  },
];

const brands = [
  {
    name: "Nike",
    slug: "nike",
    description: "Sneaker performance và lifestyle",
  },
  {
    name: "Adidas",
    slug: "adidas",
    description: "Thiết kế thể thao tối giản",
  },
  {
    name: "Puma",
    slug: "puma",
    description: "Phong cách năng động, hiện đại",
  },
  {
    name: "New Balance",
    slug: "new-balance",
    description: "Êm ái, cân bằng giữa performance và lifestyle",
  },
  {
    name: "Asics",
    slug: "asics",
    description: "Tập trung vào sự ổn định và hiệu suất chạy bộ",
  },
];

const productSeed = [
  {
    name: 'VELOCITY X 1 "CINNAMON"',
    slug: "velocity-x-1-cinnamon",
    description: "Premium comfort running shoe",
    brand: "Nike",
    category: "Running",
    basePrice: 4190000,
    salePrice: 3790000,
    productImages: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900"],
    skuPrefix: "VX1",
    averageRating: 4.5,
    numReviews: 24,
    isFeatured: true,
    status: "active",
    variants: [
      { color: "black", size: "40", sku: "VX1-BLK-40", stock: 8, variantImages: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900"] },
      { color: "black", size: "41", sku: "VX1-BLK-41", stock: 6, variantImages: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900"] },
      { color: "white", size: "40", sku: "VX1-WHT-40", stock: 10, variantImages: ["https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=900"] },
    ],
  },
  {
    name: "AEROSTRIKE MINIMALIST",
    slug: "aerostrike-minimalist",
    description: "Lightweight minimalist design",
    brand: "Adidas",
    category: "Running",
    basePrice: 3590000,
    salePrice: 3290000,
    productImages: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900"],
    skuPrefix: "AS1",
    averageRating: 4.7,
    numReviews: 18,
    isFeatured: true,
    status: "active",
    variants: [
      { color: "white", size: "40", sku: "AS1-WHT-40", stock: 12, variantImages: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900"] },
      { color: "white", size: "42", sku: "AS1-WHT-42", stock: 9, variantImages: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900"] },
      { color: "gray", size: "41", sku: "AS1-GRY-41", stock: 7, variantImages: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=900"] },
    ],
  },
  {
    name: "TITAN RISE HIGH-TOP",
    slug: "titan-rise-high-top",
    description: "High performance basketball shoe",
    brand: "Puma",
    category: "Basketball",
    basePrice: 4890000,
    salePrice: null,
    productImages: ["https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=900"],
    skuPrefix: "TRH",
    averageRating: 4.3,
    numReviews: 32,
    isFeatured: true,
    status: "active",
    variants: [
      { color: "black", size: "41", sku: "TRH-BLK-41", stock: 5, variantImages: ["https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=900"] },
      { color: "blue", size: "42", sku: "TRH-BLU-42", stock: 4, variantImages: ["https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=900"] },
      { color: "black", size: "43", sku: "TRH-BLK-43", stock: 3, variantImages: ["https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=900"] },
    ],
  },
  {
    name: "LEGACY STREET LOW",
    slug: "legacy-street-low",
    description: "Classic street style low-top",
    brand: "Nike",
    category: "Casual",
    basePrice: 2490000,
    salePrice: 2190000,
    productImages: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=900"],
    skuPrefix: "LSL",
    averageRating: 4.6,
    numReviews: 12,
    isFeatured: false,
    status: "active",
    variants: [
      { color: "white", size: "40", sku: "LSL-WHT-40", stock: 10, variantImages: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=900"] },
      { color: "black", size: "41", sku: "LSL-BLK-41", stock: 7, variantImages: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=900"] },
      { color: "red", size: "42", sku: "LSL-RED-42", stock: 5, variantImages: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=900"] },
    ],
  },
  {
    name: "NEON PULSE KINETIC",
    slug: "neon-pulse-kinetic",
    description: "Limited edition neon colorway",
    brand: "Adidas",
    category: "Running",
    basePrice: 4290000,
    salePrice: 3990000,
    productImages: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=900"],
    skuPrefix: "NPK",
    averageRating: 4.9,
    numReviews: 9,
    isFeatured: true,
    status: "active",
    variants: [
      { color: "neon", size: "40", sku: "NPK-NEO-40", stock: 2, variantImages: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=900"] },
      { color: "black", size: "41", sku: "NPK-BLK-41", stock: 4, variantImages: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=900"] },
    ],
  },
  {
    name: "SHADOW STEALTH CI",
    slug: "shadow-stealth-ci",
    description: "Stealth design for courts",
    brand: "Puma",
    category: "Basketball",
    basePrice: 5290000,
    salePrice: 4990000,
    productImages: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900"],
    skuPrefix: "SSC",
    averageRating: 4.4,
    numReviews: 21,
    isFeatured: false,
    status: "active",
    variants: [
      { color: "black", size: "42", sku: "SSC-BLK-42", stock: 6, variantImages: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900"] },
      { color: "black", size: "43", sku: "SSC-BLK-43", stock: 4, variantImages: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900"] },
    ],
  },
  {
    name: "URBAN FLEX LITE",
    slug: "urban-flex-lite",
    description: "Comfortable urban lifestyle shoe",
    brand: "Nike",
    category: "Casual",
    basePrice: 2790000,
    salePrice: 2590000,
    productImages: ["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=900"],
    skuPrefix: "UFL",
    averageRating: 4.2,
    numReviews: 7,
    isFeatured: false,
    status: "active",
    variants: [
      { color: "gray", size: "40", sku: "UFL-GRY-40", stock: 11, variantImages: ["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=900"] },
      { color: "black", size: "41", sku: "UFL-BLK-41", stock: 8, variantImages: ["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=900"] },
    ],
  },
  {
    name: "TRAIL BLAZER PRO",
    slug: "trail-blazer-pro",
    description: "Rugged outdoor trail shoe",
    brand: "Adidas",
    category: "Outdoor",
    basePrice: 4590000,
    salePrice: 4190000,
    productImages: ["https://images.unsplash.com/photo-1539185441755-769473a23570?w=900"],
    skuPrefix: "TBP",
    averageRating: 4.7,
    numReviews: 14,
    isFeatured: false,
    status: "active",
    variants: [
      { color: "khaki", size: "41", sku: "TBP-KHK-41", stock: 6, variantImages: ["https://images.unsplash.com/photo-1539185441755-769473a23570?w=900"] },
      { color: "black", size: "42", sku: "TBP-BLK-42", stock: 7, variantImages: ["https://images.unsplash.com/photo-1539185441755-769473a23570?w=900"] },
    ],
  },
  {
    name: "CLASSIC RETRO",
    slug: "classic-retro",
    description: "Retro inspired classic design",
    brand: "Puma",
    category: "Casual",
    basePrice: 2190000,
    salePrice: 1890000,
    productImages: ["https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=900"],
    skuPrefix: "CRT",
    averageRating: 4.5,
    numReviews: 11,
    isFeatured: false,
    status: "active",
    variants: [
      { color: "cream", size: "40", sku: "CRT-CRM-40", stock: 13, variantImages: ["https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=900"] },
      { color: "navy", size: "41", sku: "CRT-NVY-41", stock: 9, variantImages: ["https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=900"] },
    ],
  },
  {
    name: "FOAM ARC TRAINER",
    slug: "foam-arc-trainer",
    description: "Responsive daily trainer with cushioned landing and quick toe-off.",
    brand: "New Balance",
    category: "Running",
    basePrice: 3890000,
    salePrice: 3490000,
    productImages: ["https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=900"],
    skuPrefix: "FAT",
    averageRating: 4.8,
    numReviews: 19,
    isFeatured: true,
    status: "active",
    variants: [
      { color: "silver", size: "40", sku: "FAT-SLV-40", stock: 9, variantImages: ["https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=900"] },
      { color: "lime", size: "41", sku: "FAT-LIM-41", stock: 6, variantImages: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900"] },
      { color: "navy", size: "42", sku: "FAT-NVY-42", stock: 7, variantImages: ["https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=900"] },
    ],
  },
  {
    name: "COURT VISION EDGE",
    slug: "court-vision-edge",
    description: "Low-top court-inspired sneaker with layered leather panels.",
    brand: "Nike",
    category: "Basketball",
    basePrice: 3290000,
    salePrice: 2990000,
    productImages: ["https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=900"],
    skuPrefix: "CVE",
    averageRating: 4.1,
    numReviews: 16,
    isFeatured: false,
    status: "active",
    variants: [
      { color: "white", size: "41", sku: "CVE-WHT-41", stock: 8, variantImages: ["https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=900"] },
      { color: "green", size: "42", sku: "CVE-GRN-42", stock: 5, variantImages: ["https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=900"] },
    ],
  },
  {
    name: "METRO KNIT SLIP",
    slug: "metro-knit-slip",
    description: "Minimal knit sneaker tuned for commuting and daily errands.",
    brand: "Adidas",
    category: "Casual",
    basePrice: 2390000,
    salePrice: 2090000,
    productImages: ["https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=900"],
    skuPrefix: "MKS",
    averageRating: 4.4,
    numReviews: 13,
    isFeatured: false,
    status: "active",
    variants: [
      { color: "sand", size: "39", sku: "MKS-SND-39", stock: 10, variantImages: ["https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=900"] },
      { color: "black", size: "40", sku: "MKS-BLK-40", stock: 12, variantImages: ["https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=900"] },
      { color: "stone", size: "41", sku: "MKS-STN-41", stock: 6, variantImages: ["https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=900"] },
    ],
  },
  {
    name: "RIDGELINE GTX",
    slug: "ridgeline-gtx",
    description: "Weather-ready outdoor sneaker for wet pavement and light trails.",
    brand: "Asics",
    category: "Outdoor",
    basePrice: 4990000,
    salePrice: 4590000,
    productImages: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=900"],
    skuPrefix: "RGT",
    averageRating: 4.9,
    numReviews: 28,
    isFeatured: true,
    status: "active",
    variants: [
      { color: "olive", size: "41", sku: "RGT-OLV-41", stock: 4, variantImages: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=900"] },
      { color: "charcoal", size: "42", sku: "RGT-CHR-42", stock: 5, variantImages: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=900"] },
    ],
  },
  {
    name: "SUNSET RACER S",
    slug: "sunset-racer-s",
    description: "Lightweight racing silhouette with aggressive rocker geometry.",
    brand: "Asics",
    category: "Running",
    basePrice: 4690000,
    salePrice: 4290000,
    productImages: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900"],
    skuPrefix: "SRS",
    averageRating: 4.8,
    numReviews: 22,
    isFeatured: true,
    status: "active",
    variants: [
      { color: "orange", size: "40", sku: "SRS-ORG-40", stock: 5, variantImages: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900"] },
      { color: "white", size: "41", sku: "SRS-WHT-41", stock: 8, variantImages: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900"] },
      { color: "black", size: "42", sku: "SRS-BLK-42", stock: 6, variantImages: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900"] },
    ],
  },
  {
    name: "CITY CANVAS 88",
    slug: "city-canvas-88",
    description: "Relaxed everyday sneaker with vintage rubber foxing and canvas upper.",
    brand: "Puma",
    category: "Casual",
    basePrice: 1890000,
    salePrice: 1690000,
    productImages: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=900"],
    skuPrefix: "CC8",
    averageRating: 4.0,
    numReviews: 8,
    isFeatured: false,
    status: "active",
    variants: [
      { color: "cream", size: "39", sku: "CC8-CRM-39", stock: 11, variantImages: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=900"] },
      { color: "black", size: "40", sku: "CC8-BLK-40", stock: 7, variantImages: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=900"] },
    ],
  },
];

const users = [
  {
    _id: ids.users.storefrontDemo,
    name: "Demo Shopper",
    email: "demo@shopsneaker.local",
    password: "dev-demo-password",
    role: "user",
    phone: "0901000100",
    shippingAddresses: [
      {
        street: "123 Nguyen Hue",
        city: "Ho Chi Minh",
        state: "District 1",
        zipCode: "700000",
        country: "Vietnam",
        isDefault: true,
      },
    ],
  },
  {
    _id: ids.users.adminDemo,
    name: "Demo Admin",
    email: "admin@shopsneaker.local",
    password: "dev-admin-password",
    role: "admin",
    phone: "0901000200",
    shippingAddresses: [
      {
        street: "88 Le Loi",
        city: "Ho Chi Minh",
        state: "District 1",
        zipCode: "700000",
        country: "Vietnam",
        isDefault: true,
      },
    ],
  },
  {
    _id: ids.users.sneakerCollector,
    name: "Sneaker Collector",
    email: "collector@shopsneaker.local",
    password: "dev-collector-password",
    role: "user",
    phone: "0901000300",
    shippingAddresses: [
      {
        street: "45 Han Thuyen",
        city: "Da Nang",
        state: "Hai Chau",
        zipCode: "550000",
        country: "Vietnam",
        isDefault: true,
      },
    ],
  },
];

const seed = async () => {
  await connectDB();

  const categoryDocs = {};
  const brandDocs = {};
  const productDocs = {};
  const variantDocs = {};

  for (const category of categories) {
    const doc = await Category.findOneAndUpdate(
      { slug: category.slug },
      category,
      { upsert: true, new: true }
    );
    categoryDocs[doc.name] = doc;
  }

  for (const brand of brands) {
    const doc = await Brand.findOneAndUpdate(
      { slug: brand.slug },
      brand,
      { upsert: true, new: true }
    );
    brandDocs[doc.name] = doc;
  }

  for (const user of users) {
    await User.findOneAndUpdate(
      { email: user.email },
      user,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  for (const productData of productSeed) {
    const brand = brandDocs[productData.brand];
    const category = categoryDocs[productData.category];

    const { variants = [], ...rest } = productData;
    const product = await Product.findOneAndUpdate(
      { slug: rest.slug },
      {
        ...rest,
        brand: brand._id,
        category: category._id,
      },
      { upsert: true, new: true }
    );
    productDocs[rest.slug] = product;

    await Variant.deleteMany({ productId: product._id });
    const variantPayload = variants.map((variant) => ({
      ...variant,
      productId: product._id,
    }));
    const insertedVariants = await Variant.insertMany(variantPayload);
    insertedVariants.forEach((variant) => {
      variantDocs[variant.sku] = variant;
    });
  }

  const coupons = [
    {
      code: "WELCOME10",
      discountType: "percentage",
      value: 10,
      minOrderAmount: 1500000,
      maxDiscountAmount: 300000,
      usageLimit: 200,
      usedCount: 12,
      validFrom: new Date("2026-01-01T00:00:00.000Z"),
      validUntil: new Date("2026-12-31T23:59:59.999Z"),
      isActive: true,
      appliesTo: "all",
    },
    {
      code: "RUNFAST15",
      discountType: "percentage",
      value: 15,
      minOrderAmount: 2500000,
      maxDiscountAmount: 500000,
      usageLimit: 80,
      usedCount: 9,
      validFrom: new Date("2026-01-01T00:00:00.000Z"),
      validUntil: new Date("2026-10-31T23:59:59.999Z"),
      isActive: true,
      appliesTo: "categories",
      categoryIds: [categoryDocs.Running._id],
    },
    {
      code: "CITYKICK200",
      discountType: "fixed",
      value: 200000,
      minOrderAmount: 1800000,
      usageLimit: 50,
      usedCount: 3,
      validFrom: new Date("2026-01-01T00:00:00.000Z"),
      validUntil: new Date("2026-08-31T23:59:59.999Z"),
      isActive: true,
      appliesTo: "products",
      productIds: [productDocs["legacy-street-low"]._id, productDocs["city-canvas-88"]._id],
    },
  ];

  for (const coupon of coupons) {
    await Coupon.findOneAndUpdate(
      { code: coupon.code },
      coupon,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  await Review.deleteMany({
    userId: { $in: Object.values(ids.users) },
  });

  await Review.insertMany([
    {
      userId: ids.users.storefrontDemo,
      productId: productDocs["velocity-x-1-cinnamon"]._id,
      rating: 5,
      comment: "Foam is mềm, upper ôm chân và phối màu rất dễ mặc hằng ngày.",
      status: "approved",
    },
    {
      userId: ids.users.storefrontDemo,
      productId: productDocs["foam-arc-trainer"]._id,
      rating: 4,
      comment: "Êm và bật tốt khi chạy tempo, chỉ hơi nóng chân vào buổi trưa.",
      status: "approved",
    },
    {
      userId: ids.users.sneakerCollector,
      productId: productDocs["ridgeline-gtx"]._id,
      rating: 5,
      comment: "Đi mưa ổn, đế bám tốt, form chắc chân khi leo dốc ngắn.",
      status: "approved",
    },
    {
      userId: ids.users.sneakerCollector,
      productId: productDocs["metro-knit-slip"]._id,
      rating: 4,
      comment: "Rất hợp để đi làm hằng ngày, phần cổ giày co giãn tốt.",
      status: "pending",
    },
  ]);

  await Cart.findOneAndUpdate(
    { userId: ids.users.storefrontDemo },
    {
      userId: ids.users.storefrontDemo,
      items: [
        {
          productId: productDocs["velocity-x-1-cinnamon"]._id,
          variantId: variantDocs["VX1-BLK-40"]._id,
          quantity: 1,
          price: 3790000,
        },
        {
          productId: productDocs["city-canvas-88"]._id,
          variantId: variantDocs["CC8-CRM-39"]._id,
          quantity: 2,
          price: 1690000,
        },
      ],
      couponCode: "WELCOME10",
      discountAmount: 300000,
      subtotal: 7170000,
      totalPrice: 6870000,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await Order.deleteMany({
    userId: { $in: [ids.users.storefrontDemo, ids.users.sneakerCollector] },
  });

  await Order.insertMany([
    {
      userId: ids.users.storefrontDemo,
      orderItems: [
        {
          productId: productDocs["velocity-x-1-cinnamon"]._id,
          variantId: variantDocs["VX1-BLK-41"]._id,
          name: "VELOCITY X 1 \"CINNAMON\"",
          color: "black",
          size: "41",
          quantity: 1,
          price: 3790000,
          imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900",
        },
      ],
      shippingAddress: {
        street: "123 Nguyen Hue",
        city: "Ho Chi Minh",
        state: "District 1",
        zipCode: "700000",
        country: "Vietnam",
      },
      shippingMethod: "Express",
      paymentMethod: "COD",
      taxPrice: 0,
      shippingPrice: 30000,
      totalPrice: 3820000,
      isPaid: true,
      paidAt: new Date("2026-04-12T09:10:00.000Z"),
      isDelivered: true,
      deliveredAt: new Date("2026-04-15T12:00:00.000Z"),
      orderStatus: "Delivered",
    },
    {
      userId: ids.users.storefrontDemo,
      orderItems: [
        {
          productId: productDocs["foam-arc-trainer"]._id,
          variantId: variantDocs["FAT-NVY-42"]._id,
          name: "FOAM ARC TRAINER",
          color: "navy",
          size: "42",
          quantity: 1,
          price: 3490000,
          imageUrl: "https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=900",
        },
        {
          productId: productDocs["metro-knit-slip"]._id,
          variantId: variantDocs["MKS-BLK-40"]._id,
          name: "METRO KNIT SLIP",
          color: "black",
          size: "40",
          quantity: 1,
          price: 2090000,
          imageUrl: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=900",
        },
      ],
      shippingAddress: {
        street: "123 Nguyen Hue",
        city: "Ho Chi Minh",
        state: "District 1",
        zipCode: "700000",
        country: "Vietnam",
      },
      shippingMethod: "Standard",
      paymentMethod: "Bank Transfer",
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: 5580000,
      isPaid: false,
      isDelivered: false,
      orderStatus: "Pending",
    },
    {
      userId: ids.users.sneakerCollector,
      orderItems: [
        {
          productId: productDocs["ridgeline-gtx"]._id,
          variantId: variantDocs["RGT-CHR-42"]._id,
          name: "RIDGELINE GTX",
          color: "charcoal",
          size: "42",
          quantity: 1,
          price: 4590000,
          imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=900",
        },
      ],
      shippingAddress: {
        street: "45 Han Thuyen",
        city: "Da Nang",
        state: "Hai Chau",
        zipCode: "550000",
        country: "Vietnam",
      },
      shippingMethod: "Standard",
      paymentMethod: "Momo",
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: 4590000,
      isPaid: true,
      paidAt: new Date("2026-05-01T10:15:00.000Z"),
      isDelivered: false,
      orderStatus: "Shipped",
    },
  ]);

  console.log("Demo data seeded successfully with catalog, users, cart, coupons, reviews, and orders.");
  await mongoose.connection.close();
};

seed().catch(async (error) => {
  console.error("Seed failed:", error);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
