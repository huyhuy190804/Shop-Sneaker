import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant' },
  name: { type: String },
  color: { type: String },
  size: { type: String },
  quantity: { type: Number },
  price: { type: Number },
  imageUrl: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [orderItemSchema],
  shippingAddress: {
    email: String,
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    postalCode: String,
    state: String,
    country: String
  },
  shippingMethod: { type: String },
  paymentMethod: { type: String, enum: ['COD', 'BankTransfer'] },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String
  },
  taxPrice: { type: Number },
  shippingPrice: { type: Number },
  totalPrice: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date },
  orderStatus: { 
    type: String, 
    enum: ['Pending', 'Awaiting Payment', 'Shipped', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);

