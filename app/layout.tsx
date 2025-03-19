import './globals.css';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import Providers from './providers';
import Navbar from '@/components/Navbar/Navbar';
import { Toaster } from 'react-hot-toast';

// Metadata for SEO
export const metadata: Metadata = {
  title: {
    default: 'Mando Articles - Modern Publishing Platform',
    template: '%s | Mando Articles'
  },
  description: 'A modern publishing platform for writers and readers.',
  keywords: ['articles', 'blog', 'publishing', 'writing', 'content'],
  authors: [{ name: 'Mando Articles Team' }],
  creator: 'Mando Articles',
  openGraph: {
    type: 'website',
    siteName: 'Mando Articles',
    title: 'Mando Articles - Modern Publishing Platform',
    description: 'A modern publishing platform for writers and readers.',
  },
};

// App layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Suspense fallback={<div className="h-16 bg-white shadow"></div>}>
            <Navbar />
          </Suspense>
          <main>{children}</main>
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
