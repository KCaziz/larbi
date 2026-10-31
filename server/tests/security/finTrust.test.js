import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { boot } from '../helpers/server.js';

// Trust and data centre (P6-19): inventory, consents, export, deletion,
// completeness. The rule under test: sensitive actions need re-authentication,
// deletion is complete and immediate, and nothing here ever leaks another
// account's data.

let t;
let owner;
let other;
const PASSWORD = 'correct horse battery staple';

const iso = (date) => date.toISOString();

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  owner = await t.user({ passwordHash: await bcrypt.hash(PASSWORD, 4) });
  other = await t.user();
});
after(() => t.close());

describe('the data inventory', () => {
  test('requires a session', async () => {
    const res = await t.request('GET', '/fin/confiance/inventaire');
    assert.equal(res.status, 401);
  });

  test("reflects only this account's own data", async () => {
    await t.request('POST', '/fin/revenus', { user: owner, json: { label: 'Salaire', value: 6000000, currency: 'DZD', frequency: 'mensuel', startDate: iso(new Date()) } });
    const mine = await t.request('GET', '/fin/confiance/inventaire', { user: owner });
    const theirs = await t.request('GET', '/fin/confiance/inventaire', { user: other });
    const myIncomes = mine.body.tables.find((table) => table.label === 'income');
    const theirIncomes = theirs.body.tables.find((table) => table.label === 'income');
    assert.equal(myIncomes.count, 1);
    assert.equal(theirIncomes.count, 0);
  });
});

// L'espace entreprise (P7-02) dans l'inventaire et l'export.
//
// Ses tables filles — tiers, documents, règlements — ne portent PAS de
// `userId` : elles appartiennent à une entreprise, qui appartient au compte.
// Le registre déclare ce chemin (`ownerWhere`), et ce test vérifie qu'il est
// réellement suivi.
//
// L'enjeu n'est pas cosmétique : une donnée qu'un export oublie est une donnée
// que la promesse de transparence du centre de confiance ne couvre pas, et
// personne ne s'en aperçoit — un export incomplet a exactement l'air d'un
// export complet.
describe("l'espace entreprise est inventorié comme le reste", () => {
  test('ses tiers et ses documents comptent pour leur compte, et pour lui seul', async () => {
    const boss = await t.adult();
    const stranger = await t.adult();

    const created = await t.request('POST', '/fin/entreprise', {
      user: boss,
      json: { name: 'Atelier Belkacem', currency: 'DZD' },
    });
    assert.equal(created.status, 201);
    await t.request('POST', '/fin/entreprise/tiers', { user: boss, json: { kind: 'client', name: 'Client A' } });
    await t.request('POST', '/fin/entreprise/documents', {
      user: boss,
      json: {
        kind: 'sale',
        number: 'F-001',
        label: 'Prestation',
        issuedAt: '2026-01-10T00:00:00.000Z',
        amountExcl: 100000,
        taxAmount: 19000,
        currency: 'DZD',
      },
    });

    const mine = await t.request('GET', '/fin/confiance/inventaire', { user: boss });
    const count = (body, label) => body.tables.find((table) => table.label === label)?.count;
    assert.equal(count(mine.body, 'business'), 1);
    assert.equal(count(mine.body, 'businessContact'), 1);
    assert.equal(count(mine.body, 'businessDocument'), 1);

    // Et l'inventaire d'un autre compte n'en voit rien : c'est la même
    // garantie que pour l'argent personnel, appliquée à une table qui n'a pas
    // de `userId` à elle.
    const theirs = await t.request('GET', '/fin/confiance/inventaire', { user: stranger });
    assert.equal(count(theirs.body, 'business'), 0);
    assert.equal(count(theirs.body, 'businessContact'), 0);
    assert.equal(count(theirs.body, 'businessDocument'), 0);
  });
});

describe('completeness', () => {
  test('is a mechanical fact, and improves as the account declares data', async () => {
    const before1 = await t.request('GET', '/fin/confiance/completude', { user: owner });
    await t.request('POST', '/fin/revenus', { user: owner, json: { label: 'Salaire', value: 6000000, currency: 'DZD', frequency: 'mensuel', startDate: iso(new Date()) } });
    const after1 = await t.request('GET', '/fin/confiance/completude', { user: owner });
    assert.ok(after1.body.ratio > before1.body.ratio);
  });
});

