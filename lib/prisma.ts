import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }
  prisma = global.prisma;
}

// Additional initialization check
try {
  // A simple query to check that the connection works
  prisma.$queryRaw`SELECT 1+1 AS result`;
  console.log('Prisma connection established successfully');
} catch (error) {
  console.error('Failed to connect to the database:', error);
}

export default prisma;
