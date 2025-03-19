import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await auth();
    
    return NextResponse.json({
      authenticated: !!session,
      user: session?.user || null,
      sessionDetails: {
        expires: session?.expires || null,
      },
      message: session 
        ? `Authenticated as ${session.user.email}` 
        : 'Not authenticated',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({
      error: 'Failed to get authentication status',
      message: error instanceof Error ? error.message : 'Unknown error',
      authenticated: false,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 