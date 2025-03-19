import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

// Check if we're in production or development
if (process.env.NODE_ENV === 'production') {
  // In production, create a new instance for each request
  prisma = new PrismaClient();
} else {
  // In development, reuse the same instance across requests
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.prisma;
}

// Add connection testing code that won't run during build/generate
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV === 'development') {
  try {
    // Only do the connection check if we're not in the build process
    if (typeof window === 'undefined' && !process.env.VERCEL_BUILDING) {
      // A simple query to check that the connection works
      prisma.$queryRaw`SELECT 1+1 AS result`;
      console.log('Prisma connection established successfully');
    }
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  }
}

export default prisma;