describe('export', () => {
  test('is refused without the current password', async () => {
    const res = await t.request('POST', '/fin/confiance/export', { user: owner, json: { consent: true, currentPassword: 'wrong' } });
    assert.equal(res.status, 403);
  });

  test("once authenticated, carries this account's own data and nobody else's", async () => {
    await t.request('POST', '/fin/revenus', { user: owner, json: { label: 'Salaire secret', value: 6000000, currency: 'DZD', frequency: 'mensuel', startDate: iso(new Date()) } });
    const res = await t.request('POST', '/fin/confiance/export', { user: owner, json: { consent: true, currentPassword: PASSWORD } });
    assert.equal(res.status, 200);
    assert.equal(res.body.compte.id, owner.id);
    const incomes = res.body.donnees.find((d) => d.label === 'income');
    assert.equal(incomes.rows.length, 1);
    assert.equal(incomes.rows[0].label, 'Salaire secret');
  });
});

describe('connected devices (P8-20)', () => {
  // A real login, so the session row and its cookie exist exactly as in use.
  const login = async () => {
    const res = await t.request('POST', '/auth/login', { json: { email: owner.email, password: PASSWORD } });
    assert.equal(res.status, 200);
    const cookie = res.headers.get('set-cookie').split(';')[0].replace('session=', '');
    return cookie;
  };

  test('a login creates a session that is listed, and the current one is marked', async () => {
    const token = await login();
    const res = await t.request('GET', '/fin/confiance/appareils', { token });
    assert.equal(res.body.disponible, true);
    assert.equal(res.body.appareils.length, 1);
    assert.equal(res.body.appareils[0].courant, true);
    assert.equal(res.body.sessionCourantSuivie, true);
  });

  test('ending another device needs the password, and then kills that session at once', async () => {
    const first = await login();
    const second = await login();
    const listed = (await t.request('GET', '/fin/confiance/appareils', { token: second })).body.appareils;
    const other = listed.find((row) => !row.courant);

    const refused = await t.request('POST', `/fin/confiance/appareils/${other.id}/deconnecter`, { token: second, json: { consent: true, currentPassword: 'wrong' } });
    assert.ok([400, 403].includes(refused.status), `refused with ${refused.status}`);
    assert.equal((await t.request('GET', '/auth/me', { token: first })).status, 200, 'still signed in');

    const done = await t.request('POST', `/fin/confiance/appareils/${other.id}/deconnecter`, { token: second, json: { consent: true, currentPassword: PASSWORD } });
    assert.equal(done.status, 200);
    assert.equal((await t.request('GET', '/auth/me', { token: first })).status, 401, 'that session ended on its next request');
    assert.equal((await t.request('GET', '/auth/me', { token: second })).status, 200, 'this device stays');
  });

  test('« déconnecter les autres » keeps only this device', async () => {
    const first = await login();
    const second = await login();
    const res = await t.request('POST', '/fin/confiance/appareils/deconnecter-autres', { token: second, json: { consent: true, currentPassword: PASSWORD } });
    assert.equal(res.body.deconnectes, 1);
    assert.equal((await t.request('GET', '/auth/me', { token: first })).status, 401);
  });

  test('another person cannot end my session, and learns nothing about it', async () => {
    const mine = await login();
    const id = (await t.request('GET', '/fin/confiance/appareils', { token: mine })).body.appareils[0].id;
    const intruder = await t.user({ passwordHash: await bcrypt.hash(PASSWORD, 4) });
    const res = await t.request('POST', `/fin/confiance/appareils/${id}/deconnecter`, { user: intruder, json: { consent: true, currentPassword: PASSWORD } });
    assert.equal(res.status, 404);
    assert.equal((await t.request('GET', '/auth/me', { token: mine })).status, 200);
  });

  test('logging out ends the session for good, even if the cookie is kept', async () => {
    const token = await login();
    assert.equal((await t.request('POST', '/auth/logout', { token, json: {} })).status, 204);
    assert.equal((await t.request('GET', '/auth/me', { token })).status, 401);
  });

  test('changing the password signs out every other device', async () => {
    const first = await login();
    const second = await login();
    const res = await t.request('POST', '/auth/password', { token: second, json: { currentPassword: PASSWORD, newPassword: 'Another-Passw0rd!' } });
    assert.equal(res.status, 204, JSON.stringify(res.body));
    assert.equal((await t.request('GET', '/auth/me', { token: first })).status, 401);
    assert.equal((await t.request('GET', '/auth/me', { token: second })).status, 200);
  });

  test('a token from before sessions existed still works', async () => {
    assert.equal((await t.request('GET', '/auth/me', { user: owner })).status, 200);
  });
});

