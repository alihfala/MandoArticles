import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // In production, create a new instance
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

// Additional debugging for Vercel environments
if (process.env.VERCEL && typeof window === 'undefined') {
  console.log('Running on Vercel - Prisma Client initialized');
}

export default prisma;
