import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

async function buildDownlineTree(affiliateId: string, maxDepth = 5, currentDepth = 0): Promise<any> {
  if (currentDepth >= maxDepth) return null;

  const user = await User.findOne({ affiliateId }).select('-password');
  if (!user) return null;

  const directReferrals = await User.find({ referredBy: affiliateId }).select('-password');

  const children = await Promise.all(
    directReferrals.map(async (ref) => {
      const childTree = await buildDownlineTree(ref.affiliateId, maxDepth, currentDepth + 1);
      return childTree;
    })
  );

  return {
    name: user.name,
    affiliateId: user.affiliateId,
    email: user.email,
    level: currentDepth + 1,
    totalEarnings: user.totalEarnings,
    joinedAt: user.createdAt,
    directReferrals: user.directReferrals.length,
    children: children.filter(Boolean),
  };
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

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const downlineTree = await buildDownlineTree(user.affiliateId);

    return NextResponse.json({ success: true, downline: downlineTree });
  } catch (error) {
    console.error('Get downline error:', error);
    return NextResponse.json({ error: 'Failed to fetch downline' }, { status: 500 });
  }
}
