import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { boot } from '../helpers/server.js';
import { CRITERION_KEYS } from '../../src/constants/comparison.js';

// Multi-criteria comparison (P4-12) through the real API: screens C19 and ET08.
// Free access, pure compute. These tests are about the contract, the refusals,
// and the three promises of C19: no opaque ranking, missing data stated, and
// different currencies or horizons sent back for normalisation.

let t;
const get = (path) => t.request('GET', path);
const post = (path, json) => t.request('POST', path, { json });
const DA = (units) => units * 100;

before(async () => {
  t = await boot();
});
after(() => t.close());

const option = (key, criteria, extra = {}) => ({ key, label: key.toUpperCase(), criteria, ...extra });
const offer = (label, extra) => ({ label, net: DA(70_000), ...extra });

describe('what the interface needs before comparing', () => {
  test('the criteria, their direction, their unit and the bounds of the client', async () => {
    const res = await get('/tools/comparaisons');
    assert.equal(res.status, 200);
    assert.deepEqual(
      res.body.criteria.map((criterion) => criterion.key),
      CRITERION_KEYS,
    );
    assert.equal(res.body.minOptions, 2);
    assert.equal(res.body.maxOptions, 3);
    // The grading scale of liquidity and risk is stated, not implied: the
    // client gives no scale, so the only honest source is the person.
    assert.deepEqual(res.body.gradeScale, { min: 0, max: 10 });
    const risk = res.body.criteria.find((criterion) => criterion.key === 'risk');
    assert.equal(risk.grade, true);
    assert.equal(risk.direction, 'lower');
    assert.deepEqual(res.body.jobOfferCriteria, ['netValue', 'cost', 'commuteMinutes']);
  });

  test('no account is needed, and a comparison is never cached', async () => {
    const res = await post('/tools/comparaisons', {
      options: [option('a', { cost: DA(1_000) }), option('b', { cost: DA(2_000) })],
      criteria: ['cost'],
    });
    assert.equal(res.status, 200);
    assert.match(res.headers.get('cache-control'), /no-store/);
  });
});

describe('the comparison engine (C19)', () => {
  test('a table with the best cell of each row named, and no score unless asked', async () => {
    const res = await post('/tools/comparaisons', {
      options: [option('a', { cost: DA(1_000), liquidity: 9 }), option('b', { cost: DA(700), liquidity: 4 })],
      criteria: ['cost', 'liquidity'],
    });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const { comparison } = res.body;
    assert.deepEqual(
      comparison.options.map((o) => o.key),
      ['a', 'b'],
    );
    assert.deepEqual(comparison.criteria.find((row) => row.criterion === 'cost').best, ['b']);
    assert.deepEqual(comparison.criteria.find((row) => row.criterion === 'liquidity').best, ['a']);
    assert.equal(comparison.scores, null, 'no weights were given');
  });

  test('a score appears only with weights, and carries its method back', async () => {
    const res = await post('/tools/comparaisons', {
      options: [option('a', { cost: DA(1_000), risk: 3 }), option('b', { cost: DA(2_500), risk: 7 })],
      criteria: ['cost', 'risk'],
      weights: { cost: 2, risk: 1 },
    });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const { comparison } = res.body;
    assert.equal(comparison.scores.a.formule_id, 'F054');
    assert.ok(comparison.scores.a.resultat > comparison.scores.b.resultat);
    assert.equal(comparison.scores.a.hypotheses.normalisation, 'min-max sur les options comparées');
    assert.deepEqual(comparison.weights, { cost: 2, risk: 1 });
    // Every score carries the full contract, like any computed value.
    for (const field of ['resultat', 'unite', 'formule_id', 'formule_version', 'entrees_snapshot', 'calcule_le']) {
      assert.ok(field in comparison.scores.a, field);
    }
  });

  test('different currencies are sent back for normalisation, naming the field', async () => {
    const res = await post('/tools/comparaisons', {
      options: [option('a', { cost: DA(1_000) }, { currency: 'DZD' }), option('b', { cost: DA(10) }, { currency: 'EUR' })],
      criteria: ['cost'],
    });
    assert.equal(res.status, 400);
    assert.match(res.body.error.message, /currency/);
  });

  test('different horizons too', async () => {
    const res = await post('/tools/comparaisons', {
      options: [option('a', { cost: DA(1_000) }, { horizonMonths: 12 }), option('b', { cost: DA(900) }, { horizonMonths: 36 })],
      criteria: ['cost'],
    });
    assert.equal(res.status, 400);
    assert.match(res.body.error.message, /horizonMonths/);
  });

  test('a missing value is stated, and nothing is scored on it', async () => {
    const res = await post('/tools/comparaisons', {
      options: [option('a', { cost: DA(1_000), fees: DA(50) }), option('b', { cost: DA(1_500) })],
      criteria: ['cost', 'fees'],
      weights: { cost: 1, fees: 1 },
    });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    const { comparison } = res.body;
    assert.deepEqual(comparison.warnings, [{ criterion: 'fees', missing: ['b'] }]);
    assert.equal(comparison.criteria.find((row) => row.criterion === 'fees').values.b, null);
    assert.deepEqual(comparison.scores.a.hypotheses.criteres_ecartes, ['fees']);
  });

  test('one option is refused, four are refused: the client says two to three', async () => {
    assert.equal((await post('/tools/comparaisons', { options: [option('a', { cost: 1 })], criteria: ['cost'] })).status, 400);
    const four = Array.from({ length: 4 }, (_, i) => option(`o${i}`, { cost: i + 1 }));
    assert.equal((await post('/tools/comparaisons', { options: four, criteria: ['cost'] })).status, 400);
  });

  test('an unknown criterion, an unknown field and a grade out of scale are refused', async () => {
    const options = [option('a', { cost: 1 }), option('b', { cost: 2 })];
    assert.equal((await post('/tools/comparaisons', { options, criteria: ['karma'] })).status, 400);
    assert.equal((await post('/tools/comparaisons', { options, criteria: ['cost'], ranking: true })).status, 400);
    assert.equal(
      (await post('/tools/comparaisons', { options: [option('a', { risk: 11 }), option('b', { risk: 2 })], criteria: ['risk'] })).status,
      400,
      'the stated 0-10 scale is enforced',
    );
    assert.equal(
      (await post('/tools/comparaisons', { options: [option('a', { energie: 5 }), option('b', { energie: 2 })], criteria: ['risk'] })).status,
      400,
      'a criterion nobody declared cannot be smuggled in as a value',
    );
  });
});

