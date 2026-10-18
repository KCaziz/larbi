import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';

// Real patrimony (P6-11) through the real API and database: the assets, the
// dated valuation and its 90-day alert, net worth against the debts of P6-10,
// the allocation, and the rule the whole task rests on — « le fictif est
// interdit ici ».

let t;
let user;

const DAY = 24 * 3600 * 1000;
const iso = (date) => date.toISOString();
const ago = (days) => new Date(Date.now() - days * DAY);
const inDays = (days) => new Date(Date.now() + days * DAY);

before(async () => {
  t = await boot();
});
beforeEach(async () => {
  await t.reset();
  user = await t.adult();
});
after(() => t.close());

const addAsset = (json = {}) =>
  t.request('POST', '/fin/actifs', {
    user,
    json: { label: 'Compte courant', kind: 'account', value: 5000000, currency: 'DZD', valuedAt: iso(ago(5)), ...json },
  });
const addDebt = (json = {}) =>
  t.request('POST', '/fin/debts', {
    user,
    json: { label: 'Crédit auto', outstandingPrincipal: 2000000, monthlyInstalment: 200000, currency: 'DZD', ...json },
  });
const wealth = (query = '') => t.request('GET', `/fin/patrimoine${query}`, { user });

describe('P6-11 — assets', () => {
  test('an asset is created with its dated valuation and its liquidity', async () => {
    const res = await addAsset();
    assert.equal(res.status, 201);
    assert.equal(res.body.asset.liquidity, 'liquid', 'an account is liquid by default');
    assert.equal(res.body.asset.status, 'declared');
  });

  test('the default liquidity follows the kind, and can be overridden', async () => {
    const flat = await addAsset({ label: 'Appartement', kind: 'property', value: 90000000 });
    assert.equal(flat.body.asset.liquidity, 'illiquid');
    const gold = await addAsset({ label: 'Or', kind: 'gold', value: 3000000, liquidity: 'liquid' });
    assert.equal(gold.body.asset.liquidity, 'liquid', 'the field is the person s to set');
  });

  test('an undated or future valuation is refused', async () => {
    const undated = await t.request('POST', '/fin/actifs', {
      user,
      json: { label: 'Or', kind: 'gold', value: 1000000, currency: 'DZD' },
    });
    assert.equal(undated.status, 400, 'an undated valuation cannot be known to be stale');
    const future = await addAsset({ valuedAt: iso(inDays(3)) });
    assert.equal(future.status, 422);
    assert.equal(future.body.error.details.reason, 'futureValuation');
  });

  test('an asset worth nothing is refused', async () => {
    assert.equal((await addAsset({ value: 0 })).status, 400);
  });

  test('correcting the amount without the date it was established is refused', async () => {
    const created = await addAsset();
    const res = await t.request('PATCH', `/fin/actifs/${created.body.asset.id}`, { user, json: { value: 6000000 } });
    assert.equal(res.status, 400, 'a new value would otherwise make a stale figure look fresh');

    const ok = await t.request('PATCH', `/fin/actifs/${created.body.asset.id}`, {
      user,
      json: { value: 6000000, valuedAt: iso(ago(1)), reason: 'relevé de banque' },
    });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.asset.value, 6000000);
    assert.equal(ok.body.asset.version, 2);
  });

  test('the valuation history is read from the correction journal, not a second table', async () => {
    const created = await addAsset();
    await t.request('PATCH', `/fin/actifs/${created.body.asset.id}`, { user, json: { value: 6000000, valuedAt: iso(ago(1)), reason: 'relevé' } });
    const res = await t.request('GET', `/fin/actifs/${created.body.asset.id}/valeurs`, { user });
    assert.equal(res.status, 200);
    const amounts = res.body.valuations.filter((row) => row.field === 'value');
    assert.equal(amounts.length, 1);
    assert.equal(amounts[0].before, 5000000);
    assert.equal(amounts[0].after, 6000000);
    assert.equal(amounts[0].reason, 'relevé');
  });

  test('deleting an asset is logical and traceable', async () => {
    const created = await addAsset();
    assert.equal((await t.request('DELETE', `/fin/actifs/${created.body.asset.id}`, { user, json: {} })).status, 200);
    const row = await t.prisma.finAsset.findUnique({ where: { id: created.body.asset.id }, select: { deletedAt: true } });
    assert.ok(row.deletedAt);
    assert.equal(await t.prisma.finChange.count({ where: { entityId: created.body.asset.id, action: 'delete' } }), 1);
  });
});

