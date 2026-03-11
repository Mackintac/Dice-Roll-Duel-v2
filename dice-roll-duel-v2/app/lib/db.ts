import { PrismaClient } from '@prisma/client/extension';

// checks for an existing PrismaClient in globalThis object
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// exports the cached version or a new PrismaClient if one doesn't already exist
export const prisma = globalForPrisma ?? new PrismaClient();

// update globalForPrisma to new version of PrismaClient if node environment is dev
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
