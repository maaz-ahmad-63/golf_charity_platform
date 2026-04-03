'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  subscription_plan: 'monthly' | 'yearly' | null;
  subscription_status: 'active' | 'inactive' | 'cancelled';
  selected_charity_id: string | null;
  charity_name: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/dashboard', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
      });
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/dashboard', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      setSuccess('Profile updated successfully');
      setEditing(false);
      await fetchProfile();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">Unable to load profile. Please try again.</p>
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
          <h1 className="text-4xl font-bold text-gray-900">Profile & Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and preferences</p>
        </div>

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

        {/* Profile Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-emerald-600 hover:text-emerald-700 font-bold text-sm"
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label htmlFor="full_name" className="block text-sm font-bold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-2 rounded-lg transition"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({ full_name: profile.full_name || '' });
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-600">Email</label>
                <p className="text-gray-900">{profile.email}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600">Full Name</label>
                <p className="text-gray-900">{profile.full_name || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600">Account Created</label>
                <p className="text-gray-900">--</p>
              </div>
            </div>
          )}
        </div>

        {/* Subscription Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Subscription</h2>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-600">Plan</label>
                <p className="text-gray-900 capitalize">
                  {profile.subscription_plan || 'No active subscription'}
                </p>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-600">Status</label>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      profile.subscription_status === 'active'
                        ? 'bg-emerald-500'
                        : profile.subscription_status === 'inactive'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                    }`}
                  ></div>
                  <p className="text-gray-900 capitalize">{profile.subscription_status}</p>
                </div>
              </div>
            </div>

            {profile.charity_name && (
              <div>
                <label className="text-sm font-bold text-gray-600">Supporting</label>
                <p className="text-gray-900">{profile.charity_name}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {profile.subscription_status === 'active' ? (
              <>
                <Link
                  href="/subscribe"
                  className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition"
                >
                  Change Charity
                </Link>
                <button
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 rounded-lg transition"
                  disabled
                >
                  Cancel Subscription
                </button>
              </>
            ) : (
              <Link
                href="/subscribe"
                className="w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition"
              >
                Subscribe Now
              </Link>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Preferences</h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-gray-900">Email notifications for draw results</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-gray-900">Email notifications for new scores</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-gray-900">Monthly charity impact summary</span>
            </label>
          </div>

          <button className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 rounded-lg transition">
            Save Preferences
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-900 mb-4">Danger Zone</h2>

          <p className="text-sm text-red-800 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>

          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg transition"
          >
            Logout
          </button>

          <button
            disabled
            className="w-full mt-3 bg-gray-300 text-gray-600 font-bold py-2 rounded-lg cursor-not-allowed"
          >
            Delete Account (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}
