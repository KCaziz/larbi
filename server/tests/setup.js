// Prepares the dedicated test database: creates it when missing and applies every
// migration (`prisma migrate deploy`). Run automatically by `npm test`.
// The development database is never touched.
import { execSync } from 'node:child_process';
import mariadb from 'mariadb';
import { generatedClientDrift } from '../scripts/lib/prismaClient.js';
import { SERVER_DIR, TEST_DB_NAME, assertTestDatabase, databaseName, testDatabaseUrl } from './helpers/env.js';

// ---- the generated Prisma client must match the schema -----------------------
// A model in schema.prisma but not in the compiled client makes twenty tests die
// on "Cannot read properties of undefined (reading 'findMany')". The check lives
// in scripts/lib/prismaClient.js; `npm run reprise` regenerates the client.
function assertGeneratedClientMatchesSchema() {
  const { state, missing, extra } = generatedClientDrift(SERVER_DIR);
  if (state === 'ok') return;
  if (state === 'unreadable') {
    console.warn('[tests] Schéma embarqué illisible dans le client généré : vérification ignorée.');
    return;
  }
  if (state === 'absent') {
    console.error('');
    console.error('[tests] Le client Prisma n’a jamais été généré.');
    console.error('[tests] Lancez : npm run reprise');
    console.error('');
    process.exit(1);
  }

  console.error('');
  console.error('[tests] Le client Prisma généré ne correspond pas à prisma/schema.prisma.');
  if (missing.length > 0) console.error(`[tests]   absents du client : ${missing.join(', ')}`);
  if (extra.length > 0) console.error(`[tests]   absents du schéma  : ${extra.join(', ')}`);
  console.error('[tests] Lancez : npm run reprise');
  console.error('');
  process.exit(1);
}

assertGeneratedClientMatchesSchema();

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
