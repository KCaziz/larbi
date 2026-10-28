// Start-of-session check: `npm run reprise` (from server/).
//
// A session that stops abruptly leaves the next one on a half-prepared machine.
// On 2026-10-28 the work of the day before was committed, but the Prisma client
// had not been regenerated (git-ignored, so it never travels with a commit) and
// seven migrations were not applied to the development database. This script
// puts the machine back in step with the repository, then says where the plan
// stands, so the next session starts on a known state instead of rediscovering it.
//
//   npm run reprise              regenerate the client, apply pending migrations, report
//   npm run reprise -- --verifier  report only, change nothing
//
// It never resets or drops anything: `prisma migrate deploy` only applies
// migrations that are not yet applied, in order.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatedClientDrift } from './lib/prismaClient.js';

const SERVER_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.resolve(SERVER_DIR, '..');
const CHECK_ONLY = process.argv.includes('--verifier');
const PRISMA_CONFIG = '--config prisma7.config.ts';

const problems = [];
const say = (line = '') => console.log(line);
const run = (command) => execSync(command, { cwd: SERVER_DIR, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

// ---- 1. the generated Prisma client -------------------------------------------
say('1. Client Prisma généré');
const drift = generatedClientDrift(SERVER_DIR);
if (drift.state === 'ok') say('   à jour');
else if (drift.state === 'unreadable') say('   schéma embarqué illisible : vérification impossible');
else {
  say(drift.state === 'absent' ? '   jamais généré' : `   en retard (absents : ${drift.missing.join(', ') || '—'} ; en trop : ${drift.extra.join(', ') || '—'})`);
  if (CHECK_ONLY) problems.push('client Prisma à régénérer');
  else {
    run(`npx prisma generate ${PRISMA_CONFIG}`);
    say('   → régénéré');
  }
}

// ---- 2. migrations of the development database ------------------------------
say('2. Base de développement');
let status = '';
try {
  status = run(`npx prisma migrate status ${PRISMA_CONFIG}`);
} catch (error) {
  // migrate status exits 1 when migrations are pending: its output is still the answer.
  status = `${error.stdout ?? ''}${error.stderr ?? ''}`;
}
if (/Database schema is up to date/i.test(status)) say('   toutes les migrations sont appliquées');
else if (/have not yet been applied/i.test(status)) {
  const pending = [...status.matchAll(/^(\d{14}_\w+)\s*$/gm)].map((m) => m[1]);
  say(`   ${pending.length} migration(s) non appliquée(s) : ${pending.join(', ')}`);
  if (CHECK_ONLY) problems.push('migrations à appliquer');
  else {
    run(`npx prisma migrate deploy ${PRISMA_CONFIG}`);
    say('   → appliquées (migrate deploy : rien n’est supprimé ni réinitialisé)');
  }
} else {
  say('   état illisible ou base injoignable (le conteneur MariaDB tourne-t-il ?) :');
  say(status.trim().split('\n').slice(-4).map((l) => `     ${l}`).join('\n'));
  problems.push('base de développement injoignable');
}

// ---- 3. where the plan stands ------------------------------------------------
say('3. TASKS.md');
const text = readFileSync(path.join(ROOT, 'TASKS.md'), 'utf8');
const tasks = text.split(/^### /m).slice(1).filter((b) => /^P\d-\d\d — /.test(b)).map((block) => ({
  id: block.slice(0, 5),
  title: block.slice(8, block.indexOf('\n')).trim(),
  status: block.match(/- Statut : `([^`]+)`/)?.[1] ?? '?',
  priority: block.match(/- Priorité : `([^`]+)`/)?.[1] ?? '',
  deps: [...(block.match(/- Dépendances : ([^\n]*)/)?.[1] ?? '').matchAll(/`(P\d-\d\d)`/g)].map((d) => d[1]),
  block,
}));
const byId = new Map(tasks.map((t) => [t.id, t]));
const done = (id) => byId.get(id)?.status === '✅ done';

const started = tasks.filter((t) => t.status === '🚧 in-progress');
say(`   en cours : ${started.length ? started.map((t) => t.id).join(', ') : 'aucune'}`);

// A done task may hand leftovers on, but only to a task that is still open.
const orphans = tasks.filter((t) => t.status === '✅ done').flatMap((t) =>
  [...t.block.matchAll(/^- \*\*Rest(?:e|ent)\*\*[^\n]*/gm)]
    .filter((m) => ![...m[0].matchAll(/`(P\d-\d\d)`/g)].some((d) => !done(d[1])))
    .map(() => t.id));
if (orphans.length) {
  say(`   terminées mais avec un reste confié à aucune tâche ouverte : ${[...new Set(orphans)].join(', ')}`);
  problems.push('restes sans tâche');
}

const rank = { '🔴 high': 0, '🟡 medium': 1, '🟢 low': 2 };
const ready = tasks
  .filter((t) => t.status === '❌ todo' && t.deps.every(done))
  .sort((a, b) => (rank[a.priority] ?? 3) - (rank[b.priority] ?? 3) || a.id.localeCompare(b.id));
say(`   réalisables maintenant (${ready.length}) :`);
for (const t of ready.slice(0, 12)) say(`     ${t.id} ${t.priority.padEnd(10)} ${t.title}`);

// ---- 4. uncommitted work --------------------------------------------------------
say('4. Dépôt');
try {
  const changes = execSync('git status --short', { cwd: ROOT, encoding: 'utf8' }).trimEnd();
  say(changes ? `   modifications non commitées :\n${changes.split('\n').map((l) => `     ${l}`).join('\n')}` : '   propre');
} catch {
  say('   git indisponible');
}

say();
say(problems.length ? `À régler : ${problems.join(' ; ')}.` : 'Machine prête. Avant de clore une tâche : npm test (server) et npm run build (client).');
process.exitCode = problems.length ? 1 : 0;
