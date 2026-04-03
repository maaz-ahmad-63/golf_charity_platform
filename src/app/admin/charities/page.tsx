'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Charity {
  id: string;
  name: string;
  description: string;
  website: string;
  impact_area: string;
}

export default function AdminCharitiesPage() {
  const router = useRouter();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    impact_area: '',
  });

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      const res = await fetch('/api/charities', {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch charities');
      }

      const data = await res.json();
      setCharities(data.charities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading charities');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateCharity = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/charities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create charity');
      }

      setSuccess('Charity created successfully');
      setFormData({ name: '', description: '', website: '', impact_area: '' });
      setShowForm(false);
      await fetchCharities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating charity');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-12 w-48 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Manage Charities</h1>
            <Link href="/admin" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              ← Back to Admin
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700">
            {success}
          </div>
        )}

        {/* Add Charity Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            {showForm ? '✕ Cancel' : '+ Add Charity'}
          </button>
        </div>

        {/* Create Charity Form */}
        {showForm && (
          <form onSubmit={handleCreateCharity} className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Charity</h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Charity Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="e.g., World Wildlife Fund"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Describe the charity's mission and work..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="impact_area" className="block text-sm font-medium text-gray-700 mb-2">
                    Impact Area
                  </label>
                  <select
                    id="impact_area"
                    name="impact_area"
                    value={formData.impact_area}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="">Select an area</option>
                    <option value="Environment">Environment</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Poverty">Poverty Relief</option>
                    <option value="Animals">Animal Welfare</option>
                    <option value="Community">Community Development</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-2 rounded-lg transition"
              >
                {creating ? 'Adding...' : 'Add Charity'}
              </button>
            </div>
          </form>
        )}

        {/* Charities List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {charities.length === 0 ? (
            <div className="md:col-span-2 bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 mb-4">No charities added yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Add the first charity →
              </button>
            </div>
          ) : (
            charities.map(charity => (
              <div key={charity.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{charity.name}</h3>

                <div className="mb-4">
                  <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {charity.impact_area}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{charity.description}</p>

                {charity.website && (
                  <a
                    href={charity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold"
                  >
                    Visit Website →
                  </a>
                )}

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">ID: {charity.id}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
