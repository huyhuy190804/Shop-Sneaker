import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  basePrice: { type: Number, required: true },
  salePrice: { type: Number },
  stock: { type: Number, default: 0 },
  productImages: [{ type: String }],
  skuPrefix: { type: String },
  averageRating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'draft' }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);

