import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICommission extends Document {
  userId: string;
  affiliateId: string;
  orderId: string;
  amount: number;
  level: number;
  status: 'pending' | 'paid' | 'cancelled';
  paidAt?: Date;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommissionSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    affiliateId: { type: String, required: true },
    orderId: { type: String, required: true },
    amount: { type: Number, required: true },
    level: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
    paidAt: { type: Date },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

CommissionSchema.index({ userId: 1, status: 1 });
CommissionSchema.index({ affiliateId: 1 });

export default (mongoose.models.Commission as Model<ICommission>) || mongoose.model<ICommission>('Commission', CommissionSchema);
