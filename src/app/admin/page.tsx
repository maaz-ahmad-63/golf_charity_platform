'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AdminStats {
  total_users: number;
  active_subscriptions: number;
  total_pool: number;
  charity_raised: number;
  pending_verifications: number;
  recent_winners: Array<{
    id: string;
    user_id: string;
    match_count: number;
    prize_amount: number;
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const res = await fetch('/api/admin/dashboard', {
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch admin stats');
      }

      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading dashboard');
    } finally {
      setLoading(false);
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

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Unable to load admin dashboard</p>
          <Link href="/" className="text-emerald-600 hover:text-emerald-700">
            Back to Home
          </Link>
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
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <Link href="/dashboard" className="text-emerald-600 hover:text-emerald-700 font-semibold">
              ← Back to User Dashboard
            </Link>
          </div>
          <p className="text-gray-600 mt-2">Platform overview and management</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_users}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.active_subscriptions}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-gray-600">Prize Pool</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">
              ${(stats.total_pool / 100).toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-gray-600">Raised for Charity</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">
              ${(stats.charity_raised / 100).toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-gray-600">Pending Verifications</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pending_verifications}</p>
          </div>
        </div>

        {/* Admin Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Management Tools</h2>
            <div className="space-y-3">
              <Link
                href="/admin/draws"
                className="block p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition"
              >
                🎲 Manage Draws
              </Link>
              <Link
                href="/admin/users"
                className="block p-4 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white rounded-lg font-semibold transition"
              >
                Manage Users
              </Link>
              <Link
                href="/admin/charities"
                className="block p-4 bg-gradient-to-r from-purple-500 to-emerald-600 hover:from-purple-600 hover:to-emerald-700 text-white rounded-lg font-semibold transition"
              >
                🤝 Manage Charities
              </Link>
              <Link
                href="/admin/winners"
                className="block p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-semibold transition"
              >
                Winner Verification
              </Link>
            </div>
          </div>

          {/* Recent Winners */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Winners</h2>
            {stats.recent_winners.length === 0 ? (
              <p className="text-gray-600">No recent winners</p>
            ) : (
              <div className="space-y-3">
                {stats.recent_winners.slice(0, 5).map(winner => (
                  <div key={winner.id} className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">
                        {winner.match_count} Matches
                      </span>
                      <span className="text-lg font-bold text-emerald-600">
                        ${(winner.prize_amount / 100).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">User: {winner.user_id}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Average Subscription Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${stats.active_subscriptions > 0 
                  ? ((stats.total_pool / 100) / stats.active_subscriptions).toFixed(2) 
                  : '0.00'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.total_users > 0
                  ? ((stats.active_subscriptions / stats.total_users) * 100).toFixed(1)
                  : '0'}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Charity Contribution Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.total_pool > 0
                  ? ((stats.charity_raised / stats.total_pool) * 100).toFixed(1)
                  : '0'}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
