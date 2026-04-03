'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DashboardData {
  user?: {
    id: string;
    email: string;
    full_name: string;
    subscription_status: 'active' | 'inactive' | 'cancelled';
    charity_percentage: number;
  };
  scores?: Array<{
    id: string;
    score: number;
    date: string;
  }>;
  charity?: {
    id: string;
    name: string;
    description: string;
  };
  winnings?: Array<{
    id: string;
    draw_id: string;
    match_count: number;
    prize_amount: number;
    verification_status: string;
  }>;
  totalWon?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const res = await fetch('/api/dashboard', {
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch dashboard');
      }

      const data = await res.json();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-12 w-48 bg-gray-300 rounded"></div>
        </div>
      </div>
    );

  if (!dashboard)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Unable to load dashboard</div>
      </div>
    );

  const user = dashboard.user;
  const scores = dashboard.scores || [];
  const winnings = dashboard.winnings || [];
  const totalWon = dashboard.totalWon || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.full_name || 'User'}</h1>
            <Link
              href="/profile"
              className="text-emerald-600 hover:text-emerald-700 font-bold"
            >
              Profile →
            </Link>
          </div>
          <p className="text-gray-600">{user?.email}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <p className="text-sm font-bold text-gray-600 mb-2">Subscription Status</p>
            <p className="text-2xl font-bold text-gray-900 capitalize">
              {user?.subscription_status || 'Inactive'}
            </p>
            <div className={`mt-2 w-2 h-2 rounded-full ${
              user?.subscription_status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
            }`}></div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <p className="text-sm font-bold text-gray-600 mb-2">Charity Contribution</p>
            <p className="text-2xl font-bold text-emerald-600">{user?.charity_percentage || 0}%</p>
            <p className="text-xs text-gray-500 mt-2">Per subscription</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <p className="text-sm font-bold text-gray-600 mb-2">Your Scores</p>
            <p className="text-2xl font-bold text-gray-900">{scores.length}/5</p>
            <p className="text-xs text-gray-500 mt-2">Active scores</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <p className="text-sm font-bold text-gray-600 mb-2">Total Won</p>
            <p className="text-2xl font-bold text-emerald-600">${totalWon.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">All time</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scores Section */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Your Scores</h2>
                <Link
                  href="/dashboard/scores"
                  className="text-emerald-600 hover:text-emerald-700 font-bold text-sm"
                >
                  View All →
                </Link>
              </div>

              {scores.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No scores yet. Add your first golf score!</p>
                  <Link
                    href="/dashboard/scores"
                    className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition"
                  >
                    Add Score
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {scores.slice(0, 3).map((score, idx) => (
                      <div key={score.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                          <p className="font-bold text-gray-900">Score {idx + 1}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(score.date).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-2xl font-bold text-emerald-600">{score.score}</p>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/dashboard/scores"
                    className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition"
                  >
                    Add Another Score
                  </Link>
                </>
              )}
            </div>

            {/* Charity Section */}
            {dashboard.charity && (
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Supported Charity</h2>
                <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl text-emerald-600">♡</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{dashboard.charity.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{dashboard.charity.description}</p>
                    </div>
                  </div>
                </div>
                <Link
                  href="/subscribe"
                  className="mt-4 block text-center text-emerald-600 hover:text-emerald-700 font-bold text-sm"
                >
                  Change Charity →
                </Link>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h2>
              <div className="space-y-2">
                <Link
                  href="/draws"
                  className="block p-3 bg-gray-50 hover:bg-emerald-50 rounded-lg text-emerald-600 hover:text-emerald-700 font-bold transition border border-gray-200"
                >
                  View Draws
                </Link>
                <Link
                  href="/charities"
                  className="block p-3 bg-gray-50 hover:bg-emerald-50 rounded-lg text-emerald-600 hover:text-emerald-700 font-bold transition border border-gray-200"
                >
                  All Charities
                </Link>
                {user?.subscription_status !== 'active' && (
                  <Link
                    href="/subscribe"
                    className="block p-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-bold transition"
                  >
                    Subscribe Now
                  </Link>
                )}
              </div>
            </div>

            {/* Recent Winnings */}
            {winnings.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Wins</h2>
                <div className="space-y-3">
                  {winnings.slice(0, 3).map(win => (
                    <div key={win.id} className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-900">
                          {win.match_count} Match{win.match_count !== 1 ? 'es' : ''}
                        </span>
                        <span className="text-lg font-bold text-emerald-600">
                          ${win.prize_amount.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-2 capitalize">
                        {win.verification_status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Help Card */}
            <div className="bg-emerald-50 rounded-lg shadow-md p-6 border border-emerald-200">
              <h3 className="font-bold text-gray-900 mb-2">How It Works</h3>
              <ol className="text-xs text-gray-700 space-y-2 list-decimal list-inside">
                <li>Add your golf scores</li>
                <li>Automatic draw entry</li>
                <li>Win prizes</li>
                <li>Support charities</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
