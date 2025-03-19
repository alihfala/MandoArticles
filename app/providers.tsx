'use client';

import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';

export default function Providers({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // Create a client instance in the user's browser
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
        retry: 1, // Reduce retries to avoid spamming failed requests
      },
    },
  }));

  // Check if we're in the browser environment to safely use SessionProvider
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // This ensures hydration matching by waiting until client-side to render children
  if (!mounted) {
    // Return a minimal placeholder that doesn't use any client hooks
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
} 