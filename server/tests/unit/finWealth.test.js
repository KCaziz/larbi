import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { buildWealthView } from '../../src/services/finWealth.service.js';
import { ASSET_KINDS, ASSET_LIQUIDITY, CONCENTRATION_NOTICE_SHARE, DEFAULT_LIQUIDITY, VALUATION_STALE_DAYS } from '../../src/constants/finWealth.js';

// The pure side of P6-11: net worth (F035), allocation (F036), concentration
// (F037), the 90-day stale-valuation alert, and the one rule that runs through
// all of it — real patrimony never holds a fictional value.

const D = (text) => new Date(`${text}T00:00:00.000Z`);
const NOW = D('2026-10-16');

const asset = (extra = {}) => ({
  id: 'a1',
  label: 'Compte courant',
  kind: 'account',
  liquidity: 'liquid',
  value: 5000000,
  currency: 'DZD',
  valuedAt: D('2026-10-10'),
  status: 'real',
  categoryId: null,
  holder: null,
  ...extra,
});
const debt = (extra = {}) => ({ id: 'd1', outstandingPrincipal: 2000000, currency: 'DZD', ...extra });

const view = (extra = {}) => buildWealthView({ currency: 'DZD', now: NOW, ...extra });

describe('P6-11 — the vocabularies', () => {
  test('every kind has a default liquidity the engine can read', () => {
    for (const kind of ASSET_KINDS) {
      assert.ok(ASSET_LIQUIDITY.includes(DEFAULT_LIQUIDITY[kind]), `${kind} has no readable default`);
    }
  });

  test("the client's own 90-day threshold is what is used", () => {
    assert.equal(VALUATION_STALE_DAYS, 90);
  });
});

describe('P6-11 — net worth (F035)', () => {
  test('net worth is the assets minus the debts, and says which formula it is', () => {
    const v = view({ assets: [asset()], debts: [debt()] });
    assert.equal(v.totalActifs, 5000000);
    assert.equal(v.totalDettes, 2000000);
    assert.equal(v.patrimoineNet.resultat, 3000000);
    assert.equal(v.patrimoineNet.formule_id, 'F035');
    assert.equal(v.patrimoineNet.unite, 'DZD');
  });

  test('assets with no debt net to the assets: having none is a real answer', () => {
    const v = view({ assets: [asset()], debts: [] });
    assert.equal(v.totalDettes, null, 'no debt is not a debt of zero as a displayed total');
    assert.equal(v.patrimoineNet.resultat, 5000000, 'but for the net figure, owing nothing means owing nothing');
  });

  test('no asset at all is not a net worth of zero', () => {
    const v = view({ assets: [], debts: [debt()] });
    assert.equal(v.patrimoineNet.resultat, null);
    assert.ok(v.patrimoineNet.avertissements, 'the formula says why');
  });

  test('a debt larger than the assets gives a negative net worth, not a hidden one', () => {
    const v = view({ assets: [asset({ value: 1000000 })], debts: [debt({ outstandingPrincipal: 4000000 })] });
    assert.equal(v.patrimoineNet.resultat, -3000000);
  });

  test('another currency is not converted and is reported', () => {
    const v = view({ assets: [asset(), asset({ id: 'a2', value: 900000, currency: 'EUR' })], debts: [] });
    assert.equal(v.totalActifs, 5000000);
    assert.equal(v.actifs.length, 1);
    assert.ok(v.avertissements.some((text) => text.includes('autre devise')));
  });
});

describe('P6-11 — the fictional is forbidden here', () => {
  test('a fictional row is dropped from every total and reported', () => {
    // The database cannot store one and zod refuses it earlier; if one ever
    // reached this function it would be silently added into net worth, which is
    // the one outcome the client's sentence forbids.
    const v = view({ assets: [asset(), asset({ id: 'a2', value: 9999999, status: 'fictional' })], debts: [] });
    assert.equal(v.totalActifs, 5000000);
    assert.equal(v.patrimoineNet.resultat, 5000000);
    assert.equal(v.actifs.length, 1);
    assert.ok(v.avertissements.some((text) => text.includes('fictive')));
  });
});

