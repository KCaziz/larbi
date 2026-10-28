// Does the generated Prisma client match prisma/schema.prisma?
//
// Shared by tests/setup.js (which refuses to run on a stale client) and
// scripts/reprise.js (which regenerates it). Three times now (P6-05, P6-17, then
// the session of 2026-10-27) a schema change was committed without running
// `npx prisma generate`; the generated folder is git-ignored, so the next
// session starts on a client that lacks the new models.
//
// The generated client embeds the schema it was built FROM (`inlineSchema`), so
// comparing the two sets of model names is exact: no database, no guesswork.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const modelsIn = (text) => new Set([...text.matchAll(/model\s+(\w+)\s*\{/g)].map((match) => match[1]));

// Returns { state: 'ok' | 'absent' | 'unreadable' | 'stale', missing, extra }.
export function generatedClientDrift(serverDir) {
  const schemaPath = path.join(serverDir, 'prisma', 'schema.prisma');
  const clientPath = path.join(serverDir, 'src', 'generated', 'prisma', 'index.js');
  if (!existsSync(clientPath)) return { state: 'absent', missing: [], extra: [] };

  const wanted = modelsIn(readFileSync(schemaPath, 'utf8'));
  const inline = readFileSync(clientPath, 'utf8').match(/"inlineSchema":\s*"((?:[^"\\]|\\.)*)"/);
  // The generated client's shape changed: say so rather than pretend to have checked something.
  if (!inline) return { state: 'unreadable', missing: [], extra: [] };
  const built = modelsIn(inline[1]);

  const missing = [...wanted].filter((name) => !built.has(name));
  const extra = [...built].filter((name) => !wanted.has(name));
  return { state: missing.length === 0 && extra.length === 0 ? 'ok' : 'stale', missing, extra };
}
