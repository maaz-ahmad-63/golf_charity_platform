'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Subscription {
  subscriptionId: string;
  plan: string;
  amount: number;
  charityPercentage: number;
  status: string;
}

export default function PaymentSuccessPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [nextBillingDate, setNextBillingDate] = useState<string>('');

  useEffect(() => {
    // Get subscription from localStorage
    const stored = localStorage.getItem('subscription');
    if (stored) {
      setSubscription(JSON.parse(stored));
      
      // Calculate next billing date
      const days = JSON.parse(stored).plan === 'monthly' ? 30 : 365;
      const date = new Date();
      date.setDate(date.getDate() + days);
      setNextBillingDate(date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              GolfCharity
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
            Subscription Confirmed
          </h1>
          <p className="text-lg text-gray-600 mb-10 text-center">
            Your subscription is now active. Thank you for your support.
          </p>

          {/* Subscription Details */}
          {subscription && (
            <div className="bg-gray-50 rounded-lg p-6 text-left mb-8 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Subscription Details</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Subscription ID</p>
                  <p className="text-gray-900 font-mono text-sm break-all">{subscription.subscriptionId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Plan</p>
                  <p className="text-gray-900 font-semibold capitalize">{subscription.plan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly Amount</p>
                  <p className="text-gray-900 font-semibold">${subscription.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Charity Percentage</p>
                  <p className="text-gray-900 font-semibold">{subscription.charityPercentage}%</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Next Billing Date</p>
                  <p className="text-gray-900 font-semibold">{nextBillingDate}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mb-8">
            <Link
              href="/dashboard"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-3 px-8 rounded-lg transition"
            >
              Back to Home
            </Link>
          </div>

          {/* Additional Info */}
          <div className="pt-8 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">What's Next?</h3>
            <ul className="space-y-3 text-gray-600 max-w-sm mx-auto">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Access your dashboard to track golf scores</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Your charitable donation is processed automatically</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Join monthly draws and compete with other golfers</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
