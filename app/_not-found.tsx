// Static _not-found page with no client-side dependencies
export default function NotFoundFallback() {
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
        </div>
      </div>
    </div>
  );
} 