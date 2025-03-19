import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// A diagnostic API endpoint to check database connectivity
export async function GET() {
  try {
    console.log('🔍 DEBUG: Testing database connection...');
    
    // Test database connectivity
    const testConnection = await prisma.$queryRaw`SELECT 1+1 AS result`;
    console.log('✅ Database connection successful:', testConnection);
    
    // Get database version (works in PostgreSQL)
    let dbVersion;
    try {
      dbVersion = await prisma.$queryRaw`SELECT version() as version`;
    } catch (e) {
      console.log('⚠️ Could not get database version:', e);
      dbVersion = 'Unable to retrieve';
    }
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`👤 User count: ${userCount}`);
    
    // Count articles
    const articleCount = await prisma.article.count();
    console.log(`📝 Article count: ${articleCount}`);
    
    // Count published articles
    const publishedArticleCount = await prisma.article.count({
      where: { published: true }
    });
    
    // Get database connection info (masked for security)
    let dbInfo = 'Database URL is set';
    if (!process.env.DATABASE_URL) {
      dbInfo = 'DATABASE_URL is not set!';
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection is working',
      database: {
        connection: dbInfo,
        version: dbVersion,
        stats: {
          users: userCount,
          articles: {
            total: articleCount,
            published: publishedArticleCount
          }
        }
      },
      environment: {
        node_env: process.env.NODE_ENV,
        is_vercel: !!process.env.VERCEL,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Database connection error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseUrl: process.env.DATABASE_URL ? 'DATABASE_URL is set' : 'DATABASE_URL is not set',
      environment: {
        node_env: process.env.NODE_ENV,
        is_vercel: !!process.env.VERCEL,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
} 