describe('the job-offer comparator (ET08)', () => {
  test('the net economic value, the costs deducted, and the comparison in one answer', async () => {
    const res = await post('/tools/comparaisons/offres-emploi', {
      currency: 'DZD',
      offers: [
        offer('Proche', { net: DA(68_000), mealCost: DA(4_000), commuteMinutes: 30 }),
        offer('Loin', { net: DA(75_000), transportCost: DA(12_000), mealCost: DA(6_000), commuteMinutes: 110 }),
      ],
    });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal(res.body.offers.length, 2);
    assert.equal(res.body.offers[0].resultats.netEconomique.resultat, DA(64_000));
    assert.equal(res.body.offers[1].resultats.netEconomique.resultat, DA(57_000));
    // The better salary loses once the job costs are counted — the whole point
    // of the screen.
    assert.deepEqual(res.body.comparison.criteria.find((row) => row.criterion === 'netValue').best, ['o1']);
    const commute = res.body.comparison.criteria.find((row) => row.criterion === 'commuteMinutes');
    assert.equal(commute.unit, 'count', 'the commute is time, never money');
  });

  test('a benefit nobody can price is returned apart and changes no figure', async () => {
    const plain = await post('/tools/comparaisons/offres-emploi', { currency: 'DZD', offers: [offer('A'), offer('B')] });
    const described = await post('/tools/comparaisons/offres-emploi', {
      currency: 'DZD',
      offers: [offer('A', { nonMonetisableBenefits: 'Équipe soudée, horaires souples' }), offer('B')],
    });
    assert.equal(described.status, 200, JSON.stringify(described.body));
    assert.equal(described.body.offers[0].nonMonetisableBenefits, 'Équipe soudée, horaires souples');
    assert.equal(
      described.body.offers[0].resultats.netEconomique.resultat,
      plain.body.offers[0].resultats.netEconomique.resultat,
      'describing an unpriceable benefit must not move the number',
    );
  });

  test('a single offer is refused: there is nothing to compare', async () => {
    assert.equal((await post('/tools/comparaisons/offres-emploi', { currency: 'DZD', offers: [offer('A')] })).status, 400);
  });

  test('the currency is required and the amounts must be whole', async () => {
    assert.equal((await post('/tools/comparaisons/offres-emploi', { offers: [offer('A'), offer('B')] })).status, 400);
    const decimal = await post('/tools/comparaisons/offres-emploi', { currency: 'DZD', offers: [offer('A', { net: 7_000_000.5 }), offer('B')] });
    assert.equal(decimal.status, 400, 'a decimal is refused, not rounded behind the user');
  });

  test('every figure of an offer can say which formula produced it', async () => {
    const res = await post('/tools/comparaisons/offres-emploi', {
      currency: 'EUR',
      offers: [offer('A', { annualJobCosts: DA(1_200) }), offer('B')],
      weights: { netValue: 2, cost: 1, commuteMinutes: 1 },
    });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    for (const o of res.body.offers) {
      for (const [name, value] of Object.entries(o.resultats)) {
        assert.ok(['F003', 'F048', 'F049'].includes(value.formule_id), `${name}: ${value.formule_id}`);
        assert.equal(value.unite, 'EUR', `${name} is labelled with the currency asked for`);
        assert.ok(Number.isInteger(value.formule_version));
      }
    }
  });
});
