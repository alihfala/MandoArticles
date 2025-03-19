// This is a server component
import { Suspense } from 'react';
import ErrorContentClient from './ErrorContentClient';

// Loading fallback for Suspense
function ErrorPageLoading() {
  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Loading...
        </h2>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<ErrorPageLoading />}>
        <ErrorContentClient />
      </Suspense>
    </div>
  );
} 