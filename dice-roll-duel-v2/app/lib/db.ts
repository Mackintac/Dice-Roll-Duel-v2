import 'dotenv/config';
import { PrismaClient } from '@/app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

declare global {
  var prisma: PrismaClient | undefined;
}

function createClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  } as any);
  const adapter = new PrismaPg(pool as any);
  return new PrismaClient({ adapter });
}

export const prisma = globalThis.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}
