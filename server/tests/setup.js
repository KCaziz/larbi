// Prepares the dedicated test database: creates it when missing and applies every
// migration (`prisma migrate deploy`). Run automatically by `npm test`.
// The development database is never touched.
import { execSync } from 'node:child_process';
import mariadb from 'mariadb';
import { SERVER_DIR, TEST_DB_NAME, assertTestDatabase, databaseName, testDatabaseUrl } from './helpers/env.js';

const url = testDatabaseUrl();
assertTestDatabase(url);

// Connect to the server (no particular database) to create the test one.
const admin = new URL(url);
const conn = await mariadb.createConnection({
  host: admin.hostname,
  port: admin.port ? Number(admin.port) : 3306,
  user: decodeURIComponent(admin.username),
  password: decodeURIComponent(admin.password),
});
try {
  const dbName = databaseName(url).replace(/`/g, '');
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
} finally {
  await conn.end();
}

execSync('npx prisma migrate deploy --config prisma7.config.ts', {
  cwd: SERVER_DIR,
  env: { ...process.env, DATABASE_URL: url },
  stdio: ['ignore', 'ignore', 'inherit'],
});
console.log(`[tests] database ${databaseName(url)} is ready (migrations applied)`);
