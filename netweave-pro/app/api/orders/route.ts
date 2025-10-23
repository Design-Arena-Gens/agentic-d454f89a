import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import Commission from '@/models/Commission';
import { verifyToken } from '@/lib/auth';
import { nanoid } from 'nanoid';

async function calculateCommissions(userId: string, productId: string, amount: number, orderId: string) {
  const product = await Product.findById(productId);
  if (!product) return [];

  const user = await User.findById(userId);
  if (!user || !user.referredBy) return [];

  const commissions: any[] = [];
  let currentAffiliateId = user.referredBy;
  let level = 1;

  while (currentAffiliateId && level <= 5) {
    const uplineUser = await User.findOne({ affiliateId: currentAffiliateId });
    if (!uplineUser) break;

    const levelCommission = product.levelCommissions.find((lc: any) => lc.level === level);
    if (levelCommission) {
      const commissionAmount = (amount * levelCommission.rate) / 100;

      commissions.push({
        userId: (uplineUser._id as any).toString(),
        affiliateId: uplineUser.affiliateId,
        level,
        amount: commissionAmount,
        status: 'pending',
      });

      await Commission.create({
        userId: (uplineUser._id as any).toString(),
        affiliateId: uplineUser.affiliateId,
        orderId,
        amount: commissionAmount,
        level,
        status: 'pending',
        description: `Level ${level} commission from order ${orderId}`,
      });

      await User.findByIdAndUpdate(uplineUser._id as any, {
        $inc: { pendingBalance: commissionAmount },
      });
    }

    currentAffiliateId = uplineUser.referredBy || '';
    level++;
  }

  return commissions;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { productId, quantity = 1, shippingAddress } = await req.json();

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!product.isActive) {
      return NextResponse.json({ error: 'Product is not available' }, { status: 400 });
    }

    if (product.type === 'physical' && product.stock !== undefined && product.stock < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const totalAmount = product.price * quantity;
    const orderId = `ORD-${nanoid(10)}`;

    const order = await Order.create({
      orderId,
      userId: decoded.userId,
      productId: (product._id as any).toString(),
      productName: product.name,
      productPrice: product.price,
      quantity,
      totalAmount,
      status: 'pending',
      paymentMethod: 'stripe',
      paymentStatus: 'pending',
      affiliateId: user.affiliateId,
      shippingAddress: product.type === 'physical' ? shippingAddress : null,
      commissionsGenerated: [],
    });

    const commissions = await calculateCommissions(decoded.userId, productId, totalAmount, orderId);

    await Order.findByIdAndUpdate(order._id, {
      commissionsGenerated: commissions,
    });

    if (product.type === 'physical' && product.stock !== undefined) {
      await Product.findByIdAndUpdate(productId, {
        $inc: { stock: -quantity },
      });
    }

    return NextResponse.json({
      success: true,
      order: { ...order.toObject(), commissionsGenerated: commissions },
      clientSecret: `pi_${nanoid(24)}_secret_${nanoid(24)}`,
    }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const orders = await Order.find({ userId: decoded.userId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
