import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../src/config/db.js";
import Order from "../src/models/orderModel.js";

dotenv.config();

const userId = new mongoose.Types.ObjectId("6634e7e2f1b2c2a1b2c3d4e5");

const main = async () => {
  await connectDB();

  const orderItems = [
    {
      productId: new mongoose.Types.ObjectId("665000000000000000000101"),
      variantId: new mongoose.Types.ObjectId("665000000000000000001001"),
      name: "Demo Runner Alpha",
      color: "black",
      size: "40",
      quantity: 1,
      price: 2190000,
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900",
    },
  ];

  await Order.findOneAndUpdate(
    { userId, "orderItems.productId": orderItems[0].productId },
    {
      userId,
      orderItems,
      shippingAddress: {
        street: "123 Demo Street",
        city: "Ho Chi Minh",
        state: "HCMC",
        zipCode: "70000",
        country: "Vietnam",
      },
      shippingMethod: "Standard",
      paymentMethod: "COD",
      taxPrice: 0,
      shippingPrice: 0,
      totalPrice: 2190000,
      isPaid: true,
      paidAt: new Date(),
      isDelivered: true,
      deliveredAt: new Date(),
      orderStatus: "Delivered",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log("Seed demo order done.");
  await mongoose.connection.close();
};

main().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
