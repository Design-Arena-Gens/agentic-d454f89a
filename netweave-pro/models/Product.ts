import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  category: string;
  type: 'digital' | 'physical';
  price: number;
  commissionRate: number;
  levelCommissions: { level: number; rate: number }[];
  images: string[];
  isActive: boolean;
  stock?: number;
  downloadUrl?: string;
  createdBy: string;
  totalSales: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    type: { type: String, enum: ['digital', 'physical'], required: true },
    price: { type: Number, required: true },
    commissionRate: { type: Number, required: true, default: 10 },
    levelCommissions: [
      {
        level: { type: Number, required: true },
        rate: { type: Number, required: true },
      },
    ],
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
    stock: { type: Number },
    downloadUrl: { type: String },
    createdBy: { type: String, required: true },
    totalSales: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ isActive: 1, category: 1 });

export default (mongoose.models.Product as Model<IProduct>) || mongoose.model<IProduct>('Product', ProductSchema);
