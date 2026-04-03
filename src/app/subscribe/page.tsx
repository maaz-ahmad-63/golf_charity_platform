'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Charity {
  id: string;
  name: string;
  description: string;
  website: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billing_period: 'monthly' | 'yearly';
  charity_percentage: number;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 29.99,
    billing_period: 'monthly',
    charity_percentage: 10,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 299.99,
    billing_period: 'yearly',
    charity_percentage: 15,
  },
];

export default function SubscribePage() {
  const router = useRouter();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [selectedCharity, setSelectedCharity] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      const response = await fetch('/api/charities', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch charities');
      }

      const data = await response.json();
      setCharities(data.charities || []);
      if (data.charities && data.charities.length > 0) {
        setSelectedCharity(data.charities[0].id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!selectedCharity) {
      setError('Please select a charity');
      setSubmitting(false);
      return;
    }

    try {
      // Get user info from localStorage (set during login)
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setError('You must be logged in to subscribe');
        setSubmitting(false);
        return;
      }

      const user = JSON.parse(storedUser);
      const userId = user.id || user.userId;
      const userEmail = user.email;

      if (!userId || !userEmail) {
        setError('User information incomplete. Please login again.');
        setSubmitting(false);
        return;
      }

      // Set cookies for authentication (document.cookie in browser)
      document.cookie = `userId=${userId}; path=/`;
      document.cookie = `userEmail=${userEmail}; path=/`;

      // Get the selected plan data to find charity percentage
      const selectedPlanData = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);
      const charityPercentage = selectedPlanData?.charity_percentage || 10;

      // Map selectedPlan to plan format expected by checkout
      const planMap: { [key: string]: string } = {
        'monthly': 'monthly',
        'yearly': 'yearly',
      };

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          plan: planMap[selectedPlan] || 'monthly',
          charityId: selectedCharity,
          charityPercentage: charityPercentage,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to initiate checkout');
      }

      const data = await response.json();
      
      // Store subscription info in localStorage
      if (data.data) {
        localStorage.setItem('subscription', JSON.stringify(data.data));
      }
      
      // Redirect to payment success page
      router.push('/payment-success');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCharities = charities.filter(
    charity =>
      charity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      charity.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPlanData = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-emerald-600 hover:text-emerald-700 mb-4 inline-block font-medium">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Subscribe Now</h1>
          <p className="text-gray-600 mt-2">Choose your plan and support a charity</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubscribe} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subscription Plans */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Choose Your Plan</h2>

              <div className="grid grid-cols-2 gap-4">
                {SUBSCRIPTION_PLANS.map(plan => (
                  <label
                    key={plan.id}
                    className={`cursor-pointer p-4 rounded-lg border-2 transition ${
                      selectedPlan === plan.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={selectedPlan === plan.id}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="hidden"
                    />
                    <div className="font-bold text-gray-900">{plan.name}</div>
                    <div className="text-2xl font-bold text-emerald-700 mt-2">
                      ${(plan.price / 100).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {plan.billing_period === 'monthly' ? 'per month' : 'per year'}
                    </div>
                    <div className="text-xs bg-emerald-100 text-emerald-800 mt-2 px-2 py-1 rounded inline-block">
                      {plan.charity_percentage}% to charity
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Charity Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Select a Charity</h2>

              <input
                type="text"
                placeholder="Search charities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredCharities.length === 0 ? (
                  <div className="text-center py-8 text-gray-600">
                    No charities found matching your search.
                  </div>
                ) : (
                  filteredCharities.map(charity => (
                    <label
                      key={charity.id}
                      className={`cursor-pointer p-4 rounded-lg border-2 transition block ${
                        selectedCharity === charity.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="charity"
                        value={charity.id}
                        checked={selectedCharity === charity.id}
                        onChange={(e) => setSelectedCharity(e.target.value)}
                        className="hidden"
                      />
                      <div className="font-bold text-gray-900">{charity.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{charity.description}</div>
                      {charity.website && (
                        <a
                          href={charity.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 text-xs mt-2 inline-block"
                        >
                          Learn More →
                        </a>
                      )}
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit sticky top-4">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>

            <div className="space-y-4 pb-6 border-b border-gray-200">
              <div className="flex justify-between text-gray-600">
                <span>{selectedPlanData?.name} Plan</span>
                <span className="font-bold text-gray-900">
                  ${(selectedPlanData?.price || 0).toFixed(2)}
                </span>
              </div>

              {selectedCharity && (
                <div className="flex justify-between text-gray-600">
                  <span>Charity</span>
                  <span className="font-bold text-gray-900">
                    {charities.find(c => c.id === selectedCharity)?.name || 'Unknown'}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <span className="text-emerald-900 font-medium">Donation to charity:</span>
                <span className="font-bold text-emerald-900">
                  ${(((selectedPlanData?.price || 0) * (selectedPlanData?.charity_percentage || 0)) / 100).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedCharity}
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
            >
              {submitting ? 'Processing...' : 'Continue to Payment'}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              You can change your charity anytime from your dashboard
            </p>
          </div>
        </form>

        {/* FAQ */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Can I change my charity later?</h3>
              <p className="text-gray-600">
                Yes! You can update your charity selection from your dashboard at any time.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">How often are draws held?</h3>
              <p className="text-gray-600">
                Monthly draws happen at the end of each month. Your 5 best scores from the month are
                automatically entered.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">What if I win?</h3>
              <p className="text-gray-600">
                You'll be notified via email and need to verify your win with proof. Once verified,
                you'll receive the prize payment within 5-7 business days.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Can I get a refund?</h3>
              <p className="text-slate-600">
                You can cancel your subscription anytime. Monthly refunds are available within 30
                days of purchase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
