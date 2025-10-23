import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Commission from '@/models/Commission';
import { verifyToken } from '@/lib/auth';

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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const filter: any = { userId: decoded.userId };
    if (status) filter.status = status;

    const commissions = await Commission.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, commissions });
  } catch (error) {
    console.error('Get commissions error:', error);
    return NextResponse.json({ error: 'Failed to fetch commissions' }, { status: 500 });
  }
}