describe('withdrawing a space-sharing consent', () => {
  test('requires the current password', async () => {
    const space = await t.request('POST', '/fin/espaces', { user: owner, json: { kind: 'couple', label: 'Nous', currency: 'DZD' } });
    await t.request('PUT', `/fin/espaces/${space.body.space.id}/mon-partage`, { user: owner, json: { incomes: 'totals' } });
    const res = await t.request('POST', '/fin/confiance/consentements/retirer-partage', {
      user: owner,
      json: { spaceId: space.body.space.id, kind: 'incomes', currentPassword: 'wrong' },
    });
    assert.equal(res.status, 403);
  });

  test('once withdrawn, blocks the dependent use (income-proportional split) and disappears from the consent list', async () => {
    const space = await t.request('POST', '/fin/espaces', { user: owner, json: { kind: 'couple', label: 'Nous', currency: 'DZD' } });
    const invite = await t.request('POST', `/fin/espaces/${space.body.space.id}/invitations`, { user: owner, json: { role: 'member' } });
    await t.request('POST', '/fin/espaces/rejoindre', { user: other, json: { token: invite.body.token } });
    await t.request('PUT', `/fin/espaces/${space.body.space.id}/mon-partage`, { user: owner, json: { incomes: 'totals' } });

    const before1 = await t.request('GET', '/fin/confiance/consentements', { user: owner });
    assert.ok(before1.body.partages.some((p) => p.kind === 'incomes'));

    const withdraw = await t.request('POST', '/fin/confiance/consentements/retirer-partage', {
      user: owner,
      json: { spaceId: space.body.space.id, kind: 'incomes', currentPassword: PASSWORD },
    });
    assert.equal(withdraw.status, 200);

    const after1 = await t.request('GET', '/fin/confiance/consentements', { user: owner });
    assert.ok(!after1.body.partages.some((p) => p.kind === 'incomes'));
  });
});

describe('account deletion', () => {
  test('is refused without the current password', async () => {
    const res = await t.request('POST', '/fin/confiance/suppression', { user: owner, json: { consent: true, currentPassword: 'wrong', email: owner.email } });
    assert.equal(res.status, 403);
  });

  test('is refused if the typed e-mail does not match the account', async () => {
    const res = await t.request('POST', '/fin/confiance/suppression', { user: owner, json: { consent: true, currentPassword: PASSWORD, email: 'someone-else@test.local' } });
    assert.equal(res.status, 422);
  });

  test('once confirmed, erases the account completely and immediately', async () => {
    await t.request('POST', '/fin/revenus', { user: owner, json: { label: 'Salaire', value: 6000000, currency: 'DZD', frequency: 'mensuel', startDate: iso(new Date()) } });
    // An account WITH movements (P8-03): while the movement's account key was
    // Restrict, MariaDB refused this erasure.
    const account = (await t.request('POST', '/fin/comptes', { user: owner, json: { label: 'Compte courant', type: 'AC-02', currency: 'DZD' } })).body.account;
    const spent = await t.request('POST', '/fin/transactions', { user: owner, json: { kind: 'expense', value: 100000, currency: 'DZD', accountId: account.id, occurredAt: iso(new Date()) } });
    assert.equal(spent.status, 201);
    const res = await t.request('POST', '/fin/confiance/suppression', { user: owner, json: { consent: true, currentPassword: PASSWORD, email: owner.email } });
    assert.equal(res.status, 200);
    assert.equal(await t.prisma.user.count({ where: { id: owner.id } }), 0);
    assert.equal(await t.prisma.finIncome.count({ where: { userId: owner.id } }), 0);
    assert.equal(await t.prisma.finAccount.count({ where: { userId: owner.id } }), 0);
    assert.equal(await t.prisma.finTransaction.count({ where: { userId: owner.id } }), 0);
  });
});
