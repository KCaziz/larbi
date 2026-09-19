import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Who may call what — decided by the BACKEND. The audit walks EVERY route that
// is really registered in Express, so a route added later is checked automatically:
// it must either be declared public here (on purpose) or demand a session.

// Public ON PURPOSE. Anything else must answer 401 to an anonymous request.
const PUBLIC = new Set([
  'GET /api/health',
  'POST /api/auth/register',
  'POST /api/auth/login',
  'POST /api/auth/logout',
  'POST /api/contact',
  'GET /api/account-types',
  'GET /api/certificates/:number',
  'GET /api/blog/articles',
  'GET /api/blog/articles/:slug',
  'GET /api/blog/articles/:slug/cover',
  'GET /api/blog/categories',
  'GET /api/blog/tags',
  'GET /api/blog/media/:id',
]);

const UUID0 = '00000000-0000-4000-8000-000000000000';
const sample = (p) => p.replace(/:number/g, 'LARBI-AAAA-BBBB-CCCC').replace(/:slug/g, 'x').replace(/:(id|courseId)/g, UUID0);

function walk(stack, prefix, out) {
  for (const layer of stack) {
    if (layer.route) {
      for (const method of Object.keys(layer.route.methods)) out.push({ method: method.toUpperCase(), path: (prefix + layer.route.path).replace(/(.)\/$/, '$1') });
    } else if (layer.name === 'router' && layer.handle?.stack) {
      const src = layer.regexp.source;
      const mount = src === '^\\/?(?=\\/|$)' ? '' : src.replace('^\\/', '/').replace('\\/?(?=\\/|$)', '').replace(/\\\//g, '/');
      walk(layer.handle.stack, prefix + mount, out);
    }
  }
}

let t;
let routes;
let learner;
let admin;
before(async () => {
  t = await boot();
  await t.reset();
  learner = await t.user();
  admin = await t.admin();
  const { createApp } = await import('../../src/app.js');
  routes = [];
  walk(createApp()._router.stack, '', routes);
});
after(() => t.close());

const hit = (route, user) => {
  const isBodyMethod = !['GET', 'HEAD'].includes(route.method);
  return t.request(route.method, sample(route.path).replace(/^\/api/, ''), { user, json: isBodyMethod ? {} : undefined });
};

describe('route audit', () => {
  test('the walk really finds the application routes', () => {
    assert.ok(routes.length >= 45, `only ${routes.length} routes found`);
    const declared = [...PUBLIC].filter((k) => !routes.some((r) => `${r.method} ${r.path}` === k));
    assert.deepEqual(declared, [], 'the public list mentions routes that do not exist');
  });

  test('every route that is not declared public answers 401 to an anonymous request', async () => {
    const offenders = [];
    for (const route of routes) {
      if (PUBLIC.has(`${route.method} ${route.path}`)) continue;
      const res = await hit(route);
      if (res.status !== 401) offenders.push(`${route.method} ${route.path} -> ${res.status}`);
    }
    assert.deepEqual(offenders, []);
  });

  test('every public route really is reachable without a session (no accidental lock-out)', async () => {
    for (const route of routes.filter((r) => PUBLIC.has(`${r.method} ${r.path}`))) {
      const res = await hit(route);
      assert.ok(![401, 403].includes(res.status), `${route.method} ${route.path} -> ${res.status}`);
    }
  });

  test('every /api/admin route answers 403 to a standard account and works for an administrator', async () => {
    const adminRoutes = routes.filter((r) => r.path.startsWith('/api/admin'));
    assert.ok(adminRoutes.length >= 25, `only ${adminRoutes.length} admin routes found`);
    const offenders = [];
    for (const route of adminRoutes) {
      const asLearner = await hit(route, learner);
      if (asLearner.status !== 403) offenders.push(`${route.method} ${route.path}: learner -> ${asLearner.status}`);
      const asAdmin = await hit(route, admin);
      if ([401, 403].includes(asAdmin.status)) offenders.push(`${route.method} ${route.path}: admin -> ${asAdmin.status}`);
    }
    assert.deepEqual(offenders, []);
  });

  test('the administration prefix is never reachable through another spelling', async () => {
    for (const p of ['/ADMIN/formations', '/admin/../admin/formations/', '//admin/formations', '/admin%2Fformations', '/admin/formations%00']) {
      const res = await t.request('GET', p, { user: learner });
      assert.ok([401, 403, 404].includes(res.status), `${p} -> ${res.status}`);
      assert.doesNotMatch(res.text, /"formations"/, p);
    }
  });
});

describe('roles and levels', () => {
  test('an administrator is NOT automatically premium: the two are independent', async () => {
    const f = await t.formation({ requiredAccessLevel: 'premium', title: 'Réservée' });
    const res = await t.request('POST', `/learn/formations/${f.slug}/enroll`, { user: admin });
    assert.equal(res.status, 403, 'role admin does not grant premium content');
  });

  test('a premium learner is NOT an administrator', async () => {
    const premium = await t.user({ accessLevel: 'premium' });
    assert.equal((await t.request('GET', '/admin/formations', { user: premium })).status, 403);
  });

  test('a role change applies at once, on the SAME session', async () => {
    const u = await t.user();
    assert.equal((await t.request('GET', '/admin/formations', { user: u })).status, 403);
    await t.prisma.user.update({ where: { id: u.id }, data: { role: 'admin' } });
    assert.equal((await t.request('GET', '/admin/formations', { user: u })).status, 200);
    await t.prisma.user.update({ where: { id: u.id }, data: { role: 'user' } });
    assert.equal((await t.request('GET', '/admin/formations', { user: u })).status, 403);
  });

  test('a learner cannot act on another learner\'s data through the learner API', async () => {
    const a = await t.user();
    const b = await t.user();
    const f = await t.formation({ courses: [{ title: 'A' }] });
    await t.request('POST', `/learn/formations/${f.slug}/enroll`, { user: a });
    await t.request('GET', `/learn/formations/${f.slug}/courses/${f.courses[0].id}`, { user: a });
    // b is not enrolled: every write and read on the lesson is refused
    for (const [method, path] of [['GET', `/learn/formations/${f.slug}/courses/${f.courses[0].id}`], ['PUT', `/learn/formations/${f.slug}/courses/${f.courses[0].id}/completion`], ['DELETE', `/learn/formations/${f.slug}/courses/${f.courses[0].id}/completion`], ['POST', `/learn/formations/${f.slug}/certificate`]]) {
      const res = await t.request(method, path, { user: b });
      assert.ok([403, 409].includes(res.status), `${method} ${path} -> ${res.status}`);
    }
    assert.equal(await t.prisma.courseProgress.count({ where: { enrollment: { userId: b.id } } }), 0);
    // the identity is never taken from the request: extra "userId" parameters change nothing
    const res = await t.request('PUT', `/learn/formations/${f.slug}/courses/${f.courses[0].id}/completion?userId=${a.id}`, { user: b, json: { userId: a.id } });
    assert.equal(res.status, 403);
  });
});
