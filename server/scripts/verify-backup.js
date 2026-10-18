// Proves the LATEST backup can actually be restored (P5-04's "vérification
// de restauration") — a dump nobody has ever restored is a file, not a
// backup. Run it after `backup-database.js`, or on its own schedule:
//
//   node scripts/verify-backup.js
//
// It restores into a throwaway database on the SAME server (never into the
// real one), counts the tables it got, compares that to the number of
// `@@map(...)` tables declared in `prisma/schema.prisma`, then drops the
// throwaway database either way — a verification run that leaves clutter
// behind is not something anyone will keep running.
import { execFile, spawn } from 'node:child_process';
import { createReadStream, readdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import zlib from 'node:zlib';
import { env } from '../src/config/env.js';

const BACKUP_DIR = path.resolve(process.env.BACKUP_DIR || path.join(env.storageDir, '../backups'));
const SCRATCH_DB = 'fincludia_backup_verify';

function run(bin, args, { input, env: extraEnv } = {}) {
  return new Promise((resolve, reject) => {
    // See the matching note in `backup-database.js`: Windows needs a shell
    // to find a `.cmd`/`.bat` on PATH, Linux/macOS (the production target)
    // need neither.
    const child = spawn(bin, args, { env: { ...process.env, ...extraEnv }, shell: process.platform === 'win32' });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve(stdout) : reject(new Error(`${bin} exited with code ${code}: ${stderr}`))));
    if (input) input.pipe(child.stdin);
    else child.stdin.end();
  });
}

// A SQL statement fed through STDIN rather than `-e "..."`: on Windows, the
// shell `spawn` needs for a `.cmd` wrapper re-parses a long `-e` argument
// and can mangle its quoting; piped input has none of that, on any platform.
function sql(bin, connArgs, statement, options) {
  return run(bin, connArgs, { ...options, input: Readable.from([statement]) });
}

function hasBinary(name) {
  return new Promise((resolve) => {
    execFile(process.platform === 'win32' ? 'where' : 'which', [name], (err) => resolve(!err));
  });
}

// The client binary is `mariadb` on a modern MariaDB install (where `mysql`
// may not even exist, as found running this against the project's own dev
// container) and `mysql` on MySQL or an older MariaDB — same reasoning as
// the `mariadb-dump`/`mysqldump` choice in `backup-database.js`.
async function clientBinary() {
  return (await hasBinary('mariadb')) ? 'mariadb' : 'mysql';
}

function latestDatabaseDump() {
  const files = readdirSync(BACKUP_DIR)
    .filter((name) => name.endsWith('-database.sql.gz'))
    .sort();
  if (files.length === 0) throw new Error(`No backup found in ${BACKUP_DIR}. Run backup-database.js first.`);
  return path.join(BACKUP_DIR, files.at(-1));
}

async function expectedTableCount() {
  const schema = await readFile(path.resolve('prisma/schema.prisma'), 'utf8');
  // +1: `_prisma_migrations`, Prisma's own migration bookkeeping table. It is
  // in every real database (and every real dump of one) but is not a model,
  // so it has no `@@map(...)` to count.
  return [...schema.matchAll(/@@map\("([^"]+)"\)/g)].length + 1;
}

async function main() {
  const url = new URL(env.databaseUrl);
  const bin = await clientBinary();
  const connArgs = ['-h', url.hostname, '-P', url.port || '3306', '-u', decodeURIComponent(url.username)];
  const mysqlEnv = { MYSQL_PWD: decodeURIComponent(url.password) };

  const dumpPath = latestDatabaseDump();
  console.log(`restoring ${dumpPath} into a throwaway database (${SCRATCH_DB})...`);

  await sql(bin, connArgs, `DROP DATABASE IF EXISTS ${SCRATCH_DB}; CREATE DATABASE ${SCRATCH_DB};`, { env: mysqlEnv });

  try {
    // `gunzip` is both a writable (fed by the file) and a readable (fed into
    // the client's stdin below) — one Transform stream, not two pipelines
    // racing to consume the same data.
    const gunzip = createReadStream(dumpPath).pipe(zlib.createGunzip());
    await run(bin, [...connArgs, SCRATCH_DB], { input: gunzip, env: mysqlEnv });

    const tableCount = Number(
      (await sql(bin, [...connArgs, SCRATCH_DB, '-N'], 'SHOW TABLES;', { env: mysqlEnv }))
        .trim()
        .split('\n')
        .filter(Boolean).length,
    );
    const expected = await expectedTableCount();

    console.log(`restored ${tableCount} table(s); schema.prisma declares ${expected}.`);
    if (tableCount !== expected) {
      throw new Error(`Restore produced ${tableCount} tables, expected ${expected} — the backup may be incomplete or the schema has moved since it was taken.`);
    }
    console.log('restore verified: the backup is usable.');
  } finally {
    await sql(bin, connArgs, `DROP DATABASE IF EXISTS ${SCRATCH_DB};`, { env: mysqlEnv });
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
