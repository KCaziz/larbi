// Database and media backup (P5-04). Meant to be run on a schedule (cron,
// cPanel's own scheduler) — it takes no interactive input and exits non-zero
// on any real failure, so a scheduler can alert on it.
//
//   node scripts/backup-database.js
//
// What it does, and why each part is here:
//   - dumps the database with `mariadb-dump` (falls back to `mysqldump`,
//     the two are interchangeable for a MySQL-protocol server) — never a
//     Prisma-level export, which would miss anything outside the schema
//     (triggers, views, the exact column types) and silently drift from
//     what `prisma migrate` actually produced;
//   - archives the private media storage (`storage/private`) the same run,
//     because a database backup without the files it references (receipts,
//     media) is not a usable backup, only half of one;
//   - writes both into BACKUP_DIR, timestamped, and deletes anything beyond
//     BACKUP_KEEP (default 14) — a backup job that never rotates eventually
//     fills the disk it is supposed to be protecting.
//
// It does NOT upload the result anywhere: where backups are finally kept
// (another disk, another host) is an infrastructure decision for whoever
// runs this in production, not something to decide from inside the script.
import { execFile, spawn } from 'node:child_process';
import { createWriteStream, existsSync } from 'node:fs';
import { mkdir, readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import zlib from 'node:zlib';
import { env } from '../src/config/env.js';

const BACKUP_DIR = path.resolve(process.env.BACKUP_DIR || path.join(env.storageDir, '../backups'));
const KEEP = Number(process.env.BACKUP_KEEP) || 14;

function run(command, args) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { maxBuffer: 1024 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) reject(new Error(`${command} failed: ${stderr || err.message}`));
      else resolve(stdout);
    });
  });
}

function hasBinary(name) {
  return new Promise((resolve) => {
    execFile(process.platform === 'win32' ? 'where' : 'which', [name], (err) => resolve(!err));
  });
}

// Neither binary takes the password on the command line (it would show up in
// `ps`): both read `MYSQL_PWD`, which every MySQL-protocol client honours.
// The dump is piped straight into gzip and onto disk — never buffered whole
// in memory first, which would scale with the database rather than with the
// machine running the backup.
async function dumpDatabase(url, outPath) {
  const bin = (await hasBinary('mariadb-dump')) ? 'mariadb-dump' : 'mysqldump';
  const args = ['-h', url.hostname, '-P', url.port || '3306', '-u', decodeURIComponent(url.username), url.pathname.slice(1)];
  // `shell: true` only on Windows: a `.cmd`/`.bat` on PATH (a wrapper, a
  // version manager's shim) is otherwise invisible to `spawn`, which calls
  // `CreateProcess` directly rather than going through a shell. Linux and
  // macOS need neither — the binary itself is directly executable there.
  const child = spawn(bin, args, {
    env: { ...process.env, MYSQL_PWD: decodeURIComponent(url.password) },
    shell: process.platform === 'win32',
  });

  let stderr = '';
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });

  const [exitCode] = await Promise.all([
    new Promise((resolve, reject) => {
      child.on('error', reject); // the binary itself could not be launched at all
      child.on('close', resolve);
    }),
    pipeline(child.stdout, zlib.createGzip(), createWriteStream(outPath)),
  ]);
  if (exitCode !== 0) throw new Error(`${bin} exited with code ${exitCode}: ${stderr}`);
}

async function archiveMedia(outPath) {
  // `storage/private` may not exist yet on a brand new install (nobody has
  // uploaded anything) — an empty archive is correct, not an error.
  if (!existsSync(path.join(env.storageDir, 'private'))) return false;
  // `--force-local`: a path containing a colon (a Windows drive letter) is
  // otherwise read by some `tar` builds as `host:path`, an ssh-style remote
  // archive — harmless to ask for on every platform, only load-bearing on
  // Windows.
  await run('tar', ['--force-local', '-czf', outPath, '-C', env.storageDir, 'private']);
  return true;
}

async function rotate() {
  const entries = await readdir(BACKUP_DIR);
  const dated = entries.filter((name) => /^\d{4}-\d{2}-\d{2}T/.test(name));
  const groups = new Map();
  for (const name of dated) {
    const stamp = name.slice(0, 19); // the timestamp prefix groups the two files of one run
    groups.set(stamp, [...(groups.get(stamp) ?? []), name]);
  }
  const stamps = [...groups.keys()].sort().reverse();
  const toDelete = stamps.slice(KEEP);
  for (const stamp of toDelete) {
    for (const name of groups.get(stamp)) {
      await rm(path.join(BACKUP_DIR, name));
    }
  }
  return { kept: stamps.length - toDelete.length, deleted: toDelete.length };
}

async function main() {
  const url = new URL(env.databaseUrl);
  await mkdir(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');

  const dbPath = path.join(BACKUP_DIR, `${stamp}-database.sql.gz`);
  await dumpDatabase(url, dbPath);
  const dbSize = (await stat(dbPath)).size;
  console.log(`database -> ${dbPath} (${(dbSize / 1024 / 1024).toFixed(1)} MB)`);

  const mediaPath = path.join(BACKUP_DIR, `${stamp}-media.tar.gz`);
  const hadMedia = await archiveMedia(mediaPath);
  console.log(hadMedia ? `media -> ${mediaPath} (${((await stat(mediaPath)).size / 1024 / 1024).toFixed(1)} MB)` : 'media -> nothing uploaded yet, skipped');

  const { kept, deleted } = await rotate();
  console.log(`rotation: ${kept} run(s) kept, ${deleted} deleted (BACKUP_KEEP=${KEEP})`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
