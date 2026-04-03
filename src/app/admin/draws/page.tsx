'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Draw {
  id: string;
  month: string;
  year: number;
  status: 'scheduled' | 'completed' | 'published';
  prize_pool: number;
  winning_numbers: number[] | null;
  created_at: string;
}

export default function AdminDrawsPage() {
  const router = useRouter();
  const [draws, setDraws] = useState<Draw[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    month: new Date().toLocaleString('en-US', { month: 'long' }),
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchDraws();
  }, []);

  const fetchDraws = async () => {
    try {
      const res = await fetch('/api/draws', {
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch draws');
      }

      const data = await res.json();
      setDraws(data.draws || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading draws');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create draw');
      }

      setSuccess('Draw created successfully');
      setShowCreateForm(false);
      await fetchDraws();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating draw');
    } finally {
      setCreating(false);
    }
  };

  const handlePublishDraw = async (drawId: string) => {
    if (!confirm('Publish this draw? This will generate winning numbers and results.')) return;

    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/draws/publish', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ draw_id: drawId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to publish draw');
      }

      setSuccess('Draw published successfully');
      await fetchDraws();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error publishing draw');
    }
  };

  const handleSimulateDraw = async (drawId: string) => {
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/draws/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ draw_id: drawId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to simulate draw');
      }

      const data = await res.json();
      setSuccess(
        `Simulation: Numbers would be [${data.numbers.join(', ')}] with ${data.winners.length} winners`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error simulating draw');
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
            <h1 className="text-3xl font-bold text-gray-900">Manage Draws</h1>
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

        {/* Create Draw Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            {showCreateForm ? '✕ Cancel' : '+ Create New Draw'}
          </button>
        </div>

        {/* Create Draw Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateDraw} className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Draw</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
                  Month
                </label>
                <select
                  id="month"
                  value={formData.month}
                  onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {[
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  id="year"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                  min="2026"
                  max="2030"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-2 rounded-lg transition"
            >
              {creating ? 'Creating...' : 'Create Draw'}
            </button>
          </form>
        )}

        {/* Draws List */}
        <div className="space-y-6">
          {draws.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-gray-600 mb-4">No draws created yet</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="text-emerald-600 hover:text-emerald-700 font-semibold"
              >
                Create the first draw →
              </button>
            </div>
          ) : (
            draws.map(draw => (
              <div key={draw.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {draw.month} {draw.year}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      draw.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                      draw.status === 'completed' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {draw.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="px-6 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">Prize Pool</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${(draw.prize_pool / 100).toFixed(2)}
                      </p>
                    </div>

                    {draw.winning_numbers && (
                      <div>
                        <p className="text-sm text-gray-600">Winning Numbers</p>
                        <div className="flex gap-2 mt-2">
                          {draw.winning_numbers.map((num, idx) => (
                            <div
                              key={idx}
                              className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold"
                            >
                              {num}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="text-gray-900">
                        {new Date(draw.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    {draw.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => handleSimulateDraw(draw.id)}
                          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                        >
                          👁️ Simulate
                        </button>
                        <button
                          onClick={() => handlePublishDraw(draw.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                        >
                          📢 Publish
                        </button>
                      </>
                    )}
                    {draw.status === 'published' && (
                      <button
                        disabled
                        className="bg-gray-300 text-gray-600 font-semibold py-2 px-4 rounded-lg cursor-not-allowed"
                      >
                        ✓ Published
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
