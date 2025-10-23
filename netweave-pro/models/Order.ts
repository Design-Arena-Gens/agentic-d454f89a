import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrder extends Document {
  orderId: string;
  userId: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  paymentMethod: string;
  paymentStatus: string;
  stripePaymentId?: string;
  affiliateId: string;
  commissionsGenerated: {
    userId: string;
    affiliateId: string;
    level: number;
    amount: number;
    status: 'pending' | 'paid';
  }[];
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, required: true },
    stripePaymentId: { type: String },
    affiliateId: { type: String, required: true },
    commissionsGenerated: [
      {
        userId: { type: String, required: true },
        affiliateId: { type: String, required: true },
        level: { type: Number, required: true },
        amount: { type: Number, required: true },
        status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
      },
    ],
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ userId: 1 });
OrderSchema.index({ orderId: 1 });
OrderSchema.index({ affiliateId: 1 });

export default (mongoose.models.Order as Model<IOrder>) || mongoose.model<IOrder>('Order', OrderSchema);
