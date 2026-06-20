import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  color: { type: String, required: true },
  size: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  stock: { type: Number, required: true, default: 0 },
  variantImages: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Variant', variantSchema);

