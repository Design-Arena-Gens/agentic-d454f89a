import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password: string;
  affiliateId: string;
  referredBy?: string;
  role: 'user' | 'admin';
  profileImage?: string;
  isActive: boolean;
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  level: number;
  downlineCount: number;
  directReferrals: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    affiliateId: { type: String, required: true, unique: true },
    referredBy: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profileImage: { type: String },
    isActive: { type: Boolean, default: true },
    totalEarnings: { type: Number, default: 0 },
    availableBalance: { type: Number, default: 0 },
    pendingBalance: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    downlineCount: { type: Number, default: 0 },
    directReferrals: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ affiliateId: 1 });
UserSchema.index({ referredBy: 1 });
UserSchema.index({ email: 1 });

export default (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);
