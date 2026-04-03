'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Score {
  id: string;
  score: number;
  date: string;
  created_at: string;
}

export default function ScoresPage() {
  const router = useRouter();
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    score: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const response = await fetch('/api/scores', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch scores');
      }

      const data = await response.json();
      setScores(data.scores || []);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Validate score
      const scoreNum = parseInt(formData.score);
      if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
        setError('Score must be between 1 and 45 (Stableford format)');
        setSubmitting(false);
        return;
      }

      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          score: scoreNum,
          date: formData.date,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add score');
      }

      // Reset form and refresh
      setFormData({
        score: '',
        date: new Date().toISOString().split('T')[0],
      });
      await fetchScores();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteScore = async (scoreId: string) => {
    if (!confirm('Delete this score?')) return;

    try {
      const response = await fetch(`/api/scores?id=${scoreId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete score');
      }

      await fetchScores();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-emerald-600 hover:text-emerald-700 mb-4 inline-block font-bold">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Golf Scores</h1>
          <p className="text-gray-600 mt-2">Track your best Stableford scores</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Score Entry Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Score</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="score" className="block text-sm font-bold text-gray-700 mb-2">
                Score (1-45)
              </label>
              <input
                type="number"
                id="score"
                name="score"
                value={formData.score}
                onChange={handleInputChange}
                placeholder="Enter score"
                min="1"
                max="45"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Stableford scoring system</p>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-bold text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-2 rounded-lg transition"
          >
            {submitting ? 'Adding...' : 'Add Score'}
          </button>
        </form>

        {/* Scores List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Your Scores ({scores.length})</h2>
          </div>

          {scores.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-600">
              <p className="text-lg">No scores yet. Add your first score above!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {scores.map((score, idx) => (
                <div key={score.id} className="px-6 py-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-emerald-600">{score.score}</div>
                        <div className="text-xs text-gray-500 mt-1">Score #{idx + 1}</div>
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">
                          {new Date(score.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-sm text-gray-500">
                          Added {new Date(score.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteScore(score.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-bold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <h3 className="font-bold text-gray-900 mb-2">Stableford Scoring</h3>
          <p className="text-sm text-gray-700">
            Only your 5 best scores are used in monthly draws. The system automatically removes
            older scores when you add a new one if you have more than 5.
          </p>
        </div>
      </div>
    </div>
  );
}
