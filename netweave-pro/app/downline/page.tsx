'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface DownlineNode {
  name: string;
  affiliateId: string;
  email: string;
  level: number;
  totalEarnings: number;
  joinedAt: string;
  directReferrals: number;
  children: DownlineNode[];
}

function TreeNode({ node, depth = 0 }: { node: DownlineNode; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);

  return (
    <div className="ml-4">
      <div
        className={`border-l-2 border-purple-300 pl-4 py-2 ${
          depth === 0 ? 'border-l-4 border-purple-600' : ''
        }`}
      >
        <div
          className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => node.children.length > 0 && setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-bold text-gray-900">{node.name}</h3>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  Level {node.level}
                </span>
              </div>
              <p className="text-sm text-gray-600">ID: {node.affiliateId}</p>
              <p className="text-sm text-gray-600">{node.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-xs text-gray-500">
                  Direct Referrals: {node.directReferrals}
                </span>
                <span className="text-xs text-green-600 font-semibold">
                  Earnings: ${node.totalEarnings.toFixed(2)}
                </span>
              </div>
            </div>
            {node.children.length > 0 && (
              <div className="ml-4">
                <span className="text-2xl text-gray-400">
                  {isExpanded ? '▼' : '▶'}
                </span>
              </div>
            )}
          </div>
        </div>

        {isExpanded && node.children.length > 0 && (
          <div className="mt-2">
            {node.children.map((child, index) => (
              <TreeNode key={`${child.affiliateId}-${index}`} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DownlinePage() {
  const router = useRouter();
  const [downline, setDownline] = useState<DownlineNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchDownline(token);
  }, [router]);

  const fetchDownline = async (token: string) => {
    try {
      const response = await axios.get('/api/users/downline', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setDownline(response.data.downline);
      }
    } catch (error) {
      console.error('Failed to fetch downline:', error);
    } finally {
      setLoading(false);
    }
  };

  const countTotalNodes = (node: DownlineNode | null): number => {
    if (!node) return 0;
    return 1 + node.children.reduce((sum, child) => sum + countTotalNodes(child), 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold text-purple-600 cursor-pointer">NetWeave Pro</h1>
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Network</h2>
          <p className="text-gray-600">Visualize your downline structure and team growth</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-700">Loading network...</p>
          </div>
        ) : !downline ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-700">No network data available</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Total Network Size</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {countTotalNodes(downline) - 1}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Direct Referrals</p>
                  <p className="text-3xl font-bold text-blue-600">{downline.directReferrals}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Your Total Earnings</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${downline.totalEarnings.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Network Tree</h3>
              <div className="overflow-x-auto">
                <TreeNode node={downline} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
