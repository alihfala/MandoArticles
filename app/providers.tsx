'use client';

import { useRef, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';

export default function Providers({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // Create a client instance in the user's browser
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
        retry: 1, // Reduce retries to avoid spamming failed requests
      },
    },
  }));

  // Check if we're in the browser environment to safely use SessionProvider
  const [isMounted, setIsMounted] = useState(false);
  
  // Only render providers after component mounts in the client
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    // Return just the children without SessionProvider during SSR
    return <>{children}</>;
  }

  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      <QueryClientProvider client={client}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
} 