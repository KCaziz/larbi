import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { captureConsole } from '../helpers/log.js';
import { boot } from '../helpers/server.js';

// The server as it runs in PRODUCTION: transport headers, CORS, cookies, and —
// above all — what an error reveals (nothing).

let t;
let errors;
before(async () => {
  errors = captureConsole('error');
  t = await boot({ production: true });
  await t.reset();
});
after(async () => {
  errors.restore();
  await t.close();
});

describe('response headers', () => {
  test('security headers are on every kind of response (API, file, error)', async () => {
    const admin = await t.admin();
    const post = await t.article({ status: 'published' });
    const responses = {
      json: await t.request('GET', '/health'),
      notFound: await t.request('GET', '/nope'),
      blog: await t.request('GET', `/blog/articles/${post.slug}`),
      denied: await t.request('GET', '/admin/formations'),
      html: await t.request('GET', '/', { raw: true }),
    };
    assert.ok(admin);
    for (const [label, res] of Object.entries(responses)) {
      assert.equal(res.headers.get('x-content-type-options'), 'nosniff', label);
      assert.equal(res.headers.get('x-frame-options'), 'SAMEORIGIN', label);
      assert.equal(res.headers.get('referrer-policy'), 'no-referrer', label);
      assert.match(res.headers.get('strict-transport-security'), /max-age=\d+/, label);
      assert.equal(res.headers.get('cross-origin-opener-policy'), 'same-origin', label);
      assert.equal(res.headers.get('cross-origin-resource-policy'), 'same-origin', label);
      assert.match(res.headers.get('content-security-policy'), /default-src 'self'/, label);
      assert.equal(res.headers.get('x-powered-by'), null, `${label}: the framework is not advertised`);
      assert.equal(res.headers.get('server'), null, label);
    }
  });

  test('the content security policy forbids inline scripts, plugins and framing', async () => {
    const csp = (await t.request('GET', '/health')).headers.get('content-security-policy');
    assert.match(csp, /script-src 'self'/);
    assert.match(csp, /object-src 'none'/);
    assert.match(csp, /frame-ancestors 'self'/);
    assert.doesNotMatch(csp, /script-src[^;]*unsafe-(inline|eval)/);
  });
});

describe('CORS', () => {
  const preflight = (origin, method = 'POST') =>
    t.request('OPTIONS', '/auth/login', { headers: { Origin: origin, 'Access-Control-Request-Method': method, 'Access-Control-Request-Headers': 'content-type' } });

  test('only the configured site origin is allowed, with credentials', async () => {
    const ok = await preflight('http://localhost:5173');
    assert.equal(ok.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    assert.equal(ok.headers.get('access-control-allow-credentials'), 'true');
    for (const origin of ['http://evil.example', 'http://localhost:5174', 'https://localhost:5173', 'null', 'http://localhost:5173.evil.example']) {
      const res = await preflight(origin);
      assert.equal(res.headers.get('access-control-allow-origin'), null, origin);
    }
  });

  test('a simple cross-site request from a foreign origin gets no readable answer', async () => {
    const res = await t.request('GET', '/blog/articles', { headers: { Origin: 'http://evil.example' } });
    assert.equal(res.headers.get('access-control-allow-origin'), null, 'without this header a browser hands the response to nobody');
  });

  test('the origin is never reflected, and the response varies on it', async () => {
    const res = await t.request('GET', '/blog/articles', { headers: { Origin: 'http://localhost:5173' } });
    assert.match(res.headers.get('vary') ?? '', /Origin/i);
  });
});

describe('session cookie', () => {
  test('is HttpOnly, Secure, SameSite=Lax, site-wide and bounded in time', async () => {
    const res = await t.request('POST', '/auth/register', { json: { name: 'C', email: `${t.unique('c')}@example.com`, password: 'motdepasse-long', accountType: 'pme' } });
    assert.equal(res.status, 201);
    const cookie = res.headers.getSetCookie().find((c) => c.startsWith('session='));
    assert.match(cookie, /; HttpOnly/i);
    assert.match(cookie, /; Secure/i);
    assert.match(cookie, /; SameSite=Lax/i);
    assert.match(cookie, /; Path=\//i);
    assert.match(cookie, /Max-Age=\d+|Expires=/i);
    assert.doesNotMatch(cookie, /Domain=/i, 'not shared with sub-domains');
  });

  test('logging out clears it with the same attributes', async () => {
    const res = await t.request('POST', '/auth/logout');
    const cookie = res.headers.getSetCookie().find((c) => c.startsWith('session='));
    assert.match(cookie, /session=;/);
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /Secure/i);
  });
});

describe('errors reveal nothing', () => {
  test('unknown routes, bad JSON and refused input: JSON answers without stack or internals', async () => {
    const answers = [
      await t.request('GET', '/nope'),
      await t.request('POST', '/auth/login', { body: '{bad', headers: { 'Content-Type': 'application/json' } }),
      await t.request('POST', '/auth/login', { json: { email: 1 } }),
      await t.request('GET', '/blog/articles?page=abc'),
      await t.request('GET', '/blog/articles/..%2F..%2Fetc%2Fpasswd'),
      await t.request('GET', '/admin/formations'),
    ];
    for (const res of answers) {
      assert.ok(res.status >= 400 && res.status < 500, String(res.status));
      assert.deepEqual(Object.keys(res.body.error).filter((k) => !['message', 'details'].includes(k)), [], 'only a message (and safe details)');
      assert.doesNotMatch(res.text, /stack|\bat\s+\S+\s+\(|node_modules|src[\\/]|prisma|C:\\|\.js:\d+/i, res.text.slice(0, 120));
    }
  });

  test('a REAL internal failure (the database breaks) answers a generic 500 and logs the detail server-side only', async () => {
    await t.prisma.$executeRawUnsafe('ALTER TABLE contact_messages RENAME TO contact_messages_broken');
    try {
      const res = await t.request('POST', '/contact', { json: { name: 'A', email: 'a@example.com', message: 'Bonjour' } });
      assert.equal(res.status, 500);
      assert.deepEqual(res.body, { error: { message: 'Internal server error' } });
      assert.doesNotMatch(res.text, /contact_messages|relation|prisma|SQL|does not exist/i);
      assert.ok(errors.lines.some((l) => /contact_messages/.test(l)), 'the real cause is in the server log');
    } finally {
      await t.prisma.$executeRawUnsafe('ALTER TABLE contact_messages_broken RENAME TO contact_messages');
    }
    assert.equal((await t.request('POST', '/contact', { json: { name: 'A', email: 'a@example.com', message: 'Rétabli' } })).status, 201, 'the service recovers');
  });
});

describe('HTTP methods', () => {
  const raw = (method, path) =>
    new Promise((resolve, reject) => {
      const req = http.request(`${t.baseUrl}${path}`, { method }, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      req.on('error', reject);
      req.end();
    });

  test('TRACE and other unexpected methods are not answered as requests', async () => {
    for (const method of ['TRACE', 'PROPFIND', 'PURGE']) {
      const res = await raw(method, '/api/health');
      assert.ok(res.status === 404 || res.status === 405 || res.status === 501 || res.status === 400, `${method} -> ${res.status}`);
      assert.doesNotMatch(res.body, /TRACE \/api/);
    }
  });

  test('a write method on a read-only public route is not routed', async () => {
    for (const path of ['/blog/articles', '/blog/categories', '/certificates/LARBI-AAAA-BBBB-CCCC']) {
      for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
        const res = await t.request(method, path, { json: {} });
        assert.equal(res.status, 404, `${method} ${path}`);
      }
    }
  });
});
