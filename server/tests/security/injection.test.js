import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { PNG, fileForm } from '../helpers/fixtures.js';
import { boot } from '../helpers/server.js';

// Hostile input: stored XSS, SQL / object injection, prototype pollution,
// abnormal bodies. The server must neither run it, store it dangerously, nor crash.

let t;
let admin;
before(async () => {
  t = await boot();
  await t.reset();
  admin = await t.admin();
});
after(() => t.close());

const FORBIDDEN = /<script|<iframe|<img|<svg|<style|<object|<embed|<form|<input|<link|<meta|<base|\son\w+\s*=|javascript:|vbscript:|data:text\/html/i;
const XSS = [
  '<script>alert(1)</script>',
  '<img src=x onerror=alert(1)>',
  '<svg/onload=alert(1)>',
  '<a href="javascript:alert(1)">clic</a>',
  '<a href="&#x6A;avascript:alert(1)">clic</a>',
  '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
  '<p style="x:expression(alert(1))">t</p>',
  '<form action="//evil"><input name=p></form>',
  '<math><mi xlink:href="javascript:alert(1)">x</mi></math>',
  '<body onload=alert(1)>',
  '<details open ontoggle=alert(1)>',
  '"><script>alert(1)</script>',
  '\'-alert(1)-\'',
];

describe('stored XSS: rich text', () => {
  test('an article body written with every payload is served clean by the PUBLIC page', async () => {
    const created = (await t.request('POST', '/admin/articles', { user: admin, json: { title: 'XSS' } })).body.article;
    const body = `<p>Texte normal</p>${XSS.join('')}`;
    const saved = await t.request('PATCH', `/admin/articles/${created.id}`, { user: admin, json: { body, excerpt: 'Résumé' } });
    assert.equal(saved.status, 200);
    assert.doesNotMatch(saved.body.article.body, FORBIDDEN);
    await t.request('POST', `/admin/articles/${created.id}/cover`, { user: admin, form: fileForm(PNG) });
    await t.request('POST', `/admin/articles/${created.id}/publish`, { user: admin });
    const slug = (await t.prisma.article.findUnique({ where: { id: created.id } })).slug;
    const page = await t.request('GET', `/blog/articles/${slug}`);
    assert.equal(page.status, 200);
    assert.doesNotMatch(page.body.article.body, FORBIDDEN);
    assert.match(page.body.article.body, /Texte normal/);
  });

  test('a course body is served clean to the enrolled learner', async () => {
    const f = await t.formation({ courses: [{ title: 'Piégé' }] });
    const course = f.courses[0];
    await t.request('PATCH', `/admin/courses/${course.id}`, { user: admin, json: { body: `<p>ok</p>${XSS.join('')}` } });
    const learner = await t.user();
    await t.request('POST', `/learn/formations/${f.slug}/enroll`, { user: learner });
    const res = await t.request('GET', `/learn/formations/${f.slug}/courses/${course.id}`, { user: learner });
    assert.equal(res.status, 200);
    assert.doesNotMatch(res.body.course.body, FORBIDDEN);
  });

  test('the sanitiser is applied on EVERY write path (a second edit cannot re-introduce a payload)', async () => {
    const created = (await t.request('POST', '/admin/articles', { user: admin, json: { title: 'Deux fois' } })).body.article;
    await t.request('PATCH', `/admin/articles/${created.id}`, { user: admin, json: { body: '<p>propre</p>' } });
    const again = await t.request('PATCH', `/admin/articles/${created.id}`, { user: admin, json: { body: '<p>propre</p><script>alert(1)</script>' } });
    assert.doesNotMatch(again.body.article.body, /script/);
    assert.doesNotMatch((await t.prisma.article.findUnique({ where: { id: created.id } })).body, /script/, 'what is STORED is clean');
  });
});

describe('plain text fields are returned as data, never as markup', () => {
  test('titles and summaries keep their characters but are JSON strings served as application/json + nosniff', async () => {
    const payload = '<img src=x onerror=alert(1)>"\'&';
    const created = (await t.request('POST', '/admin/articles', { user: admin, json: { title: payload } })).body.article;
    const res = await t.request('GET', `/admin/articles/${created.id}`, { user: admin });
    assert.equal(res.body.article.title, payload, 'stored verbatim: the interface escapes it when displaying');
    assert.match(res.headers.get('content-type'), /^application\/json/);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  });

  test('every JSON response declares application/json (never HTML)', async () => {
    for (const path of ['/health', '/blog/articles', '/blog/categories', '/nope', '/blog/articles/inexistant']) {
      const res = await t.request('GET', path);
      assert.match(res.headers.get('content-type'), /^application\/json/, path);
    }
  });
});

