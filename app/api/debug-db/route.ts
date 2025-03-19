import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Safely mask a database URL to hide credentials
function maskDatabaseUrl(url: string | undefined): string {
  if (!url) return 'Not set';
  try {
    const parsedUrl = new URL(url);
    // Mask the password if present
    if (parsedUrl.password) {
      parsedUrl.password = '******';
    }
    return parsedUrl.toString();
  } catch (e) {
    return 'Invalid URL format';
  }
}

// A diagnostic API endpoint to check database connectivity
export async function GET() {
  try {
    console.log('🔍 DEBUG: Testing database connection...');
    
    // Get connection info
    const dbUrl = process.env.DATABASE_URL || 'Not set';
    const directUrl = process.env.DIRECT_URL;
    const maskedDbUrl = maskDatabaseUrl(dbUrl);
    const maskedDirectUrl = directUrl ? maskDatabaseUrl(directUrl) : 'Not set';
    
    // Connection test with timeout
    const connectionTestPromise = prisma.$queryRaw`SELECT 1+1 AS result`;
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout after 5 seconds')), 5000)
    );
    
    // Race the connection test against the timeout
    const testConnection = await Promise.race([
      connectionTestPromise,
      timeoutPromise
    ]);
    
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
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection is working',
      database: {
        connection: {
          url: maskedDbUrl,
          directUrl: maskedDirectUrl,
          host: new URL(dbUrl).hostname,
          port: new URL(dbUrl).port,
          database: new URL(dbUrl).pathname.substring(1)
        },
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
    
    // Safely get database info even if there's an error
    let dbInfo;
    try {
      const dbUrl = process.env.DATABASE_URL;
      if (dbUrl) {
        const parsedUrl = new URL(dbUrl);
        dbInfo = {
          host: parsedUrl.hostname,
          port: parsedUrl.port,
          database: parsedUrl.pathname.substring(1)
        };
      } else {
        dbInfo = 'DATABASE_URL is not set';
      }
    } catch (e) {
      dbInfo = 'Invalid DATABASE_URL format';
    }
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseInfo: dbInfo,
      environment: {
        node_env: process.env.NODE_ENV,
        is_vercel: !!process.env.VERCEL,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
} 