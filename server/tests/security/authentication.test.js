import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { boot } from '../helpers/server.js';

// Sessions: what the server accepts as proof of identity, and what it refuses.

let t;
let learner;
let admin;
before(async () => {
  t = await boot();
  await t.reset();
  learner = await t.user();
  admin = await t.admin();
});
after(() => t.close());

const secret = () => process.env.JWT_SECRET;
const me = (opts) => t.request('GET', '/auth/me', opts);
const adminList = (opts) => t.request('GET', '/admin/formations', opts);

describe('forged or invalid session values are refused (401)', () => {
  test('wrong secret, expired, unsigned ("alg: none"), other algorithm, tampered payload, garbage', async () => {
    const good = t.signSession(admin.id);
    const [h, , s] = good.split('.');
    const forged = {
      'signed with another secret': jwt.sign({}, 'x'.repeat(48), { subject: admin.id }),
      expired: jwt.sign({}, secret(), { subject: admin.id, expiresIn: -60 }),
      'alg none': `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: admin.id })).toString('base64url')}.`,
      'HS512': jwt.sign({}, secret(), { subject: admin.id, algorithm: 'HS512' }),
      'payload swapped for the admin id': `${h}.${Buffer.from(JSON.stringify({ sub: admin.id, iat: 1 })).toString('base64url')}.${s}`,
      'signature removed': `${good.split('.').slice(0, 2).join('.')}.`,
      'not a token': 'hello',
      'JSON in the cookie': '{"sub":"x"}',
      empty: '',
    };
    for (const [label, token] of Object.entries(forged)) {
      assert.equal((await adminList({ token })).status, 401, label);
      assert.equal((await me({ token })).status, 401, label);
    }
  });

  test('a genuine token whose account does not exist (or no longer exists) is refused', async () => {
    assert.equal((await me({ token: t.signSession('00000000-0000-4000-8000-000000000000') })).status, 401);
    const gone = await t.user();
    const token = t.signSession(gone.id);
    assert.equal((await me({ token })).status, 200);
    await t.prisma.user.delete({ where: { id: gone.id } });
    assert.equal((await me({ token })).status, 401);
  });

  test('the identity is read ONLY from the session cookie (not header, query string or body)', async () => {
    const token = t.signSession(admin.id);
    assert.equal((await adminList({ headers: { Authorization: `Bearer ${token}` } })).status, 401);
    assert.equal((await adminList({ headers: { 'X-Session': token, 'X-User-Id': admin.id, 'X-Forwarded-User': admin.id } })).status, 401);
    assert.equal((await t.request('GET', `/admin/formations?session=${token}&token=${token}`)).status, 401);
    assert.equal((await t.request('GET', '/admin/formations', { headers: { Cookie: `Session=${token}; sid=${token}; token=${token}` } })).status, 401, 'other cookie names / cases');
  });

  test('two "session" cookies: a forged one cannot shadow or upgrade the real one', async () => {
    const real = t.signSession(learner.id);
    const forged = jwt.sign({}, 'x'.repeat(48), { subject: admin.id });
    for (const cookie of [`session=${forged}; session=${real}`, `session=${real}; session=${forged}`]) {
      const res = await adminList({ headers: { Cookie: cookie } });
      assert.notEqual(res.status, 200, cookie.slice(0, 30));
    }
  });
});

describe('sessions follow the database, not the token', () => {
  test('a demoted administrator loses access with the token they already hold', async () => {
    const boss = await t.admin();
    const token = t.signSession(boss.id);
    assert.equal((await adminList({ token })).status, 200);
    await t.prisma.user.update({ where: { id: boss.id }, data: { role: 'user' } });
    assert.equal((await adminList({ token })).status, 403);
  });

  test('a token carries no role claim that could be edited', () => {
    const claims = jwt.decode(t.signSession(admin.id));
    assert.deepEqual(Object.keys(claims).sort(), ['exp', 'iat', 'sub']);
  });

  test('the token expires (the lifetime is bounded)', () => {
    const { exp, iat } = jwt.decode(t.signSession(admin.id));
    assert.ok(exp - iat <= 60 * 60 * 24 * 30, 'a session never lasts more than 30 days');
  });
});