describe('SQL injection', () => {
  const PAYLOADS = ["' OR '1'='1", "'; DROP TABLE users; --", "1; SELECT pg_sleep(5)--", "\" OR \"\"=\"", "' UNION SELECT passwordHash FROM users --", '%', '_', '\\', '$1', '${jndi:ldap://x}', '{{7*7}}', '`id`'];

  test('search, filters and slugs treat payloads as plain text', async () => {
    await t.article({ title: 'Article témoin' });
    const users = await t.prisma.user.count();
    for (const p of PAYLOADS) {
      const q = encodeURIComponent(p);
      for (const path of [`/blog/articles?query=${q}`, `/blog/articles/${q}`, `/blog/articles?tag=${q}`, `/blog/articles?category=${q}`, `/blog/media/${q}`]) {
        const res = await t.request('GET', path);
        assert.ok(res.status < 500, `${path} -> ${res.status}`);
        assert.doesNotMatch(res.text, /syntax error|pg_|prisma|SELECT |relation ".*" does not exist|sql/i, path);
      }
    }
    assert.equal(await t.prisma.user.count(), users, 'no table was touched');
    assert.ok(await t.prisma.article.count() >= 1);
  });

  test('a payload in a search term never widens the result', async () => {
    const all = (await t.request('GET', '/blog/articles?limit=24')).body.pagination.total;
    for (const p of ["' OR '1'='1", '%', '_', "') OR 1=1 --"]) {
      const res = await t.request('GET', `/blog/articles?query=${encodeURIComponent(p)}`);
      assert.ok(res.body.pagination.total < all || all === 0, `"${p}" matched everything`);
    }
  });

  test('login and registration treat payloads as plain data', async () => {
    for (const p of ["admin'--", "' OR 1=1 --", "x@y.co' OR 'a'='a"]) {
      const login = await t.request('POST', '/auth/login', { json: { email: p, password: p } });
      assert.equal(login.status, 400, 'an e-mail that is not an e-mail is refused before the database');
      const login2 = await t.request('POST', '/auth/login', { json: { email: 'valide@example.com', password: p } });
      assert.equal(login2.status, 401);
    }
    const reg = await t.request('POST', '/auth/register', { json: { name: "Robert'); DROP TABLE users;--", email: `${t.unique('r')}@example.com`, password: 'motdepasse-long', accountType: 'pme' } });
    assert.equal(reg.status, 201, 'a quote in a name is legitimate');
    assert.equal((await t.prisma.user.findUnique({ where: { id: reg.body.user.id } })).name, "Robert'); DROP TABLE users;--");
    assert.ok(await t.prisma.user.count() > 0);
  });

  test('tags and categories with SQL characters are stored as text', async () => {
    const a = (await t.request('POST', '/admin/articles', { user: admin, json: { title: 'SQL' } })).body.article;
    const res = await t.request('PATCH', `/admin/articles/${a.id}`, { user: admin, json: { tags: ["'; DROP TABLE tags;--", '"quoted"'] } });
    assert.equal(res.status, 200);
    assert.equal(res.body.article.tags.length, 2);
    assert.ok(await t.prisma.tag.count() >= 2);
  });
});

describe('object injection and prototype pollution', () => {
  test('operators and objects where a string is expected are refused (400)', async () => {
    for (const json of [{ email: { $ne: null }, password: { $ne: null } }, { email: { $gt: '' }, password: 'x' }, { email: ['a@b.co'], password: 'x' }, { email: 'a@b.co', password: { toString: 'x' } }]) {
      assert.equal((await t.request('POST', '/auth/login', { json })).status, 400, JSON.stringify(json));
    }
    for (const json of [{ title: { $ne: 1 } }, { title: ['a'] }, { title: 5 }, { title: null }]) {
      assert.equal((await t.request('POST', '/admin/articles', { user: admin, json })).status, 400, JSON.stringify(json));
    }
  });

  test('"__proto__", "constructor" and "prototype" keys do not pollute Object.prototype', async () => {
    const a = (await t.request('POST', '/admin/articles', { user: admin, json: { title: 'Proto' } })).body.article;
    const bodies = ['{"__proto__":{"polluted":"yes"}}', '{"title":"x","__proto__":{"polluted":"yes"}}', '{"constructor":{"prototype":{"polluted":"yes"}}}', '{"tags":["a"],"__proto__":{"isAdmin":true}}'];
    for (const raw of bodies) {
      const res = await t.request('PATCH', `/admin/articles/${a.id}`, { user: admin, body: raw, headers: { 'Content-Type': 'application/json' } });
      assert.ok(res.status < 500, raw);
    }
    assert.equal(({}).polluted, undefined);
    assert.equal(({}).isAdmin, undefined);
    const login = await t.request('POST', '/auth/login', { body: '{"email":"a@b.co","password":"x","__proto__":{"role":"admin"}}', headers: { 'Content-Type': 'application/json' } });
    assert.ok([400, 401].includes(login.status));
  });
});