describe('P6-11 — the fictional is forbidden here', () => {
  test('a fictional asset is refused, with a reason', async () => {
    const res = await addAsset({ status: 'fictional' });
    assert.equal(res.status, 400, 'the status is not even in the accepted list');
    assert.equal(await t.prisma.finAsset.count(), 0);
  });

  test('an existing asset cannot be turned fictional', async () => {
    const created = await addAsset();
    const res = await t.request('PATCH', `/fin/actifs/${created.body.asset.id}`, { user, json: { status: 'fictional' } });
    assert.equal(res.status, 400);
    const row = await t.prisma.finAsset.findUnique({ where: { id: created.body.asset.id }, select: { status: true } });
    assert.equal(row.status, 'declared');
  });

  test('the database refuses it too, not only validation', async () => {
    // Three layers, because one fictional row inside F035 makes net worth a lie
    // rather than a figure: zod, this CHECK, and the consistency control.
    await assert.rejects(
      () =>
        t.prisma.finAsset.create({
          data: {
            userId: user.id,
            label: 'Forgé',
            kind: 'gold',
            value: 100,
            currency: 'DZD',
            valuedAt: new Date(),
            liquidity: 'liquid',
            source: 'manual',
            status: 'fictional',
            consentUses: [],
          },
        }),
      'the CHECK must refuse it',
    );
  });

  test('the API says the rule out loud', async () => {
    const res = await t.request('GET', '/fin/patrimoine/references', { user });
    assert.equal(res.body.fictionalForbidden, true);
    assert.ok(!res.body.statuses.includes('fictional'));
    assert.equal(res.body.valuationStaleDays, 90, "the client's own threshold");
  });
});

