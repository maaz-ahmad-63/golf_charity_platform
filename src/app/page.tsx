import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-5 max-w-7xl mx-auto border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">GolfCharity</h1>
        <div className="flex gap-6">
          <Link href="/login" className="text-gray-700 hover:text-gray-900 transition font-medium">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition font-medium"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section with Golf Background */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(5, 150, 105, 0.85) 0%, rgba(4, 120, 87, 0.85) 100%), url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M10,50 Q25,30 40,50 Q55,70 70,50 Q85,30 100,50\' fill=\'none\' stroke=\'rgba(255,255,255,0.1)\' stroke-width=\'2\'/%3E%3C/svg%3E")',
            backgroundSize: '200px 200px',
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Track Your Golf. Win Prizes. Give Back.
          </h2>
          <p className="text-xl text-emerald-50 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of golfers in our premium golf draws where every subscription automatically supports the charities you care about.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/signup"
              className="bg-white text-emerald-700 hover:bg-emerald-50 text-lg font-bold px-8 py-4 rounded-lg transition transform hover:scale-105"
            >
              Subscribe Now
            </Link>
            <Link
              href="#features"
              className="border-2 border-white text-white hover:bg-white hover:text-emerald-700 text-lg font-bold px-8 py-4 rounded-lg transition"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-5xl font-bold text-gray-900 text-center mb-20">How It Works</h3>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">Enter Your Scores</h4>
              <p className="text-gray-600 leading-relaxed">
                Log your latest 5 golf scores in Stableford format. We keep track of your performance automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">Participate in Draws</h4>
              <p className="text-gray-600 leading-relaxed">
                Every month, we run draws based on your scores. Match scores to win cash prizes and recognition.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h-2m0 0H9m3 0h2m-3-4v8m0-12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">Support Charities</h4>
              <p className="text-gray-600 leading-relaxed">
                Choose a charity and we'll automatically donate a portion of your subscription to causes you care about.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl font-bold text-emerald-700 mb-2">$50K+</div>
              <p className="text-gray-600 text-lg">Distributed to Winners</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-emerald-700 mb-2">$25K+</div>
              <p className="text-gray-600 text-lg">Donated to Charities</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-emerald-700 mb-2">5K+</div>
              <p className="text-gray-600 text-lg">Active Members</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-emerald-700 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-5xl font-bold text-white mb-6">Ready to Join?</h3>
          <p className="text-xl text-emerald-100 mb-10">
            Choose your subscription plan and start playing with purpose.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-emerald-700 font-bold text-lg px-10 py-4 rounded-lg hover:bg-emerald-50 transition transform hover:scale-105"
          >
            Get Started Today
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-gray-600 bg-gray-50">
        <p>&copy; 2026 GolfCharity. All rights reserved. | Privacy Policy | Terms of Service</p>
      </footer>
    </div>
  );
}
