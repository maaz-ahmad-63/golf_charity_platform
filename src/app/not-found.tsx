'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-9xl font-bold text-slate-900 mb-4">404</div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-slate-600 text-lg mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="bg-slate-200 hover:bg-slate-300 text-slate-900 font-semibold py-3 px-6 rounded-lg transition"
          >
            Go Back
          </button>
        </div>

        {/* Decorative */}
        <div className="mt-12 text-6xl opacity-20">🤔</div>
      </div>
    </div>
  );
}
