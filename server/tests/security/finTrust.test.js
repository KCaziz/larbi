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

describe('connected devices', () => {
  test('is honestly declared unavailable rather than invented', async () => {
    const res = await t.request('GET', '/fin/confiance/appareils', { user: owner });
    assert.equal(res.body.disponible, false);
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
    const res = await t.request('POST', '/fin/confiance/suppression', { user: owner, json: { consent: true, currentPassword: PASSWORD, email: owner.email } });
    assert.equal(res.status, 200);
    assert.equal(await t.prisma.user.count({ where: { id: owner.id } }), 0);
    assert.equal(await t.prisma.finIncome.count({ where: { userId: owner.id } }), 0);
  });
});
