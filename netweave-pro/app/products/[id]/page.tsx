'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  type: 'digital' | 'physical';
  category: string;
  commissionRate: number;
  levelCommissions: { level: number; rate: number }[];
  stock?: number;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    if (params.id) {
      fetchProduct(params.id as string);
    }
  }, [router, params.id]);

  const fetchProduct = async (id: string) => {
    try {
      const response = await axios.get(`/api/products/${id}`);

      if (response.data.success) {
        setProduct(response.data.product);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    setPurchasing(true);
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post(
        '/api/orders',
        {
          productId: product?._id,
          quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success('Order placed successfully!');
        setTimeout(() => {
          router.push('/orders');
        }, 1500);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-700">Product not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold text-purple-600 cursor-pointer">NetWeave Pro</h1>
            </Link>
            <Link
              href="/products"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Back to Products
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg h-96 flex items-center justify-center">
            <span className="text-white text-9xl">📦</span>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  product.type === 'digital'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {product.type}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-gray-600 mb-6">{product.description}</p>

            <div className="mb-6 space-y-2">
              <p className="text-gray-700">
                <span className="font-semibold">Category:</span> {product.category}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Commission Rate:</span>{' '}
                <span className="text-green-600 font-bold">{product.commissionRate}%</span>
              </p>
              {product.stock !== undefined && (
                <p className="text-gray-700">
                  <span className="font-semibold">Stock:</span> {product.stock} available
                </p>
              )}
            </div>

            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Multi-Level Commissions:</h3>
              {product.levelCommissions && product.levelCommissions.length > 0 ? (
                <ul className="space-y-1">
                  {product.levelCommissions.map((lc) => (
                    <li key={lc.level} className="text-sm text-gray-700">
                      Level {lc.level}: {lc.rate}%
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">Standard commission applies</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                max={product.stock || 100}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between mb-6">
              <p className="text-4xl font-bold text-purple-600">
                ${(product.price * quantity).toFixed(2)}
              </p>
            </div>

            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {purchasing ? 'Processing...' : 'Purchase Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
