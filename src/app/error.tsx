'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-9xl font-bold text-red-600 mb-4">500</div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Something Went Wrong</h1>
        <p className="text-slate-600 text-lg mb-2">
          An unexpected error occurred. Our team has been notified.
        </p>
        {error.digest && (
          <p className="text-slate-500 text-sm mb-8">Error ID: {error.digest}</p>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-3 px-6 rounded-lg transition"
          >
            Go Home
          </Link>
        </div>

        {/* Decorative */}
        <div className="mt-12 text-6xl opacity-20">⚠️</div>
      </div>
    </div>
  );
}
