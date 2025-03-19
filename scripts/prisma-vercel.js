const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🔄 Running Prisma Vercel setup...');

// Get the prisma schema path
const prismaSchemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');

// Check if the schema exists
if (!fs.existsSync(prismaSchemaPath)) {
  console.error('❌ Prisma schema not found at:', prismaSchemaPath);
  process.exit(1);
}

// Read the schema to verify it
try {
  const schemaContent = fs.readFileSync(prismaSchemaPath, 'utf8');
  console.log('✅ Found Prisma schema file');
  
  // Simple check to ensure the schema has the required parts
  if (!schemaContent.includes('generator client')) {
    console.error('❌ Prisma schema is missing the generator client section');
    process.exit(1);
  }
  
  if (!schemaContent.includes('datasource db')) {
    console.error('❌ Prisma schema is missing the datasource db section');
    process.exit(1);
  }
  
  console.log('✅ Prisma schema validated');
} catch (readError) {
  console.error('❌ Error reading Prisma schema:', readError.message);
  process.exit(1);
}

// Verify environment variables
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.log('⚠️ Continuing anyway, assuming it will be set at runtime');
}

try {
  // First clean the generated client to avoid stale artifacts
  console.log('🧹 Cleaning up existing Prisma client...');
  const nodeModulesPrismaClientPath = path.join(process.cwd(), 'node_modules', '.prisma');
  
  if (fs.existsSync(nodeModulesPrismaClientPath)) {
    try {
      execSync(`rm -rf ${nodeModulesPrismaClientPath}`);
      console.log('✅ Successfully cleaned up Prisma client directory');
    } catch (cleanError) {
      console.warn('⚠️ Failed to clean up Prisma client directory:', cleanError.message);
      // Continue even if clean fails
    }
  } else {
    console.log('ℹ️ No existing Prisma client found to clean up');
  }

  // Generate Prisma client
  console.log('🔨 Generating Prisma client...');
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: {
      ...process.env,
      PRISMA_CLIENT_ENGINE_TYPE: 'binary', // Ensure binary client is generated
    }
  });
  
  console.log('✅ Prisma client generation completed successfully');
  
  // Verify the generated client
  const prismaClientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
  const clientIndexPath = path.join(process.cwd(), 'node_modules', '@prisma', 'client', 'index.js');
  
  if (fs.existsSync(prismaClientPath)) {
    console.log('✅ Verified: Prisma client directory exists at', prismaClientPath);
    try {
      const files = fs.readdirSync(prismaClientPath);
      console.log('📂 Contents:', files);
      
      if (files.length === 0) {
        console.error('❌ Warning: Prisma client directory is empty!');
      }
    } catch (err) {
      console.error('❌ Error reading client directory:', err.message);
    }
  } else {
    console.warn('⚠️ Warning: Generated client directory not found at expected location');
  }
  
  if (fs.existsSync(clientIndexPath)) {
    console.log('✅ Verified: @prisma/client index file exists');
  } else {
    console.warn('⚠️ Warning: @prisma/client index file not found');
  }
  
  // Create a simple verification file to check the generated client
  const verificationCode = `
  const { PrismaClient } = require('@prisma/client');
  console.log('✅ Successfully imported PrismaClient');
  
  // Don't actually connect to the database, just check the class is available
  const client = new PrismaClient();
  console.log('✅ Successfully instantiated PrismaClient');
  
  // Check that important properties exist
  console.log('✅ Client has user model:', !!client.user);
  console.log('✅ Client has article model:', !!client.article);
  `;
  
  const verificationPath = path.join(process.cwd(), 'prisma-verification.js');
  fs.writeFileSync(verificationPath, verificationCode);
  
  try {
    console.log('🧪 Testing Prisma client import...');
    execSync(`node ${verificationPath}`, { stdio: 'inherit' });
    console.log('✅ Prisma client import verification successful');
  } catch (verifyError) {
    console.error('❌ Prisma client verification failed:', verifyError.message);
    // Continue even if verification fails
  } finally {
    // Clean up verification file
    fs.unlinkSync(verificationPath);
  }
} catch (error) {
  console.error('❌ Error during Prisma client generation:', error.message);
  process.exit(1);
} 