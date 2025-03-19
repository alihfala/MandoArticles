'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Error messages based on error type
const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification link was invalid or has expired.",
  OAuthSignin: "Error during OAuth sign in. Please try again.",
  OAuthCallback: "Error during OAuth callback. Please try again.",
  OAuthCreateAccount: "Error creating OAuth user. Please try again.",
  EmailCreateAccount: "Error creating email user. Please try again.",
  Callback: "Error during callback. Please try again.",
  OAuthAccountNotLinked: "Email already exists with different provider.",
  EmailSignin: "Check your email for a sign in link.",
  CredentialsSignin: "The email or password you entered is incorrect.",
  SessionRequired: "Please sign in to access this page.",
  Default: "Unable to sign in. Please try again later.",
  GuestAccessDenied: "Guest users cannot access this feature. Please sign in with a full account."
};

// Component that uses searchParams
export default function ErrorContentClient() {
  const searchParams = useSearchParams();
  const error = searchParams?.get('error') || 'Default';
  const errorMessage = errorMessages[error] || errorMessages.Default;
  
  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Authentication Error
        </h2>
        <div className="mt-4 bg-red-50 p-4 rounded-md border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {errorMessage}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Error code: {error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col space-y-4">
        <Link 
          href="/auth/signin" 
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Try Signing In Again
        </Link>
        
        <Link 
          href="/" 
          className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
} 