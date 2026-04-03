'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PendingWinner {
  id: string;
  user_id: string;
  draw_id: string;
  match_count: number;
  prize_amount: number;
  proof_url: string | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

export default function AdminWinnersPage() {
  const router = useRouter();
  const [winners, setWinners] = useState<PendingWinner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState<'pending' | 'verified' | 'rejected' | 'all'>('pending');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      const res = await fetch('/api/winners', {
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch winners');
      }

      const data = await res.json();
      setWinners(data.winners || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading winners');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyWinner = async (winnerId: string) => {
    setProcessing(winnerId);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/winners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          winner_id: winnerId,
          approved: true,
          paid: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to verify winner');
      }

      setSuccess('Winner verified and marked as paid');
      await fetchWinners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error verifying winner');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectWinner = async (winnerId: string) => {
    if (!confirm('Reject this winner claim?')) return;

    setProcessing(winnerId);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/winners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          winner_id: winnerId,
          approved: false,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to reject winner');
      }

      setSuccess('Winner claim rejected');
      await fetchWinners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error rejecting winner');
    } finally {
      setProcessing(null);
    }
  };

  const filteredWinners =
    filter === 'all'
      ? winners
      : winners.filter(w => w.verification_status === filter);

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
            <h1 className="text-3xl font-bold text-gray-900">Winner Verification</h1>
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

        {/* Filters */}
        <div className="mb-8 flex gap-2 flex-wrap">
          {(['pending', 'verified', 'rejected', 'all'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === status
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200 hover:border-emerald-400'
              }`}
            >
              {status === 'pending' && `Pending (${winners.filter(w => w.verification_status === 'pending').length})`}
              {status === 'verified' && `Verified (${winners.filter(w => w.verification_status === 'verified').length})`}
              {status === 'rejected' && `Rejected (${winners.filter(w => w.verification_status === 'rejected').length})`}
              {status === 'all' && `All (${winners.length})`}
            </button>
          ))}
        </div>

        {/* Winners List */}
        {filteredWinners.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">No winners in this category</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredWinners.map(winner => (
              <div key={winner.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {winner.match_count} Numbers Match - ${(winner.prize_amount / 100).toFixed(2)}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      winner.verification_status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                      winner.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {winner.verification_status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="px-6 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <p className="text-sm text-gray-600">User ID</p>
                      <p className="text-gray-900 font-mono">{winner.user_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Draw ID</p>
                      <p className="text-gray-900 font-mono">{winner.draw_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Submitted</p>
                      <p className="text-gray-900">
                        {new Date(winner.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Proof Section */}
                  {winner.proof_url && (
                    <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Proof Document</p>
                      <a
                        href={winner.proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 font-semibold break-all"
                      >
                        View Proof →
                      </a>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {winner.verification_status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleVerifyWinner(winner.id)}
                        disabled={processing === winner.id}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-green-400 text-white font-semibold py-2 rounded-lg transition"
                      >
                        {processing === winner.id ? 'Processing...' : '✓ Verify & Pay'}
                      </button>
                      <button
                        onClick={() => handleRejectWinner(winner.id)}
                        disabled={processing === winner.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2 rounded-lg transition"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}

                  {winner.verification_status === 'verified' && (
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <p className="text-emerald-900 font-semibold">✓ Verified and paid</p>
                    </div>
                  )}

                  {winner.verification_status === 'rejected' && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-red-900 font-semibold">✕ Claim rejected</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
