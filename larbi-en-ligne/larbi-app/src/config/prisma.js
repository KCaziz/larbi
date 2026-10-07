import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../generated/prisma/index.js';
import { env } from './env.js';

// Prisma 7 requires an explicit driver adapter — it no longer opens its own
// connection from DATABASE_URL by default. Parsed by hand (instead of handing
// the adapter the raw connection string) so `sessionVariables` can ride along:
// every hand-written raw query in this codebase quotes identifiers the
// PostgreSQL way (double quotes, from when the database was PostgreSQL);
// ANSI_QUOTES makes MariaDB accept exactly that instead of rewriting every one
// of them. Backtick-quoted identifiers (what Prisma itself generates, and any
// SQL written fresh for MySQL/MariaDB) are unaffected by this mode either way.
const dbUrl = new URL(env.databaseUrl);
const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: dbUrl.port ? Number(dbUrl.port) : 3306,
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.replace(/^\//, ''),
  sessionVariables: { sql_mode: 'ANSI_QUOTES' },
});

export const prisma = new PrismaClient({ adapter });

export async function checkDatabaseConnection() {
  await prisma.$queryRaw`SELECT 1`;
  return true;
}
