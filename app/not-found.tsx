import Link from 'next/link';

// Static not-found page following Next.js 15 conventions
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-6xl font-bold text-gray-900">404</h1>
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
            Page Not Found
          </h2>
          <p className="mt-2 text-base text-gray-600">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Link 
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Return Home
            </Link>
            <Link 
              href="/api/debug-db"
              target="_blank"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Check System Status
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 