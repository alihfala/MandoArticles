// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes that guests can access
const publicRoutes = [
  '/',
  '/article',
  '/articles',
  '/author',
  '/api/articles',
  '/api/authors',
  '/api/debug-imagekit',
  '/debug-imagekit',
];

// Routes that require authentication
const authRoutes = [
  '/editor',
  '/profile',
  '/settings',
  '/api/upload',
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for NextAuth routes to avoid circular dependencies
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }
  
  // Allow all users to access public routes
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for a session token - using getToken directly to avoid circular imports
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  // If user is not logged in and the route requires authentication
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  if (!token && isAuthRoute) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURIComponent(pathname));
    return NextResponse.redirect(url);
  }

  // If user is a guest and trying to access a protected route
  const isGuest = token?.isGuest === true;
  
  // Check if the route is a write operation for the article API
  const isArticleWriteApi = 
    pathname.startsWith('/api/articles') && 
    !['GET'].includes(request.method);
  
  if (isGuest && (isAuthRoute || isArticleWriteApi)) {
    // If guest is trying to access a protected route or perform a write operation
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('error', 'GuestAccessDenied');
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Match routes but exclude NextAuth routes
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}; 