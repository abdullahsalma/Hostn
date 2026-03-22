import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Animated illustration */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          <div className="absolute inset-0 bg-primary-100 rounded-full animate-pulse" />
          <div className="absolute inset-4 bg-primary-50 rounded-full flex items-center justify-center">
            <span className="text-6xl font-bold text-primary-600">404</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Page not found
        </h1>
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="btn-primary px-6 py-2.5 text-sm font-medium"
          >
            Go to Homepage
          </Link>
          <Link
            href="/search"
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Search Properties
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            Looking for something specific? Try these:
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {[
              { href: '/', label: 'Home' },
              { href: '/search', label: 'Search' },
              { href: '/host', label: 'Host Dashboard' },
              { href: '/dashboard', label: 'My Account' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 px-3 py-1.5 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
