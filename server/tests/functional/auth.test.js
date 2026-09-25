import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// P1-06 — registration, login, session, profile (real API and database).

let t;
before(async () => {
  t = await boot();
  await t.reset();
});
after(() => t.close());

const valid = (over = {}) => ({ name: 'Léa Martin', email: `lea-${Math.random().toString(36).slice(2)}@example.com`, password: 'motdepasse-solide', accountType: 'pme', ...over });
// The value of the "session" cookie a response sets (what a browser would send back).
const sessionOf = (res) => res.headers.getSetCookie().find((c) => c.startsWith('session='))?.split(';')[0].slice('session='.length);
const register = (json) => t.request('POST', '/auth/register', { json });

describe('service', () => {
  test('health answers 200 and reports the database as connected', async () => {
    const res = await t.request('GET', '/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.database, 'connected');
  });

  test('the account types are served by the API (single source of truth)', async () => {
    const res = await t.request('GET', '/account-types');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.map((a) => a.value), ['auto-entrepreneur', 'pme', 'pmi', 'etudiant', 'lyceen', 'salarie']);
  });

  test('an unknown API path answers a JSON 404', async () => {
    const res = await t.request('GET', '/nope');
    assert.equal(res.status, 404);
    assert.ok(res.body.error.message);
  });
});

describe('registration', () => {
  test('creates a plain account and starts a session', async () => {
    const body = valid();
    const res = await register(body);
    assert.equal(res.status, 201);
    assert.deepEqual(Object.keys(res.body.user).sort(), ['accessLevel', 'accountType', 'email', 'id', 'name', 'role']);
    assert.equal(res.body.user.role, 'user');
    assert.equal(res.body.user.accessLevel, 'standard');
    assert.ok(!res.text.includes('passwordHash'));
    const cookie = res.headers.getSetCookie().find((c) => c.startsWith('session='));
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /SameSite=Lax/i);
    const me = await t.request('GET', '/auth/me', { token: sessionOf(res) });
    assert.equal(me.body.user.email, body.email);
  });

  test('the password is stored as a bcrypt hash, never in clear', async () => {
    const body = valid();
    await register(body);
    const row = await t.prisma.user.findUnique({ where: { email: body.email } });
    assert.match(row.passwordHash, /^\$2[aby]\$12\$/);
    assert.ok(!row.passwordHash.includes(body.password));
  });

  test('the e-mail is normalised (case, spaces) and the name trimmed', async () => {
    const res = await register(valid({ email: '  Casse.Mixte@Example.COM ', name: '  Nom  ' }));
    assert.equal(res.status, 201);
    assert.equal(res.body.user.email, 'casse.mixte@example.com');
    assert.equal(res.body.user.name, 'Nom');
  });

  test('the same e-mail cannot register twice (whatever its case)', async () => {
    const body = valid();
    assert.equal((await register(body)).status, 201);
    assert.equal((await register({ ...body, email: body.email.toUpperCase() })).status, 409);
  });

  test('invalid input is refused with 400 and creates nothing', async () => {
    const before = await t.prisma.user.count();
    const bad = [
      { name: '' }, { name: 'x'.repeat(101) }, { email: 'pas-un-email' }, { email: `${'a'.repeat(250)}@x.com` },
      { password: 'court' }, { password: 'x'.repeat(73) }, { accountType: 'admin' }, { accountType: '' },
    ];
    for (const over of bad) assert.equal((await register(valid(over))).status, 400, JSON.stringify(over).slice(0, 50));
    for (const missing of ['name', 'email', 'password', 'accountType']) {
      const body = valid();
      delete body[missing];
      assert.equal((await register(body)).status, 400, `missing ${missing}`);
    }
    assert.equal(await t.prisma.user.count(), before);
  });

  test('privileged fields cannot be sent at registration (mass assignment)', async () => {
    for (const extra of [{ role: 'admin' }, { accessLevel: 'premium' }, { id: 'x' }, { passwordHash: 'x' }]) {
      assert.equal((await register(valid(extra))).status, 400, JSON.stringify(extra));
    }
  });
});