describe('abnormal requests', () => {
  test('malformed JSON is a 400 without any internal detail', async () => {
    for (const raw of ['{bad', '', '{"a":', 'null', '[]', '"text"', '{"title":"x"}}']) {
      const res = await t.request('POST', '/admin/articles', { user: admin, body: raw, headers: { 'Content-Type': 'application/json' } });
      assert.ok([400].includes(res.status), `${JSON.stringify(raw)} -> ${res.status}`);
    }
  });

  test('a body of the wrong type is not parsed as JSON', async () => {
    const res = await t.request('POST', '/admin/articles', { user: admin, body: '{"title":"x"}', headers: { 'Content-Type': 'text/plain' } });
    assert.equal(res.status, 400);
    const form = await t.request('POST', '/admin/articles', { user: admin, body: 'title=x', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    assert.equal(form.status, 201, 'a form-encoded title is a normal title');
  });

  test('oversized bodies are refused with 413 (100 kB on public routes)', async () => {
    const res = await t.request('POST', '/contact', { json: { name: 'x', email: 'a@b.co', message: 'x'.repeat(200_000) } });
    assert.equal(res.status, 413);
  });

  test('deeply nested JSON does not crash the server', async () => {
    const deep = `${'{"a":'.repeat(5000)}1${'}'.repeat(5000)}`;
    const res = await t.request('POST', '/contact', { body: deep, headers: { 'Content-Type': 'application/json' } });
    assert.ok(res.status >= 400 && res.status < 500, String(res.status));
    assert.equal((await t.request('GET', '/health')).status, 200, 'still alive');
  });

  test('a NUL character anywhere in the input is a clean 400, never a database error (500)', async () => {
    const a = (await t.request('POST', '/admin/articles', { user: admin, json: { title: 'Nul' } })).body.article;
    const attempts = [
      ['POST', '/admin/articles', { title: 'a b' }, admin],
      ['PATCH', `/admin/articles/${a.id}`, { body: '<p>a b</p>' }, admin],
      ['PATCH', `/admin/articles/${a.id}`, { tags: ['a b'] }, admin],
      ['PATCH', `/admin/articles/${a.id}`, { excerpt: ' ' }, admin],
      ['POST', '/admin/article-categories', { name: 'x ' }, admin],
      ['POST', '/auth/register', { name: 'a b', email: 'nul@example.com', password: 'motdepasse-long', accountType: 'pme' }],
      ['POST', '/auth/login', { email: 'nul@example.com', password: 'a b' }],
      ['POST', '/contact', { name: 'a', email: 'nul@example.com', message: 'hello ' }],
    ];
    for (const [method, path, json, user] of attempts) {
      const res = await t.request(method, path, { user, json });
      assert.equal(res.status, 400, `${method} ${path}`);
    }
    assert.equal((await t.request('GET', '/blog/articles?query=a%00b')).status, 400);
    assert.equal((await t.request('GET', '/blog/articles/a%00b')).status, 404);
    assert.equal(await t.prisma.user.count({ where: { email: 'nul@example.com' } }), 0);
  });

  test('a very long query string is refused, not processed', async () => {
    const res = await t.request('GET', `/blog/articles?query=${'a'.repeat(20_000)}`);
    assert.ok([400, 414, 431].includes(res.status), String(res.status));
  });

  test('method override headers are ignored', async () => {
    const a = (await t.request('POST', '/admin/articles', { user: admin, json: { title: 'Override' } })).body.article;
    const res = await t.request('POST', `/admin/articles/${a.id}`, { user: admin, headers: { 'X-HTTP-Method-Override': 'DELETE' } });
    assert.equal(res.status, 404);
    assert.equal(await t.prisma.article.count({ where: { id: a.id } }), 1);
  });
});

describe('header injection through file names', () => {
  test('a file name with line breaks cannot inject a header when the file is downloaded', async () => {
    const a = (await t.request('POST', '/admin/articles', { user: admin, json: { title: 'Fichier' } })).body.article;
    const up = await t.request('POST', `/admin/articles/${a.id}/media`, { user: admin, form: fileForm(PNG, { name: 'a\r\nX-Injected: 1\r\nSet-Cookie: pwned=1.png' }) });
    assert.equal(up.status, 201);
    assert.doesNotMatch(up.body.media.originalName, /[\r\n]/);
    const file = await t.request('GET', up.body.media.url.replace(/^\/api/, ''), { user: admin });
    assert.equal(file.status, 200);
    assert.equal(file.headers.get('x-injected'), null);
    assert.ok(!file.headers.getSetCookie().some((c) => c.startsWith('pwned')));
  });
});
