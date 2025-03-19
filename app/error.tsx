'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-5">
          <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-red-500 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Something Went Wrong
            </h1>
            
            <p className="text-gray-600 mb-3">
              {error.message || "We've encountered an unexpected error."}
            </p>
            
            <p className="text-gray-500 text-sm mb-6">
              Error reference: {error.digest}
            </p>
            
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 justify-center">
              <button
                onClick={() => reset()}
                className="px-5 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
              >
                Try Again
              </button>
              
              <Link
                href="/"
                className="px-5 py-3 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors duration-300"
              >
                Back to Home
              </Link>
              
              <Link
                href="/api/debug-db"
                target="_blank"
                className="px-5 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-300"
              >
                System Status
              </Link>
            </div>
            
            <div className="mt-10 text-sm text-gray-500">
              <p>If this problem persists, please contact support.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 