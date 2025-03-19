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

// Check if an IP is local/private
function isLocalOrPrivateIP(ip: string): boolean {
  if (ip === 'localhost' || ip === '127.0.0.1') return true;
  
  // Check common private IP ranges
  return (
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    (ip.startsWith('172.') && 
      (() => {
        const secondOctet = parseInt(ip.split('.')[1]);
        return secondOctet >= 16 && secondOctet <= 31;
      })()
    )
  );
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
    
    // Parse host information
    let hostInfo = {};
    let isLocalhost = false;
    
    try {
      const parsedUrl = new URL(dbUrl);
      const hostname = parsedUrl.hostname;
      isLocalhost = isLocalOrPrivateIP(hostname);
      
      hostInfo = {
        hostname,
        port: parsedUrl.port,
        database: parsedUrl.pathname.substring(1),
        isLocalOrPrivate: isLocalhost,
        warning: isLocalhost ? 
          'Using localhost or a private IP will not work from Vercel. Use a public IP or hosted database instead.' : 
          undefined
      };
    } catch (e) {
      hostInfo = { error: 'Could not parse database URL' };
    }
    
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
          ...hostInfo
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
      },
      deployment: {
        vercel_url: process.env.VERCEL_URL || 'Not on Vercel',
        region: process.env.VERCEL_REGION || 'Unknown',
      }
    });
  } catch (error) {
    console.error('❌ Database connection error:', error);
    
    // Safely get database info even if there's an error
    let dbInfo: any = { error: 'Could not parse database URL' };
    let troubleshooting = [];
    
    try {
      const dbUrl = process.env.DATABASE_URL;
      if (dbUrl) {
        const parsedUrl = new URL(dbUrl);
        const hostname = parsedUrl.hostname;
        const isLocal = isLocalOrPrivateIP(hostname);
        
        dbInfo = {
          host: hostname,
          port: parsedUrl.port,
          database: parsedUrl.pathname.substring(1),
          isLocalOrPrivate: isLocal
        };
        
        // Add specific troubleshooting based on connection issue
        if (isLocal) {
          troubleshooting.push(
            "You're using localhost or a private IP which won't work on Vercel.",
            "Update DATABASE_URL in Vercel with a public IP address or hosted database."
          );
        }
        
        if (error instanceof Error) {
          if (error.message.includes('ECONNREFUSED')) {
            troubleshooting.push(
              "The database server refused the connection. Possible causes:",
              "- PostgreSQL is not running at the specified host/port",
              "- Firewall is blocking the connection",
              "- If using a public IP, port forwarding may not be set up"
            );
          } else if (error.message.includes('timeout')) {
            troubleshooting.push(
              "Connection timed out. Possible causes:",
              "- Database server is unreachable",
              "- Network latency or firewall issues"
            );
          } else if (error.message.includes('authentication')) {
            troubleshooting.push(
              "Authentication failed. Check your database username and password."
            );
          }
        }
      } else {
        troubleshooting.push("DATABASE_URL environment variable is not set in Vercel");
      }
    } catch (e) {
      // Keep default error
    }
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      databaseInfo: dbInfo,
      troubleshooting: troubleshooting.length > 0 ? troubleshooting : undefined,
      environment: {
        node_env: process.env.NODE_ENV,
        is_vercel: !!process.env.VERCEL,
        timestamp: new Date().toISOString()
      },
      deployment: {
        vercel_url: process.env.VERCEL_URL || 'Not on Vercel',
        region: process.env.VERCEL_REGION || 'Unknown',
      }
    }, { status: 500 });
  }
} 