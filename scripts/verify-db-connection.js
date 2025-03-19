// scripts/verify-db-connection.js
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function verifyDatabaseConnection() {
  console.log('🔍 Verifying database connection...');
  
  // Get the database URL from environment
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    process.exit(1);
  }
  
  try {
    // Mask the password for logging
    const maskedUrl = new URL(dbUrl);
    if (maskedUrl.password) {
      maskedUrl.password = '******';
    }
    
    console.log(`🌎 Connecting to: ${maskedUrl.toString()}`);
    console.log(`🌐 Host: ${maskedUrl.hostname}`);
    console.log(`🔌 Port: ${maskedUrl.port}`);
    console.log(`📊 Database: ${maskedUrl.pathname.substring(1)}`);
    
    // Create a Prisma client with appropriate options
    // Only using standard options compatible with all Prisma versions
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
      log: ['error']
    });
    
    // Test connection with a timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timed out after 5 seconds')), 5000);
    });
    
    // Try to connect and run a simple query
    console.log('🏁 Testing connection...');
    const result = await Promise.race([
      prisma.$queryRaw`SELECT 1+1 AS result`,
      timeoutPromise
    ]);
    
    console.log('✅ Database connection successful!', result);
    
    // Get database version
    const dbInfo = await prisma.$queryRaw`SELECT version() AS version`;
    console.log('📊 Database version:', dbInfo);
    
    // Test query performance
    console.time('Query Performance');
    await prisma.$queryRaw`SELECT 1 FROM generate_series(1, 1000)`;
    console.timeEnd('Query Performance');
    
    // Disconnect and return success
    await prisma.$disconnect();
    console.log('🎉 All database checks passed!');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error);
    
    // Try to provide more helpful information about the error
    if (error.message && error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 The database server refused the connection. Possible reasons:');
      console.error('  - The database server is not running');
      console.error('  - The IP address or port is incorrect');
      console.error('  - A firewall is blocking the connection');
    } else if (error.message && error.message.includes('ETIMEDOUT')) {
      console.error('\n💡 The connection timed out. Possible reasons:');
      console.error('  - The database server is unreachable from your current network');
      console.error('  - The IP address is incorrect');
      console.error('  - A firewall is blocking the connection');
    } else if (error.message && error.message.includes('authentication failed')) {
      console.error('\n💡 Authentication failed. Possible reasons:');
      console.error('  - The username or password is incorrect');
      console.error('  - The user does not have permission to access the database');
    }
    
    console.error('\n📋 Checklist for connection issues:');
    console.error('  1. Is the database server running?');
    console.error('  2. Is the IP address public and accessible from Vercel?');
    console.error('  3. Is the port (5433) open and forwarded if behind a router?');
    console.error('  4. Are the username and password correct?');
    console.error('  5. Does the database "mangoArticles" exist?');
    console.error('  6. Does the user have permission to access this database?');
    
    return false;
  }
}

// Run the verification if this script is executed directly
if (require.main === module) {
  verifyDatabaseConnection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Script error:', err);
      process.exit(1);
    });
}

module.exports = { verifyDatabaseConnection }; 