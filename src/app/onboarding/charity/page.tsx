'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Charity {
  id: string;
  name: string;
  description: string;
  category: string;
  website?: string;
}

export default function CharityOnboardingPage() {
  const router = useRouter();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock charities data for testing
  const mockCharities: Charity[] = [
    {
      id: '1',
      name: 'World Wildlife Fund',
      description: 'Protecting endangered species and habitats',
      category: 'Environment',
      website: 'www.wwf.org',
    },
    {
      id: '2',
      name: 'Doctors Without Borders',
      description: 'Providing medical aid in crisis zones',
      category: 'Healthcare',
      website: 'www.msf.org',
    },
    {
      id: '3',
      name: 'Save the Children',
      description: 'Supporting children in developing countries',
      category: 'Children',
      website: 'www.savethechildren.org',
    },
    {
      id: '4',
      name: 'The Nature Conservancy',
      description: 'Conserving land and waters',
      category: 'Environment',
      website: 'www.nature.org',
    },
    {
      id: '5',
      name: 'Oxfam International',
      description: 'Fighting poverty and inequality',
      category: 'Poverty',
      website: 'www.oxfam.org',
    },
    {
      id: '6',
      name: 'Cancer Research UK',
      description: 'Funding cancer research and support',
      category: 'Healthcare',
      website: 'www.cancerresearchuk.org',
    },
  ];

  useEffect(() => {
    // Simulate loading charities
    setLoading(true);
    setTimeout(() => {
      setCharities(mockCharities);
      setLoading(false);
    }, 500);
  }, []);

  const filteredCharities = charities.filter(
    (charity) =>
      charity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      charity.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContinue = () => {
    if (!selectedCharity) {
      setError('Please select a charity to continue');
      return;
    }

    // Save selected charity to localStorage
    localStorage.setItem('selectedCharityId', selectedCharity);

    // Redirect to subscription page
    router.push('/subscribe');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Choose Your Charity</h1>
          <p className="text-xl text-gray-600">
            Select a charity you'd like to support. A portion of your subscription will go to your chosen organization.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search charities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-3 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            <p className="text-gray-600 mt-4">Loading charities...</p>
          </div>
        )}

        {/* Charities Grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {filteredCharities.map((charity) => (
              <div
                key={charity.id}
                onClick={() => {
                  setSelectedCharity(charity.id);
                  setError('');
                }}
                className={`p-6 rounded-lg border-2 cursor-pointer transition ${
                  selectedCharity === charity.id
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 bg-white hover:border-emerald-300'
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{charity.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{charity.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="inline-block bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-medium">
                        {charity.category}
                      </span>
                      {charity.website && (
                        <a
                          href={`https://${charity.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 text-xs font-bold"
                        >
                          Visit →
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedCharity === charity.id
                          ? 'border-emerald-500 bg-emerald-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {selectedCharity === charity.id && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredCharities.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-lg">No charities found matching your search.</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 px-8 py-3 rounded-lg font-bold transition"
          >
            Back
          </Link>
          <button
            onClick={handleContinue}
            disabled={!selectedCharity}
            className={`px-8 py-3 rounded-lg font-bold transition ${
              selectedCharity
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue to Subscription
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-12 p-6 bg-emerald-50 rounded-lg border border-emerald-200">
          <h3 className="text-gray-900 font-bold mb-3">Why Choose a Charity?</h3>
          <p className="text-gray-700 text-sm">
            When you subscribe, a portion of your subscription fee automatically goes to the charity you choose. 
            You can change your charity selection anytime from your profile settings.
          </p>
        </div>
      </div>
    </div>
  );
}
