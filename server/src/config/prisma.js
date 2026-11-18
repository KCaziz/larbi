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
  // Recette R18 (2026-11-18): pages that failed now and then online, then
  // worked on « Réessayer ». A shared host limits the connections of one
  // database user (often 10 to 25) and may run several copies of the
  // application; the driver opens up to 10 each by default, so a busy minute
  // asked for more than the host allows and some requests were refused. Five
  // per copy are plenty (a page makes a handful of short queries); DB_POOL_SIZE
  // changes it. A request waits up to 15 s for a free connection rather than
  // failing at once.
  connectionLimit: Number(process.env.DB_POOL_SIZE) || 5,
  acquireTimeout: 15_000,
  idleTimeout: 60,
});

// Several writes are deliberately queued one after the other with a row lock
// (SELECT ... FOR UPDATE: lesson blocks, payment notifications, enrolments).
// Prisma's default limits (2 s to get a connection, 5 s per transaction) count
// the time spent WAITING for that lock, so a burst of edits on one lesson ended
// in "expired transaction" errors (P2028) instead of simply waiting its turn.
export const prisma = new PrismaClient({ adapter, transactionOptions: { maxWait: 10_000, timeout: 20_000 } });

export async function checkDatabaseConnection() {
  await prisma.$queryRaw`SELECT 1`;
  return true;
}
