import { PrismaClient, Prisma } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Function to create a PrismaClient with appropriate settings
const createPrismaClient = () => {
  // Configure logging - more verbose in development, minimal in production
  const logOptions: Prisma.LogLevel[] = process.env.NODE_ENV === 'production' 
    ? ['error'] 
    : ['query', 'error', 'warn'];

  // Get database URL from environment
  const databaseUrl = process.env.DATABASE_URL;

  // If no DATABASE_URL is found, log an error but don't crash
  if (!databaseUrl) {
    console.error('⚠️ DATABASE_URL environment variable is not set');
  } else {
    console.log(`✅ DATABASE_URL is set. First 10 chars: ${databaseUrl.substring(0, 10)}...`);
  }

  // Create client with compatible options
  const prismaOptions: Prisma.PrismaClientOptions = {
    log: logOptions,
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  };

  return new PrismaClient(prismaOptions);
};

// Initialize PrismaClient
let prisma: PrismaClient;

// In production (Vercel), create a new instance for each invocation 
// In development, reuse the same instance across requests
if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient();
} else {
  // In development, reuse the Prisma client
  if (!global.prisma) {
    global.prisma = createPrismaClient();
  }
  prisma = global.prisma;
}

// Additional debugging for Vercel environments
if (process.env.VERCEL && typeof window === 'undefined') {
  console.log('🚀 Running on Vercel - Prisma Client initialized');
  console.log(`🌎 Environment: ${process.env.NODE_ENV}`);
  
  // Simple verification of database connectivity 
  if (process.env.NODE_ENV === 'production') {
    prisma.$connect()
      .then(() => console.log('✅ Database connection successful'))
      .catch(e => console.error('❌ Database connection failed:', e));
  }
}

export default prisma;
