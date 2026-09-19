// Prepares the dedicated test database: creates it when missing and applies every
// migration (`prisma migrate deploy`). Run automatically by `npm test`.
// The development database is never touched.
import { execSync } from 'node:child_process';
import pg from 'pg';
import { SERVER_DIR, TEST_DB_NAME, assertTestDatabase, databaseName, testDatabaseUrl } from './helpers/env.js';

const url = testDatabaseUrl();
assertTestDatabase(url);

// Connect to the maintenance database of the same server to create the test one.
const admin = new URL(url);
admin.pathname = '/postgres';
const client = new pg.Client({ connectionString: admin.toString() });
await client.connect();
try {
  const exists = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName(url)]);
  if (exists.rowCount === 0) {
    await client.query(`CREATE DATABASE "${databaseName(url).replace(/"/g, '')}"`);
    console.log(`[tests] created database ${TEST_DB_NAME}`);
  }
} finally {
  await client.end();
}

execSync('npx prisma migrate deploy --config prisma7.config.ts', {
  cwd: SERVER_DIR,
  env: { ...process.env, DATABASE_URL: url },
  stdio: ['ignore', 'ignore', 'inherit'],
});
console.log(`[tests] database ${databaseName(url)} is ready (migrations applied)`);
