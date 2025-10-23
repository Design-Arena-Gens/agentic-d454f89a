'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  images: string[];
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchProducts();
  }, [router, filter]);

  const fetchProducts = async () => {
    try {
      const url = filter === 'all' ? '/api/products' : `/api/products?type=${filter}`;
      const response = await axios.get(url);

      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (productId: string) => {
    router.push(`/products/${productId}`);
  };

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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Product Catalog</h2>

          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-semibold ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => setFilter('digital')}
              className={`px-6 py-2 rounded-lg font-semibold ${
                filter === 'digital'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Digital
            </button>
            <button
              onClick={() => setFilter('physical')}
              className={`px-6 py-2 rounded-lg font-semibold ${
                filter === 'physical'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Physical
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-700">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-700">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
                  <span className="text-white text-6xl">📦</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
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
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm">Category: {product.category}</p>
                    <p className="text-green-600 text-sm font-semibold">
                      Commission: {product.commissionRate}%
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-purple-600">${product.price}</p>
                    <button
                      onClick={() => handlePurchase(product._id)}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                    >
                      View Details
                    </button>
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
