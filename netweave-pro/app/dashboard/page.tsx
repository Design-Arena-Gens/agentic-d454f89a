'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface User {
  name: string;
  email: string;
  affiliateId: string;
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  directReferrals: string[];
  downlineCount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchUserData(token);
  }, [router]);

  const fetchUserData = async (token: string) => {
    try {
      const response = await axios.get('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      localStorage.removeItem('token');
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/auth/register?ref=${user?.affiliateId}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-purple-600">NetWeave Pro</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.name}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Welcome back, {user.name}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Total Earnings</p>
            <p className="text-3xl font-bold text-green-600">${user.totalEarnings.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Available Balance</p>
            <p className="text-3xl font-bold text-blue-600">${user.availableBalance.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Pending Balance</p>
            <p className="text-3xl font-bold text-yellow-600">${user.pendingBalance.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm mb-2">Total Network</p>
            <p className="text-3xl font-bold text-purple-600">{user.downlineCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Affiliate ID</h3>
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <p className="text-2xl font-mono font-bold text-center text-purple-600">
                {user.affiliateId}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={copyReferralLink}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy Referral Link'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Direct Referrals</span>
                <span className="font-bold text-gray-900">{user.directReferrals.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Network</span>
                <span className="font-bold text-gray-900">{user.downlineCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Email</span>
                <span className="font-bold text-gray-900 text-sm">{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/products"
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <h3 className="text-xl font-bold mb-2">Browse Products</h3>
            <p className="text-purple-100">Explore and purchase products</p>
          </Link>

          <Link
            href="/downline"
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <h3 className="text-xl font-bold mb-2">View Network</h3>
            <p className="text-blue-100">See your downline structure</p>
          </Link>

          <Link
            href="/commissions"
            className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <h3 className="text-xl font-bold mb-2">Commissions</h3>
            <p className="text-green-100">Track your earnings</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
