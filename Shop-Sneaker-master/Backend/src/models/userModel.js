import mongoose from "mongoose";

const shippingAddressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  isDefault: Boolean
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: "" }, // hashed password or empty for OAuth-only users
  googleId: { type: String },
  avatar: { type: String },
  authProvider: { type: String, default: "local" },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  lastLoginAt: { type: Date },
  shippingAddresses: [shippingAddressSchema],
  phone: { type: String },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);

