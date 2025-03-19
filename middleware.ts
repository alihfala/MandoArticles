// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define routes that should bypass middleware - prevents potential redirect loops
const BYPASS_ROUTES = [
  '/api/auth', 
  '/_next',
  '/favicon.ico'
];

// Define routes that should be protected for authenticated users only
const PROTECTED_ROUTES = [
  '/editor',
  '/admin',
  '/dashboard',
  '/profile'
];

// Define routes that should be skipped during prerendering (build time)
const SKIP_PRERENDER_ROUTES = [
  '/_not-found',
  '/auth/error'
];

export async function middleware(request: NextRequest) {
  // Check if we're in the build process
  const isBuildTime = process.env.NODE_ENV === 'production' && 
                      process.env.VERCEL_ENV === 'production' && 
                      !request.headers.get('user-agent')?.includes('Chrome');
                      
  // Handle routes to skip during prerendering
  if (isBuildTime) {
    const pathname = request.nextUrl.pathname;
    if (SKIP_PRERENDER_ROUTES.some(route => pathname.startsWith(route) || pathname === route)) {
      return NextResponse.next();
    }
  }

  // Skip middleware for bypassed routes
  if (BYPASS_ROUTES.some(route => request.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // Get the user session token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // Handle authentication for protected routes
  if (PROTECTED_ROUTES.some(route => 
    request.nextUrl.pathname.startsWith(route) || 
    request.nextUrl.pathname === route
  )) {
    if (!token) {
      // If no token, redirect to login with callback URL
      const callbackUrl = encodeURIComponent(request.nextUrl.pathname);
      const loginUrl = new URL(`/auth/signin?callbackUrl=${callbackUrl}`, request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // For routes that require a full account (not guest access)
    const isGuest = (token as any)?.isGuest;
    if (isGuest && request.nextUrl.pathname.startsWith('/editor')) {
      // Redirect guest users trying to access certain features
      const errorUrl = new URL('/auth/signin?error=GuestAccessDenied', request.url);
      return NextResponse.redirect(errorUrl);
    }
  }

  // Allow all other routes
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  // Match all routes except static files, assets and api routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 