describe('login and session', () => {
  test('login with the right password starts a session; logout ends it', async () => {
    const body = valid();
    await register(body);
    const login = await t.request('POST', '/auth/login', { json: { email: body.email, password: body.password } });
    assert.equal(login.status, 200);
    const token = sessionOf(login);
    assert.equal((await t.request('GET', '/auth/me', { token })).status, 200);

    const out = await t.request('POST', '/auth/logout', { token });
    assert.equal(out.status, 204);
    assert.match(out.headers.getSetCookie().find((c) => c.startsWith('session=')), /Expires=Thu, 01 Jan 1970|Max-Age=0/i);
  });

  test('login is case-insensitive on the e-mail', async () => {
    const body = valid();
    await register(body);
    assert.equal((await t.request('POST', '/auth/login', { json: { email: body.email.toUpperCase(), password: body.password } })).status, 200);
  });

  test('a wrong password and an unknown e-mail give the SAME answer (no account enumeration)', async () => {
    const body = valid();
    await register(body);
    const wrong = await t.request('POST', '/auth/login', { json: { email: body.email, password: 'mauvais-mot-de-passe' } });
    const unknown = await t.request('POST', '/auth/login', { json: { email: 'personne@example.com', password: 'mauvais-mot-de-passe' } });
    assert.equal(wrong.status, 401);
    assert.equal(unknown.status, 401);
    assert.equal(wrong.body.error.message, unknown.body.error.message);
    assert.equal(sessionOf(wrong), undefined);
  });

  test('malformed login bodies are refused with 400', async () => {
    for (const json of [{}, { email: 'x' }, { email: 'a@b.co' }, { email: 'a@b.co', password: '' }, { email: { $ne: null }, password: { $ne: null } }, { email: 'a@b.co', password: 'x', extra: 1 }]) {
      assert.equal((await t.request('POST', '/auth/login', { json })).status, 400, JSON.stringify(json).slice(0, 60));
    }
  });

  test('/auth/me needs a session', async () => {
    assert.equal((await t.request('GET', '/auth/me')).status, 401);
  });
});

describe('profile', () => {
  test('the account type can be changed, and nothing else', async () => {
    const res = await register(valid());
    const token = sessionOf(res);
    const ok = await t.request('PATCH', '/auth/me', { token, json: { accountType: 'pmi' } });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.user.accountType, 'pmi');
    for (const json of [{ accountType: 'nope' }, { role: 'admin' }, { accessLevel: 'premium' }, { name: 'Autre' }, {}]) {
      assert.equal((await t.request('PATCH', '/auth/me', { token, json })).status, 400, JSON.stringify(json));
    }
    assert.equal((await t.request('PATCH', '/auth/me', { json: { accountType: 'pme' } })).status, 401);
    const row = await t.prisma.user.findUnique({ where: { id: res.body.user.id } });
    assert.deepEqual([row.role, row.accessLevel], ['user', 'standard']);
  });
});

describe('contact form', () => {
  test('a valid message is stored', async () => {
    const res = await t.request('POST', '/contact', { json: { name: 'Visiteur', email: 'visiteur@example.com', message: 'Bonjour, une question.' } });
    assert.equal(res.status, 201);
    assert.equal(await t.prisma.contactMessage.count({ where: { email: 'visiteur@example.com' } }), 1);
  });

  test('invalid messages are refused', async () => {
    for (const json of [{}, { name: '', email: 'a@b.co', message: 'x' }, { name: 'x', email: 'no', message: 'x' }, { name: 'x', email: 'a@b.co', message: '' }, { name: 'x', email: 'a@b.co', message: 'x'.repeat(5001) }, { name: 'x', email: 'a@b.co', message: 'x', extra: 1 }]) {
      assert.equal((await t.request('POST', '/contact', { json })).status, 400, JSON.stringify(json).slice(0, 60));
    }
  });
});
