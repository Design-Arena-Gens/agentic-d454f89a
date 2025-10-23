import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, generateAffiliateId, generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { name, email, password, phone, referredBy } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    if (referredBy) {
      const referrer = await User.findOne({ affiliateId: referredBy });
      if (!referrer) {
        return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
      }
    }

    const hashedPassword = await hashPassword(password);
    const affiliateId = generateAffiliateId();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      affiliateId,
      referredBy: referredBy || null,
    });

    if (referredBy) {
      await User.findOneAndUpdate(
        { affiliateId: referredBy },
        {
          $push: { directReferrals: affiliateId },
          $inc: { downlineCount: 1 }
        }
      );
    }

    const token = generateToken((user._id as any).toString(), user.email);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        affiliateId: user.affiliateId,
        role: user.role,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
