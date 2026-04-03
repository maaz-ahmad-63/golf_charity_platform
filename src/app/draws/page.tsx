'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Draw {
  id: string;
  month: string;
  year: number;
  status: 'scheduled' | 'completed' | 'published';
  winning_numbers: number[] | null;
  prize_pool: number;
  created_at: string;
}

interface UserWinnings {
  draw_id: string;
  match_count: number;
  prize_amount: number;
}

export default function DrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [userWinnings, setUserWinnings] = useState<UserWinnings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetchDraws();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      setIsAuthenticated(!!token);

      if (token) {
        fetchUserWinnings();
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const fetchDraws = async () => {
    try {
      const response = await fetch('/api/draws', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch draws');
      }

      const data = await response.json();
      setDraws(data.draws || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserWinnings = async () => {
    try {
      const response = await fetch('/api/dashboard', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUserWinnings(data.winnings || []);
      }
    } catch {
      // Silently fail - user might not be authenticated
    }
  };

  const getWinningPrize = (draw_id: string): string => {
    const winning = userWinnings.find(w => w.draw_id === draw_id);
    if (!winning) return '-';

    const labels: { [key: number]: string } = {
      5: 'Grand Prize (5 Matches)',
      4: 'Second Prize (4 Matches)',
      3: 'Third Prize (3 Matches)',
    };

    return labels[winning.match_count] || '-';
  };

  const getPrizeAmount = (draw_id: string): string => {
    const winning = userWinnings.find(w => w.draw_id === draw_id);
    return winning ? `$${winning.prize_amount.toFixed(2)}` : '-';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-emerald-600 hover:text-emerald-700 mb-4 inline-block">
            ← Back Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Monthly Draws</h1>
          <p className="text-gray-600 mt-2">View past draws and winning numbers</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Info Banner */}
        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm text-emerald-900">
            💡 <strong>New draws are published on the last day of each month.</strong> Your 5 best
            golf scores are automatically entered into each draw.
          </p>
        </div>

        {/* Draws List */}
        <div className="space-y-6">
          {draws.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-lg text-gray-600">No draws yet. Check back next month!</p>
            </div>
          ) : (
            draws.map(draw => {
              const isCompleted = draw.status === 'completed' || draw.status === 'published';

              return (
                <div
                  key={draw.id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
                >
                  {/* Draw Header */}
                  <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">
                          {draw.month} {draw.year}
                        </h2>
                        <p className="text-emerald-100 text-sm mt-1">
                          Prize Pool: ${(draw.prize_pool / 100).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm px-3 py-1 rounded-full bg-white bg-opacity-20 inline-block">
                          {draw.status === 'scheduled' && 'Upcoming'}
                          {draw.status === 'completed' && '✓ Completed'}
                          {draw.status === 'published' && '📢 Published'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Draw Content */}
                  <div className="px-6 py-6">
                    {isCompleted && draw.winning_numbers ? (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Winning Numbers</h3>
                        <div className="flex gap-3 mb-6">
                          {draw.winning_numbers.map((num, idx) => (
                            <div
                              key={idx}
                              className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg"
                            >
                              {num}
                            </div>
                          ))}
                        </div>

                        {isAuthenticated && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Your Result</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Prize Tier</p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {getWinningPrize(draw.id)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Amount Won</p>
                                <p className="text-lg font-semibold text-emerald-600">
                                  {getPrizeAmount(draw.id)}
                                </p>
                              </div>
                            </div>

                            {userWinnings.find(w => w.draw_id === draw.id) && (
                              <Link
                                href="/dashboard/winnings"
                                className="mt-4 inline-block text-emerald-600 hover:text-emerald-700 text-sm font-semibold"
                              >
                                View Details & Verify →
                              </Link>
                            )}
                          </div>
                        )}

                        {!isAuthenticated && (
                          <div className="bg-emerald-50 rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-600 mb-3">
                              Sign in to see if you won this draw
                            </p>
                            <Link
                              href="/login"
                              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg"
                            >
                              Sign In
                            </Link>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-600">
                        <p className="text-lg mb-2">🎲 Draw not yet published</p>
                        <p className="text-sm">Results will be available after the draw completes</p>
                      </div>
                    )}
                  </div>

                  {/* Draw Footer */}
                  <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
                    Created: {new Date(draw.created_at).toLocaleDateString()}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* How It Works */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">How Draws Work</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl mb-3">1️⃣</div>
              <h3 className="font-semibold text-gray-900 mb-2">Your Scores Enter</h3>
              <p className="text-sm text-gray-600">
                Your 5 best golf scores from each month are automatically entered into that
                month's draw.
              </p>
            </div>

            <div>
              <div className="text-2xl mb-3">2️⃣</div>
              <h3 className="font-semibold text-gray-900 mb-2">Numbers Are Drawn</h3>
              <p className="text-sm text-gray-600">
                At the end of the month, 5 winning numbers are selected. We use both random and
                algorithmic methods.
              </p>
            </div>

            <div>
              <div className="text-2xl mb-3">3️⃣</div>
              <h3 className="font-semibold text-gray-900 mb-2">Winners Are Paid</h3>
              <p className="text-sm text-gray-600">
                If you match 3+ numbers, you win! Verify your result and get paid within 5-7
                business days.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <h4 className="font-semibold text-emerald-900 mb-2">Prize Distribution</h4>
            <ul className="text-sm text-emerald-800 space-y-2">
              <li><strong>5 Numbers Match:</strong> 40% of prize pool</li>
              <li><strong>4 Numbers Match:</strong> 35% of prize pool</li>
              <li><strong>3 Numbers Match:</strong> 25% of prize pool</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
