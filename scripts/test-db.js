const { PrismaClient } = require('@prisma/client');

// Simple script to test database connectivity
async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  const prisma = new PrismaClient();
  
  try {
    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1+1 AS result`;
    console.log('✅ Database connection successful!', result);
    
    // Get database info
    const dbInfo = await prisma.$queryRaw`SELECT version() as version`;
    console.log('📊 Database version:', dbInfo);
    
    // Count users
    const userCount = await prisma.user.count();
    console.log(`👤 User count: ${userCount}`);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testConnection()
    .then(success => {
      if (!success) {
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Script error:', err);
      process.exit(1);
    });
}

module.exports = { testConnection }; 