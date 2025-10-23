'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

interface Order {
  _id: string;
  orderId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: string;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchOrders(token);
  }, [router]);

  const fetchOrders = async (token: string) => {
    try {
      const response = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h2>
          <p className="text-gray-600">View your purchase history</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-700">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-xl text-gray-700 mb-4">No orders yet</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{order.productName}</h3>
                    <p className="text-sm text-gray-600">Order ID: {order.orderId}</p>
                    <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                    <span
                      className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Unit Price</p>
                    <p className="font-semibold text-gray-900">${order.productPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Quantity</p>
                    <p className="font-semibold text-gray-900">{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Status</p>
                    <p className="font-semibold text-gray-900">{order.paymentStatus}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Amount</p>
                    <p className="font-semibold text-green-600">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
