import { NextResponse } from 'next/server';
import { imagekit } from '@/lib/imagekit';

export async function GET() {
  try {
    // Test ImageKit configuration
    const authParams = await imagekit.getAuthenticationParameters();
    
    return NextResponse.json({
      message: 'ImageKit debug information',
      status: 'success',
      config: {
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY ? 'Set' : 'Not set',
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY ? 'Set' : 'Not set',
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
      },
      authParams,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('ImageKit debug error:', error);
    return NextResponse.json({
      error: 'Failed to test ImageKit configuration',
      message: error instanceof Error ? error.message : 'Unknown error',
      config: {
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY ? 'Set' : 'Not set',
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY ? 'Set' : 'Not set',
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 