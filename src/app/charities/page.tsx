'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Charity {
  id: string;
  name: string;
  description: string;
  website: string;
  impact_area: string;
}

export default function CharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      const response = await fetch('/api/charities');
      if (!response.ok) {
        throw new Error('Failed to fetch charities');
      }

      const data = await response.json();
      setCharities(data.charities || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(charities.map(c => c.impact_area)));

  const filteredCharities = charities.filter(charity => {
    const matchesSearch =
      charity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charity.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || charity.impact_area === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-emerald-600 hover:text-emerald-700 mb-4 inline-block">
            ← Back Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Our Partner Charities</h1>
          <p className="text-gray-600 mt-2">Every subscription supports meaningful causes</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Charities
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Impact Area
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Charities Grid */}
        {filteredCharities.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-lg text-gray-600">
              No charities found. Try adjusting your search.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredCharities.length} of {charities.length} charities
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCharities.map(charity => (
                <div
                  key={charity.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
                >
                  <div className="h-32 bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                    <div className="text-4xl">🤝</div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{charity.name}</h3>

                    <div className="mb-3">
                      <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
                        {charity.impact_area}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {charity.description}
                    </p>

                    {charity.website && (
                      <a
                        href={charity.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-emerald-600 hover:text-emerald-700 text-sm font-semibold"
                      >
                        Visit Website →
                      </a>
                    )}
                  </div>

                  <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                    <Link
                      href="/subscribe"
                      className="text-center block text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
                    >
                      Support This Charity
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="font-semibold text-gray-900 mb-2">Verified Partners</h3>
            <p className="text-sm text-gray-600">
              All charities are verified nonprofit organizations with proven impact.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-semibold text-gray-900 mb-2">Transparent Donations</h3>
            <p className="text-sm text-gray-600">
              10-15% of your subscription goes directly to your chosen charity.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 mb-2">Track Impact</h3>
            <p className="text-sm text-gray-600">
              See exactly how much your participation has contributed to your charity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