describe('privilege escalation attempts', () => {
  const register = (extra = {}) => t.request('POST', '/auth/register', { json: { name: 'Pirate', email: `${t.unique('p')}@example.com`, password: 'motdepasse-long', accountType: 'pme', ...extra } });

  test('role and access level cannot be chosen at registration, in any spelling', async () => {
    const before = await t.prisma.user.count();
    for (const extra of [{ role: 'admin' }, { Role: 'admin' }, { accessLevel: 'premium' }, { isAdmin: true }, { roles: ['admin'] }, { user: { role: 'admin' } }, { __proto__: { role: 'admin' } }, { constructor: { prototype: { role: 'admin' } } }]) {
      const res = await register(extra);
      assert.ok([400, 201].includes(res.status), JSON.stringify(extra));
      if (res.status === 201) {
        const row = await t.prisma.user.findUnique({ where: { id: res.body.user.id } });
        assert.deepEqual([row.role, row.accessLevel], ['user', 'standard'], 'accepted but harmless');
      }
    }
    assert.equal(await t.prisma.user.count({ where: { role: 'admin', email: { startsWith: 'p-' } } }), 0);
    assert.ok(before >= 0);
  });

  test('the profile route can change nothing but the account type', async () => {
    const u = await t.user();
    for (const json of [{ role: 'admin' }, { accessLevel: 'premium' }, { accountType: 'pme', role: 'admin' }, { id: admin.id }, { email: 'x@y.co' }]) {
      assert.equal((await t.request('PATCH', '/auth/me', { user: u, json })).status, 400, JSON.stringify(json));
    }
    const row = await t.prisma.user.findUnique({ where: { id: u.id } });
    assert.deepEqual([row.role, row.accessLevel], ['user', 'standard']);
  });

  test('the answer never contains the password hash, for any account', async () => {
    const res = await me({ user: admin });
    assert.doesNotMatch(res.text, /passwordHash|\$2[aby]\$/);
  });
});

describe('login does not reveal which accounts exist', () => {
  test('an unknown e-mail costs as much time as a wrong password (a hash is always computed)', async () => {
    const email = `${t.unique('timing')}@example.com`;
    await t.request('POST', '/auth/register', { json: { name: 'T', email, password: 'le-bon-mot-de-passe', accountType: 'pme' } });
    const time = async (json) => {
      const start = process.hrtime.bigint();
      const res = await t.request('POST', '/auth/login', { json });
      return { ms: Number(process.hrtime.bigint() - start) / 1e6, status: res.status };
    };
    const known = await time({ email, password: 'un-mauvais-mot-de-passe' });
    const unknown = await time({ email: `${t.unique('nobody')}@example.com`, password: 'un-mauvais-mot-de-passe' });
    assert.equal(known.status, 401);
    assert.equal(unknown.status, 401);
    assert.ok(unknown.ms > 50, `unknown e-mail answered in ${unknown.ms.toFixed(0)} ms: no hash was computed`);
    assert.ok(unknown.ms > known.ms * 0.4, `timing gap: ${unknown.ms.toFixed(0)} vs ${known.ms.toFixed(0)} ms`);
  });

  test('registering an e-mail that exists answers 409 (a known trade-off), never leaks the other account', async () => {
    const email = `${t.unique('dup')}@example.com`;
    const body = { name: 'D', email, password: 'motdepasse-long', accountType: 'pme' };
    await t.request('POST', '/auth/register', { json: body });
    const again = await t.request('POST', '/auth/register', { json: { ...body, name: 'Autre' } });
    assert.equal(again.status, 409);
    assert.doesNotMatch(again.text, /passwordHash|"id"|"name"/);
  });
});