describe('P6-11 — allocation (F036) and concentration (F037)', () => {
  const spread = [
    asset({ id: 'a1', kind: 'property', value: 6000000, liquidity: 'illiquid' }),
    asset({ id: 'a2', kind: 'account', value: 3000000, liquidity: 'liquid' }),
    asset({ id: 'a3', kind: 'gold', value: 1000000, liquidity: 'semi_liquid' }),
  ];

  test('each asset carries its share, biggest first', () => {
    const v = view({ assets: spread, debts: [] });
    assert.deepEqual(
      v.actifs.map((row) => [row.id, row.allocation.resultat]),
      [
        ['a1', 0.6],
        ['a2', 0.3],
        ['a3', 0.1],
      ],
    );
    assert.equal(v.actifs[0].allocation.formule_id, 'F036');
    assert.equal(v.actifs[0].allocation.unite, 'ratio', 'a share is a decimal, shown as a percentage');
  });

  test('the allocation per kind is what the screen shows', () => {
    const v = view({ assets: [...spread, asset({ id: 'a4', kind: 'account', value: 1000000 })], debts: [] });
    const accounts = v.parType.find((row) => row.kind === 'account');
    assert.equal(accounts.total, 4000000, 'two accounts are one line');
    assert.equal(accounts.allocation.resultat, 0.36363636363636365);
  });

  test('concentration is a fact and a threshold, never an alarm', () => {
    const v = view({ assets: spread, debts: [] });
    assert.equal(v.concentrationMax.resultat, 0.6);
    assert.equal(v.concentrationMax.formule_id, 'F037');
    assert.equal(v.concentrationSignalee, true);
    assert.equal(v.seuilConcentration, CONCENTRATION_NOTICE_SHARE, 'the threshold compared against is visible');
  });

  test('a balanced patrimony raises no notice', () => {
    const v = view({
      assets: [asset({ id: 'a1', kind: 'account', value: 1000000 }), asset({ id: 'a2', kind: 'gold', value: 1000000 }), asset({ id: 'a3', kind: 'property', value: 1000000 })],
      debts: [],
    });
    assert.equal(v.concentrationSignalee, false);
  });

  test('the threshold is an argument, never hidden', () => {
    assert.equal(view({ assets: spread, debts: [], noticeShare: 0.9 }).concentrationSignalee, false);
    assert.equal(view({ assets: spread, debts: [], noticeShare: 0.2 }).concentrationSignalee, true);
  });

  test('an empty patrimony has no concentration rather than a concentration of zero', () => {
    assert.equal(view({ assets: [], debts: [] }).concentrationMax.resultat, null);
  });
});

describe('P6-11 — liquidity, and what F014 needs', () => {
  test('what could be reached quickly is stated apart', () => {
    const v = view({
      assets: [
        asset({ id: 'a1', kind: 'account', value: 3000000, liquidity: 'liquid' }),
        asset({ id: 'a2', kind: 'gold', value: 2000000, liquidity: 'semi_liquid' }),
        asset({ id: 'a3', kind: 'property', value: 9000000, liquidity: 'illiquid' }),
      ],
      debts: [],
    });
    assert.equal(v.disponibleRapidement, 3000000, "F014's own condition is to exclude the illiquid");
    assert.deepEqual(v.parLiquidite, { liquid: 3000000, semi_liquid: 2000000, illiquid: 9000000 });
  });

  test('a level nobody holds is null, not zero', () => {
    const v = view({ assets: [asset({ liquidity: 'liquid' })], debts: [] });
    assert.equal(v.parLiquidite.illiquid, null);
    assert.equal(v.disponibleRapidement, 5000000);
  });

  test('holding nothing liquid is not zero liquid', () => {
    const v = view({ assets: [asset({ liquidity: 'illiquid', kind: 'property' })], debts: [] });
    assert.equal(v.disponibleRapidement, null);
  });
});

describe('P6-11 — the stale-valuation alert', () => {
  test('a valuation older than 90 days is reported with its age', () => {
    const v = view({ assets: [asset({ valuedAt: D('2026-05-01') })], debts: [] });
    const line = v.actifs[0];
    assert.equal(line.ageJours, 168);
    assert.equal(line.valeurAncienne, true);
    assert.deepEqual(v.valeursAnciennes.map((row) => row.id), ['a1']);
    assert.ok(v.avertissements.some((text) => text.includes('90 jours')));
  });

  test('a recent valuation raises nothing', () => {
    const v = view({ assets: [asset({ valuedAt: D('2026-10-01') })], debts: [] });
    assert.equal(v.actifs[0].valeurAncienne, false);
    assert.deepEqual(v.valeursAnciennes, []);
  });

  test('the age is measured on when the value was established, not on the row', () => {
    // A flat entered a year ago and re-valued last week is fresh data: that is
    // exactly why `valuedAt` exists instead of reading `updatedAt`.
    const v = view({ assets: [asset({ kind: 'property', valuedAt: D('2026-10-12') })], debts: [] });
    assert.equal(v.actifs[0].valeurAncienne, false);
  });

  test('the threshold is an argument, and the answer says which one was used', () => {
    const v = view({ assets: [asset({ valuedAt: D('2026-09-01') })], debts: [], staleDays: 30 });
    assert.equal(v.actifs[0].valeurAncienne, true);
    assert.equal(v.seuilValeurAncienneJours, 30);
    assert.equal(v.patrimoineNet.entrees_snapshot.seuil_valeur_ancienne_jours, 30);
  });
});
