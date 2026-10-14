// Prepares the dedicated test database: creates it when missing and applies every
// migration (`prisma migrate deploy`). Run automatically by `npm test`.
// The development database is never touched.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import mariadb from 'mariadb';
import { SERVER_DIR, TEST_DB_NAME, assertTestDatabase, databaseName, testDatabaseUrl } from './helpers/env.js';

// ---- the generated Prisma client must match the schema -----------------------
// Twice now (P6-05, then P6-17) a schema change was committed without running
// `npx prisma generate`, and the result was twenty tests dying on
// "Cannot read properties of undefined (reading 'findMany')" — because a model
// existed in schema.prisma and not in the compiled client. A note in a file did
// not prevent the second occurrence, so this is a check instead of a note.
//
// The generated client embeds the schema it was built FROM (`inlineSchema`), so
// comparing the two sets of model names is exact: no database, no guesswork.
function assertGeneratedClientMatchesSchema() {
  const schemaPath = path.join(SERVER_DIR, 'prisma', 'schema.prisma');
  const clientPath = path.join(SERVER_DIR, 'src', 'generated', 'prisma', 'index.js');

  if (!existsSync(clientPath)) {
    console.error('');
    console.error('[tests] Le client Prisma n’a jamais été généré.');
    console.error('[tests] Lancez : npx prisma generate');
    console.error('');
    process.exit(1);
  }

  const modelsIn = (text) => new Set([...text.matchAll(/model\s+(\w+)\s*\{/g)].map((match) => match[1]));
  const wanted = modelsIn(readFileSync(schemaPath, 'utf8'));

  const client = readFileSync(clientPath, 'utf8');
  const inline = client.match(/"inlineSchema":\s*"((?:[^"\\]|\\.)*)"/);
  if (!inline) {
    // The generated client's shape changed: say so rather than pretend to have
    // checked something.
    console.warn('[tests] Schéma embarqué illisible dans le client généré : vérification ignorée.');
    return;
  }
  const built = modelsIn(inline[1]);

  const missing = [...wanted].filter((name) => !built.has(name));
  const extra = [...built].filter((name) => !wanted.has(name));
  if (missing.length === 0 && extra.length === 0) return;

  console.error('');
  console.error('[tests] Le client Prisma généré ne correspond pas à prisma/schema.prisma.');
  if (missing.length > 0) console.error(`[tests]   absents du client : ${missing.join(', ')}`);
  if (extra.length > 0) console.error(`[tests]   absents du schéma  : ${extra.join(', ')}`);
  console.error('[tests] Lancez : npx prisma generate');
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
