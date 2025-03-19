'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function ArticleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Article page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-red-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Error Loading Article
        </h1>
        
        <p className="text-gray-600 mb-6">
          {error.message || "We couldn't load this article. It might be unavailable or there could be a connection issue."}
        </p>
        
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
          >
            Try Again
          </button>
          
          <Link
            href="/"
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors duration-300"
          >
            Back to Home
          </Link>
          
          <Link
            href="/api/debug-db"
            target="_blank"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-300"
          >
            Check System Status
          </Link>
        </div>
      </div>
    </div>
  );
} 