'use client';

import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';

type AuthCheckProps = {
  children: ReactNode;
  fallback?: ReactNode;
  allowGuest?: boolean;
}

/**
 * A component that conditionally renders children based on authentication status.
 * 
 * @param {ReactNode} children - The content to render if the user is authenticated
 * @param {ReactNode} fallback - Optional content to render if the user is not authenticated
 * @param {boolean} allowGuest - Whether to show the content to guest users (defaults to false)
 */
export default function AuthCheck({ children, fallback, allowGuest = false }: AuthCheckProps) {
  const { data: session, status } = useSession();
  
  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-pulse h-4 w-24 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  // If not authenticated, show fallback content or nothing
  if (!session) {
    return fallback ? <>{fallback}</> : null;
  }
  
  // If the user is a guest and guest access is not allowed, show fallback
  if (session.user.isGuest && !allowGuest) {
    return fallback ? <>{fallback}</> : null;
  }
  
  // User is authenticated (and not a guest or guest is allowed), show children
  return <>{children}</>;
} 