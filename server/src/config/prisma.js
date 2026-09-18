import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/index.js';
import { env } from './env.js';

// Prisma 7 requires an explicit driver adapter — it no longer opens its own
// connection from DATABASE_URL by default.
const adapter = new PrismaPg({ connectionString: env.databaseUrl });

export const prisma = new PrismaClient({ adapter });

export async function checkDatabaseConnection() {
  await prisma.$queryRaw`SELECT 1`;
  return true;
}
