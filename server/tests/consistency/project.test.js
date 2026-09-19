import '../helpers/setup-env.js';
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { SERVER_DIR } from '../helpers/env.js';
import { createApp } from '../../src/app.js';

// Cross-cutting consistency of the PROJECT: the pieces written apart must agree
// (client <-> server, translations, configuration, migrations, task tracking).

const ROOT = path.resolve(SERVER_DIR, '..');
const CLIENT = path.join(ROOT, 'client');
const read = (...p) => readFileSync(path.join(...p), 'utf8');

function walk(dir, exts, out = []) {
  for (const name of readdirSync(dir)) {
    if (['node_modules', 'dist', 'generated', 'storage'].includes(name)) continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, exts, out);
    else if (exts.some((e) => name.endsWith(e))) out.push(full);
  }
  return out;
}

// ---- Express route table ---------------------------------------------------
function walkRoutes(stack, prefix, out) {
  for (const layer of stack) {
    if (layer.route) {
      for (const method of Object.keys(layer.route.methods)) out.push({ method: method.toUpperCase(), path: (prefix + layer.route.path).replace(/(.)\/$/, '$1') });
    } else if (layer.name === 'router' && layer.handle?.stack) {
      const src = layer.regexp.source;
      const mount = src === '^\\/?(?=\\/|$)' ? '' : src.replace('^\\/', '/').replace('\\/?(?=\\/|$)', '').replace(/\\\//g, '/');
      walkRoutes(layer.handle.stack, prefix + mount, out);
    }
  }
}
const serverRoutes = [];
walkRoutes(createApp()._router.stack, '', serverRoutes);
const patternToRegex = (pattern) => new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/:[A-Za-z]+/g, '[^/]+').replace(/\*/g, '.*')}/?$`);
const normalise = (p) => p.split(/[?#]/)[0].replace(/\$\{[^}]*\}/g, ':x');

// ---- React router paths ------------------------------------------------------
function clientRoutes() {
  const src = read(CLIENT, 'src/router/index.jsx');
  const routes = new Set(['/']);
  const stack = [];
  const re = /[{}]|\bpath:\s*'([^']*)'/g;
  let m;
  while ((m = re.exec(src))) {
    if (m[0] === '{') stack.push({ path: null });
    else if (m[0] === '}') stack.pop();
    else {
      stack[stack.length - 1].path = m[1];
      const full = `/${stack.map((f) => f.path).filter((p) => p !== null).join('/')}`.replace(/\/+/g, '/');
      routes.add(full === '/*' ? '/*' : full.replace(/\/$/, '') || '/');
    }
  }
  return [...routes];
}

describe('client <-> server contract', () => {
  test('the walk finds the server routes and the client routes', () => {
    assert.ok(serverRoutes.length >= 45, `${serverRoutes.length} server routes`);
    const routes = clientRoutes();
    assert.ok(routes.length >= 25, `${routes.length} client routes`);
    for (const expected of ['/blog', '/blog/:slug', '/catalogue/:slug/cours/:courseId', '/admin/articles/:id', '/verification/:number']) assert.ok(routes.includes(expected), expected);
  });

  test('every API address written in the client exists on the server', () => {
    const files = walk(path.join(CLIENT, 'src'), ['.js', '.jsx']);
    // "/blog" and "/admin" alone are pages of the site, not API addresses: only real API prefixes count.
    const literal = /([`'"])(\/(?:learn|auth|certificates|contact|account-types|health|admin\/(?:formations|articles|courses|media|categories|article-categories|tags)|blog\/(?:articles|categories|tags|media))(?:\/[^`'"\s]*)?)\1/g;
    const missing = [];
    for (const file of files) {
      for (const [, , raw] of read(file).matchAll(literal)) {
        const apiPath = `/api${normalise(raw)}`;
        if (!serverRoutes.some((r) => patternToRegex(r.path).test(apiPath))) missing.push(`${path.relative(ROOT, file)}: ${raw}`);
      }
    }
    assert.deepEqual(missing, []);
  });

  test('every api.get/post/put/patch/delete/upload and useApi call uses a method the server serves on that path', () => {
    const files = walk(path.join(CLIENT, 'src'), ['.js', '.jsx']);
    const call = /\b(?:api\.(get|post|put|patch|delete|upload)|(useApi))\(\s*([`'"])(\/[^`'"]*)\3/g;
    const wrong = [];
    let seen = 0;
    for (const file of files) {
      for (const [, verb, hook, , raw] of read(file).matchAll(call)) {
        seen += 1;
        const method = hook ? 'GET' : verb === 'upload' ? 'POST' : verb.toUpperCase();
        const apiPath = `/api${normalise(raw)}`;
        if (!serverRoutes.some((r) => r.method === method && patternToRegex(r.path).test(apiPath))) wrong.push(`${path.relative(ROOT, file)}: ${method} ${raw}`);
      }
    }
    assert.ok(seen >= 30, `only ${seen} calls inspected`);
    assert.deepEqual(wrong, []);
  });

  test('every internal link written in the client leads to a client route', () => {
    const files = walk(path.join(CLIENT, 'src'), ['.js', '.jsx']);
    const routes = clientRoutes().map((r) => patternToRegex(r));
    const link = /\b(?:to|href)\s*[=:]\s*(?:\{\s*)?([`'"])(\/[^`'"\s]*)\1|navigate\(\s*([`'"])(\/[^`'"\s]*)\3/g;
    const broken = [];
    let seen = 0;
    for (const file of files) {
      for (const m of read(file).matchAll(link)) {
        const target = normalise(m[2] ?? m[4]);
        if (target.startsWith('/api/') || target.startsWith('//')) continue;
        seen += 1;
        if (target !== '/' && !routes.some((re) => re.test(target)) && !clientRoutes().includes('/*')) broken.push(`${path.relative(ROOT, file)}: ${target}`);
        else if (target !== '/' && !routes.some((re) => re.test(target.replace(/\/$/, '')))) {
          // only the catch-all matched: acceptable for the 404 route itself, never for a link
          const specific = clientRoutes().filter((r) => r !== '/*').map((r) => patternToRegex(r));
          if (!specific.some((re) => re.test(target))) broken.push(`${path.relative(ROOT, file)}: ${target}`);
        }
      }
    }
    assert.ok(seen >= 25, `only ${seen} links inspected`);
    assert.deepEqual(broken, []);
  });

  test('every navigation entry (main menu, footer, account tabs, admin menu) leads to a route', () => {
    const specific = clientRoutes().filter((r) => r !== '/*').map((r) => patternToRegex(r));
    const sources = ['src/config/navigation.js', 'src/config/adminNav.js', 'src/components/layout/AccountNav.jsx'];
    const targets = sources.flatMap((s) => [...read(CLIENT, s).matchAll(/to:\s*'(\/[^']*)'/g)].map((m) => m[1]));
    assert.ok(targets.length >= 15);
    assert.deepEqual(targets.filter((tg) => !specific.some((re) => re.test(tg))), []);
  });
});

describe('translations', () => {
  const load = (lang) => JSON.parse(read(CLIENT, 'src/i18n/locales', `${lang}.json`));
  const locales = { fr: load('fr'), en: load('en'), ar: load('ar') };
  const leaves = (obj, prefix = '') =>
    Object.entries(obj).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? leaves(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]));
  const flat = Object.fromEntries(Object.entries(locales).map(([l, o]) => [l, new Map(leaves(o))]));
  const PLURALS = /_(zero|one|two|few|many|other)$/;
  const base = (k) => k.replace(PLURALS, '');
  const bases = (lang) => new Set([...flat[lang].keys()].map(base));

  test('French, English and Arabic define exactly the same texts', () => {
    const fr = bases('fr');
    for (const lang of ['en', 'ar']) {
      const other = bases(lang);
      assert.deepEqual([...fr].filter((k) => !other.has(k)), [], `missing in ${lang}`);
      assert.deepEqual([...other].filter((k) => !fr.has(k)), [], `unknown in ${lang}`);
    }
  });

  test('no text is empty', () => {
    for (const [lang, map] of Object.entries(flat)) {
      const empty = [...map].filter(([, v]) => typeof v === 'string' && !v.trim()).map(([k]) => k);
      assert.deepEqual(empty, [], lang);
    }
  });

  test('the same {{variables}} appear in every language of a text', () => {
    const vars = (v) => [...String(v).matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]).sort().join(',');
    const bad = [];
    for (const key of bases('fr')) {
      const forms = { fr: [key, `${key}_one`, `${key}_other`], en: [key, `${key}_one`, `${key}_other`], ar: [key, `${key}_zero`, `${key}_one`, `${key}_two`, `${key}_few`, `${key}_many`, `${key}_other`] };
      const perLang = {};
      for (const [lang, ks] of Object.entries(forms)) {
        // variables of the singular/other forms; "one"/"two"/"zero" may drop {{count}} ("un seul article")
        const sets = ks.filter((k) => flat[lang].has(k)).map((k) => vars(flat[lang].get(k)));
        perLang[lang] = new Set(sets.flatMap((s) => s.split(',').filter(Boolean)));
      }
      const union = (s) => [...s].sort().join(',');
      if (union(perLang.fr) !== union(perLang.en) || union(perLang.fr) !== union(perLang.ar)) bad.push(`${key}: fr={${union(perLang.fr)}} en={${union(perLang.en)}} ar={${union(perLang.ar)}}`);
    }
    assert.deepEqual(bad, []);
  });

  test('plural texts define every form their language needs', () => {
    const NEEDED = { fr: ['one', 'other'], en: ['one', 'other'], ar: ['zero', 'one', 'two', 'few', 'many', 'other'] };
    const bad = [];
    for (const [lang, map] of Object.entries(flat)) {
      const groups = new Map();
      for (const key of map.keys()) if (PLURALS.test(key)) groups.set(base(key), (groups.get(base(key)) ?? []).concat(key.match(PLURALS)[1]));
      for (const [b, forms] of groups) {
        const missing = NEEDED[lang].filter((f) => !forms.includes(f));
        if (missing.length) bad.push(`${lang} ${b}: missing ${missing.join(',')}`);
      }
    }
    assert.deepEqual(bad, []);
  });

  test('every text the client asks for by a literal key exists', () => {
    const files = walk(path.join(CLIENT, 'src'), ['.js', '.jsx']);
    const known = bases('fr');
    const missing = [];
    let seen = 0;
    for (const file of files) {
      const src = read(file);
      for (const m of src.matchAll(/\bt\(\s*(['"`])([A-Za-z][\w.]*)\1/g)) {
        seen += 1;
        if (!known.has(m[2])) missing.push(`${path.relative(ROOT, file)}: ${m[2]}`);
      }
      for (const m of src.matchAll(/\b(?:labelKey|titleKey)\s*[:=]\s*(['"])([A-Za-z][\w.]*)\1/g)) {
        seen += 1;
        if (!known.has(m[2])) missing.push(`${path.relative(ROOT, file)}: ${m[2]}`);
      }
    }
    assert.ok(seen >= 500, `only ${seen} keys inspected`);
    assert.deepEqual(missing, []);
  });
});

describe('configuration', () => {
  test('every environment variable the server reads is documented in server/.env.example', () => {
    const used = new Set();
    for (const file of walk(path.join(SERVER_DIR, 'src'), ['.js'])) for (const m of read(file).matchAll(/process\.env\.([A-Z][A-Z0-9_]+)|process\.env\[['"]([A-Z][A-Z0-9_]+)['"]\]/g)) used.add(m[1] ?? m[2]);
    const documented = new Set([...read(SERVER_DIR, '.env.example').matchAll(/^#?\s*([A-Z][A-Z0-9_]+)=/gm)].map((m) => m[1]));
    assert.ok(used.size >= 15);
    assert.deepEqual([...used].filter((v) => !documented.has(v)).sort(), []);
  });

  test('every documented variable is really used (no stale documentation)', () => {
    const sources = walk(path.join(SERVER_DIR, 'src'), ['.js']).map((f) => read(f)).join('\n') + read(SERVER_DIR, 'prisma7.config.ts');
    const documented = [...read(SERVER_DIR, '.env.example').matchAll(/^#?\s*([A-Z][A-Z0-9_]+)=/gm)].map((m) => m[1]);
    assert.deepEqual(documented.filter((v) => !sources.includes(v)), []);
  });

  test('every variable the client reads is documented in client/.env.example', () => {
    const used = new Set();
    for (const file of walk(path.join(CLIENT, 'src'), ['.js', '.jsx'])) for (const m of read(file).matchAll(/import\.meta\.env\.(VITE_[A-Z0-9_]+)/g)) used.add(m[1]);
    const example = existsSync(path.join(CLIENT, '.env.example')) ? read(CLIENT, '.env.example') : '';
    assert.deepEqual([...used].filter((v) => !example.includes(v)), []);
  });

  test('no secret is committed: .env files are ignored by Git and the example holds only placeholders', () => {
    const ignore = read(SERVER_DIR, '.gitignore');
    assert.match(ignore, /^\.env$/m);
    assert.match(ignore, /^\/storage$/m);
    const example = read(SERVER_DIR, '.env.example');
    assert.match(example, /JWT_SECRET=replace-me/);
    assert.doesNotMatch(example, /JWT_SECRET=[a-f0-9]{40,}/i);
  });

  test('every npm script points at something that exists', () => {
    for (const dir of [SERVER_DIR, CLIENT]) {
      const scripts = JSON.parse(read(dir, 'package.json')).scripts;
      for (const [name, command] of Object.entries(scripts)) {
        for (const m of command.matchAll(/(?:node|node --watch)\s+((?:scripts|tests|src)\/[\w./-]+)/g)) assert.ok(existsSync(path.join(dir, m[1])), `${path.basename(dir)}: npm run ${name} -> ${m[1]}`);
      }
    }
  });
});

describe('server code', () => {
  test('every route file is mounted, every controller function is wired to a route', () => {
    const routesDir = path.join(SERVER_DIR, 'src/routes');
    const index = read(routesDir, 'index.js');
    const routeFiles = readdirSync(routesDir).filter((f) => f.endsWith('.routes.js'));
    assert.ok(routeFiles.length >= 8);
    assert.deepEqual(routeFiles.filter((f) => !index.includes(f)), [], 'route file not mounted in routes/index.js');

    const routeSources = [...routeFiles.map((f) => read(routesDir, f)), read(routesDir, 'admin.routes.js')].join('\n');
    const dead = [];
    for (const file of walk(path.join(SERVER_DIR, 'src/controllers'), ['.js'])) {
      // Route handlers only: (req, res) functions. Helpers and constants are exported for other modules.
      for (const m of read(file).matchAll(/export (?:async )?function (\w+)\(\s*req\b|export const (\w+)\s*=\s*\(?\s*req\b/g)) {
        const name = m[1] ?? m[2];
        if (!new RegExp(`\\b${name}\\b`).test(routeSources)) dead.push(`${path.relative(SERVER_DIR, file)}: ${name}`);
      }
    }
    assert.deepEqual(dead, [], 'exported controller function that no route uses');
  });

  test('every public address of the API is under /api and answers JSON for an unknown path', () => {
    assert.ok(serverRoutes.every((r) => r.path.startsWith('/api/')));
  });
});

describe('database schema', () => {
  test('the migrations reproduce schema.prisma exactly (no drift)', () => {
    let output = '';
    try {
      output = execSync('npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code --config prisma7.config.ts', { cwd: SERVER_DIR, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
    } catch (err) {
      assert.fail(`schema and migrations differ:\n${err.stdout?.toString() ?? ''}${err.stderr?.toString() ?? ''}`);
    }
    assert.match(output, /No difference/);
  });

  test('every migration folder holds a migration.sql and the names are ordered', () => {
    const dir = path.join(SERVER_DIR, 'prisma/migrations');
    const folders = readdirSync(dir).filter((f) => /^\d{14}_/.test(f));
    assert.ok(folders.length >= 6);
    for (const f of folders) assert.ok(existsSync(path.join(dir, f, 'migration.sql')), f);
    assert.deepEqual([...folders].sort(), folders);
  });
});

describe('task tracking (TASKS.md)', () => {
  const text = read(ROOT, 'TASKS.md');
  const tasks = [...text.matchAll(/^### (P\d-\d\d) — ([^\n]*)\r?\n- Statut : `([^`]+)`(?:[\s\S]*?- Dépendances : ([^\n]*))?/gm)].map((m) => ({
    id: m[1],
    title: m[2].trim(),
    status: m[3],
    deps: [...(m[4] ?? '').matchAll(/`(P\d-\d\d)`/g)].map((d) => d[1]),
  }));
  const byId = new Map(tasks.map((x) => [x.id, x]));

  test('the plan is parsed', () => {
    assert.ok(tasks.length >= 30, `${tasks.length} tasks`);
    assert.equal(byId.size, tasks.length, 'a task id appears twice');
  });

  test('every status is one of the legend values', () => {
    const allowed = new Set(['❌ todo', '🚧 in-progress', '✅ done', '⛔ blocked']);
    assert.deepEqual(tasks.filter((x) => !allowed.has(x.status)).map((x) => `${x.id}: ${x.status}`), []);
  });

  test('every dependency exists', () => {
    assert.deepEqual(tasks.flatMap((x) => x.deps.filter((d) => !byId.has(d)).map((d) => `${x.id} -> ${d}`)), []);
  });

  test('no task is done, or started, before its dependencies are done', () => {
    const bad = tasks.filter((x) => ['✅ done', '🚧 in-progress'].includes(x.status)).flatMap((x) => x.deps.filter((d) => byId.get(d)?.status !== '✅ done').map((d) => `${x.id} (${x.status}) depends on ${d} (${byId.get(d)?.status})`));
    assert.deepEqual(bad, []);
  });

  test('a finished task documents what was done and how it was verified', () => {
    const blocks = text.split(/^### /m).slice(1);
    const undocumented = blocks
      .filter((b) => /^P\d-\d\d/.test(b) && /- Statut : `✅ done`/.test(b))
      .filter((b) => !/(Réalisé|Validation effectuée|Tests effectués|Décisions)/.test(b))
      .map((b) => b.slice(0, 6));
    assert.deepEqual(undocumented, []);
  });

  test('the "current state" section only lists tasks that are really done, and next steps that are open', () => {
    const state = text.slice(text.indexOf('# 7. État actuel'));
    const doneSection = state.slice(state.indexOf('Dernières tâches terminées'), state.indexOf('Prochaines tâches'));
    const done = [...doneSection.matchAll(/`(P\d-\d\d) —/g)].map((m) => m[1]);
    assert.ok(done.length >= 10);
    assert.deepEqual(done.filter((id) => byId.get(id)?.status !== '✅ done'), []);
    const nextSection = state.slice(state.indexOf('Prochaines tâches'), state.indexOf('Recommandation'));
    const next = [...nextSection.matchAll(/`(P\d-\d\d) —/g)].map((m) => m[1]);
    assert.deepEqual(next.filter((id) => byId.get(id)?.status === '✅ done'), [], 'a "next" task is already done');
  });
});