describe('P6-11 — the patrimony view', () => {
  test('net worth reads the debts of P6-10, not a second table', async () => {
    await addAsset({ value: 5000000 });
    const debt = await addDebt({ outstandingPrincipal: 2000000 });
    assert.equal(debt.status, 201);

    const res = await wealth();
    assert.equal(res.status, 200);
    assert.equal(res.body.patrimoine.totalActifs, 5000000);
    assert.equal(res.body.patrimoine.totalDettes, 2000000);
    assert.equal(res.body.patrimoine.patrimoineNet.resultat, 3000000);
    assert.equal(res.body.patrimoine.patrimoineNet.formule_id, 'F035');
  });

  test('an empty patrimony is not a patrimony of zero', async () => {
    const res = await wealth();
    assert.equal(res.body.patrimoine.patrimoineNet.resultat, null);
    assert.equal(res.body.patrimoine.concentrationMax.resultat, null);
    assert.equal(res.body.patrimoine.disponibleRapidement, null);
  });

  test('the allocation and the concentration are computed, with their thresholds visible', async () => {
    await addAsset({ label: 'Appartement', kind: 'property', value: 6000000, liquidity: 'illiquid' });
    await addAsset({ label: 'Compte', kind: 'account', value: 3000000 });
    await addAsset({ label: 'Or', kind: 'gold', value: 1000000 });

    const res = await wealth();
    const view = res.body.patrimoine;
    assert.equal(view.actifs[0].allocation.resultat, 0.6);
    assert.equal(view.actifs[0].allocation.formule_id, 'F036');
    assert.equal(view.concentrationMax.resultat, 0.6);
    assert.equal(view.concentrationSignalee, true);
    assert.ok(view.seuilConcentration > 0, 'the threshold compared against is published');
    assert.equal(view.disponibleRapidement, 3000000, 'only what could actually be reached quickly');
  });

  test('a valuation older than 90 days is reported', async () => {
    await addAsset({ valuedAt: iso(ago(120)) });
    const res = await wealth();
    assert.equal(res.body.patrimoine.actifs[0].valeurAncienne, true);
    assert.ok(res.body.patrimoine.actifs[0].ageJours >= 119);
    assert.equal(res.body.patrimoine.valeursAnciennes.length, 1);
    assert.ok(res.body.patrimoine.avertissements.some((text) => text.includes('90 jours')));
  });

  test('the threshold can be narrowed, and the answer says which one was used', async () => {
    await addAsset({ valuedAt: iso(ago(40)) });
    assert.equal((await wealth()).body.patrimoine.actifs[0].valeurAncienne, false);
    const strict = await wealth('?staleDays=30');
    assert.equal(strict.body.patrimoine.actifs[0].valeurAncienne, true);
    assert.equal(strict.body.patrimoine.seuilValeurAncienneJours, 30);
  });

  test('the category label is joined server-side', async () => {
    const gold = await t.prisma.finCategory.findFirst({ where: { key: 'asset.or_bijoux', userId: null }, select: { id: true } });
    if (gold) {
      await addAsset({ label: 'Or', kind: 'gold', value: 1000000, categoryId: gold.id });
      const res = await wealth();
      assert.ok(res.body.patrimoine.actifs[0].categoryLabel, 'the interface never guesses a label');
    }
  });

  test('every figure carries its formula, its inputs and its date', async () => {
    await addAsset();
    const view = (await wealth()).body.patrimoine;
    for (const key of ['patrimoineNet', 'concentrationMax']) {
      assert.ok(view[key].formule_id, `${key} says which formula`);
      assert.ok(view[key].calcule_le, `${key} says when`);
      assert.ok(view[key].entrees_snapshot, `${key} says from what`);
    }
  });
});

// The history behind the net-worth curve (P6-23): built from the change
// journal, never a second table of the same facts.
describe('P6-23 — net worth history', () => {
  const history = (query = '') => t.request('GET', `/fin/patrimoine/historique${query}`, { user });

  test('one asset moves the series, and the running total reflects a correction', async () => {
    const created = await addAsset({ value: 1000000 });
    await t.request('PATCH', `/fin/actifs/${created.body.asset.id}`, { user, json: { value: 1500000, valuedAt: iso(ago(1)) } });

    const res = await history();
    assert.equal(res.status, 200);
    assert.ok(res.body.points.length >= 1, 'at least today');
    assert.equal(res.body.points.at(-1).net, 1500000, 'the LAST point of the day carries the corrected value');
  });

  test('a debt is subtracted, not added', async () => {
    await addAsset({ value: 1000000 });
    await addDebt({ outstandingPrincipal: 300000 });

    const res = await history();
    assert.equal(res.body.points.at(-1).net, 700000);
  });

  test('an archived asset stops contributing from then on', async () => {
    const created = await addAsset({ value: 1000000 });
    await t.request('PUT', `/fin/actifs/${created.body.asset.id}/archive`, { user, json: { archived: true } });

    const res = await history();
    assert.equal(res.body.points.at(-1).net, 0, 'archived is excluded, same as the live figure');
  });

  test('a row in another currency never contributes', async () => {
    await addAsset({ value: 1000000, currency: 'EUR' });
    const res = await history();
    assert.equal(res.body.points.length, 0, 'nothing in DZD ever moved');
  });

  test('with nothing recorded, the series is simply empty — never a fabricated zero point', async () => {
    const res = await history();
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.points, []);
  });

  test('isolated between accounts', async () => {
    await addAsset({ value: 1000000 });
    const other = await t.adult();
    const res = await t.request('GET', '/fin/patrimoine/historique', { user: other });
    assert.deepEqual(res.body.points, []);
  });
});
