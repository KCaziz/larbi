import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { COMPARISON_CRITERIA, CRITERION_KEYS, MAX_OPTIONS, MIN_OPTIONS } from '../../src/constants/comparison.js';
import { NotComparableError, compareOptions } from '../../src/services/finance/comparison.js';
import { compareJobOffers } from '../../src/services/finance/jobOffers.js';

// The comparison engine of FINCLUDIA (P4-12), screen C19, and the job-offer
// comparator (ET08). The client's rules here are mostly about what must NOT
// happen — no opaque ranking, no invented exchange rate, no missing value read
// as a zero — so most of these tests check a refusal or an absence.

const DA = (units) => units * 100;
const option = (key, criteria, extra = {}) => ({ key, label: key.toUpperCase(), criteria, ...extra });

describe('the criteria vocabulary', () => {
  test('every criterion has a unit, and a direction unless it is text', () => {
    assert.ok(COMPARISON_CRITERIA.length > 0);
    for (const criterion of COMPARISON_CRITERIA) {
      assert.ok(criterion.key.length > 0);
      assert.ok(criterion.unit.length > 0, criterion.key);
      if (criterion.unit === 'text') assert.equal(criterion.direction, null, criterion.key);
      else assert.ok(['lower', 'higher'].includes(criterion.direction), criterion.key);
    }
    assert.equal(new Set(CRITERION_KEYS).size, CRITERION_KEYS.length);
  });

  test("the client's bound of two to three options", () => {
    assert.equal(MIN_OPTIONS, 2);
    assert.equal(MAX_OPTIONS, 3);
  });
});

describe('the comparison table', () => {
  test('one row per criterion, one cell per option, and the best cell named', () => {
    const result = compareOptions({
      options: [option('a', { cost: DA(1_000), liquidity: 8 }), option('b', { cost: DA(600), liquidity: 3 })],
      criteria: ['cost', 'liquidity'],
    });
    assert.equal(result.criteria.length, 2);
    const cost = result.criteria.find((row) => row.criterion === 'cost');
    assert.deepEqual(cost.values, { a: DA(1_000), b: DA(600) });
    // A cost: less is better. Liquidity: more is better. The direction travels
    // with the row so the reader can check the highlight.
    assert.deepEqual(cost.best, ['b']);
    assert.equal(cost.direction, 'lower');
    assert.deepEqual(result.criteria.find((row) => row.criterion === 'liquidity').best, ['a']);
  });

  test('no weights, no score: a ranking nobody can reproduce is never produced', () => {
    const result = compareOptions({ options: [option('a', { cost: 1 }), option('b', { cost: 2 })], criteria: ['cost'] });
    assert.equal(result.scores, null);
  });

  test('with weights, the score comes with its method and its weights', () => {
    const result = compareOptions({
      options: [option('a', { cost: DA(1_000), risk: 2 }), option('b', { cost: DA(2_000), risk: 8 })],
      criteria: ['cost', 'risk'],
      weights: { cost: 1, risk: 1 },
    });
    // Both criteria favour A, so A scores the maximum and B the minimum.
    assert.equal(result.scores.a.resultat, 1);
    assert.equal(result.scores.b.resultat, 0);
    assert.equal(result.scores.a.formule_id, 'F054');
    assert.equal(result.scores.a.hypotheses.normalisation, 'min-max sur les options comparées');
    assert.deepEqual(result.weights, { cost: 1, risk: 1 });
  });

  test('a weight of zero, or a weight on a criterion not compared, changes nothing', () => {
    const options = [option('a', { cost: DA(1_000), risk: 2 }), option('b', { cost: DA(2_000), risk: 8 })];
    const onlyCost = compareOptions({ options, criteria: ['cost', 'risk'], weights: { cost: 1, risk: 0 } });
    const costAlone = compareOptions({ options, criteria: ['cost'], weights: { cost: 1 } });
    assert.equal(onlyCost.scores.a.resultat, costAlone.scores.a.resultat);
  });

  test('a criterion that gives every option the same value is shown but left out of the score', () => {
    const result = compareOptions({
      options: [option('a', { cost: DA(500), fees: DA(100) }), option('b', { cost: DA(900), fees: DA(100) })],
      criteria: ['cost', 'fees'],
      weights: { cost: 1, fees: 5 },
    });
    const fees = result.criteria.find((row) => row.criterion === 'fees');
    assert.equal(fees.separates, false, 'identical values cannot separate the options');
    assert.deepEqual(fees.values, { a: DA(100), b: DA(100) });
    // The heavy weight on the flat criterion must not dilute the score: only
    // the criteria that actually separate are used, and that is said.
    assert.equal(result.scores.a.resultat, 1);
    assert.deepEqual(result.scores.a.hypotheses.criteres_ecartes, ['fees']);
  });

  test('a missing value stays missing: never a zero, never scored', () => {
    const result = compareOptions({
      options: [option('a', { cost: DA(1_000) }), option('b', {})],
      criteria: ['cost'],
      weights: { cost: 1 },
    });
    assert.equal(result.criteria[0].values.b, null);
    assert.deepEqual(result.warnings, [{ criterion: 'cost', missing: ['b'] }]);
    // With one value known out of two, min-max has nothing to scale against.
    assert.equal(result.criteria[0].separates, false);
    assert.deepEqual(result.criteria[0].best, [], 'no "best" can be named while a value is unknown');
    assert.equal(result.scores, null);
  });

  test('text is shown, never scored', () => {
    const result = compareOptions({
      options: [option('a', { conditions: 'Sans frais la première année', cost: 1 }), option('b', { conditions: 'Frais dès le premier mois', cost: 2 })],
      criteria: ['conditions', 'cost'],
      weights: { conditions: 10, cost: 1 },
    });
    const conditions = result.criteria.find((row) => row.criterion === 'conditions');
    assert.equal(conditions.direction, null);
    assert.deepEqual(conditions.best, []);
    assert.deepEqual(result.scores.a.hypotheses.criteres_ecartes, ['conditions']);
  });

  test('different currencies are refused, not converted at an invented rate', () => {
    assert.throws(
      () =>
        compareOptions({
          options: [option('a', { cost: 1 }, { currency: 'DZD' }), option('b', { cost: 2 }, { currency: 'EUR' })],
          criteria: ['cost'],
        }),
      (error) => error instanceof NotComparableError && error.field === 'currency',
    );
  });

  test('different horizons are refused: the caller normalises first', () => {
    assert.throws(
      () =>
        compareOptions({
          options: [option('a', { cost: 1 }, { horizonMonths: 12 }), option('b', { cost: 2 }, { horizonMonths: 60 })],
          criteria: ['cost'],
        }),
      (error) => error instanceof NotComparableError && error.field === 'horizonMonths',
    );
  });

  test('fewer than two options, more than three, or an unknown criterion: no comparison', () => {
    assert.equal(compareOptions({ options: [option('a', { cost: 1 })], criteria: ['cost'] }), null);
    assert.equal(compareOptions({ options: Array.from({ length: 4 }, (_, i) => option(`o${i}`, { cost: i })), criteria: ['cost'] }), null);
    assert.equal(compareOptions({ options: [option('a', { cost: 1 }), option('b', { cost: 2 })], criteria: ['karma'] }), null);
    assert.equal(compareOptions({ options: [option('a', { cost: 1 }), option('a', { cost: 2 })], criteria: ['cost'] }), null);
  });
});

describe('job offers (ET08)', () => {
  const offer = (label, extra) => ({
    label,
    net: DA(70_000),
    bonuses: 0,
    monetisableBenefits: 0,
    transportCost: 0,
    mealCost: 0,
    annualJobCosts: 0,
    commuteMinutes: 0,
    ...extra,
  });

  test("the net economic value is the client's formula, and the costs are deducted", () => {
    const { offers } = compareJobOffers({
      currency: 'DZD',
      offers: [
        offer('A', { bonuses: DA(5_000), monetisableBenefits: DA(3_000), transportCost: DA(8_000), mealCost: DA(6_000) }),
        offer('B', { transportCost: DA(15_000) }),
      ],
    });
    // 70 000 + (5 000 + 3 000) - (8 000 + 6 000)
    assert.equal(offers[0].resultats.netEconomique.resultat, DA(64_000));
    assert.equal(offers[0].resultats.netEconomique.formule_id, 'F048');
    assert.equal(offers[0].resultats.coutsEmploi.resultat, DA(14_000));
    assert.equal(offers[1].resultats.netEconomique.resultat, DA(55_000));
  });

  test('a yearly cost is brought back to the month before being compared', () => {
    const { offers } = compareJobOffers({ currency: 'DZD', offers: [offer('A', { annualJobCosts: DA(12_000) }), offer('B')] });
    assert.equal(offers[0].resultats.coutMensuelAnnualise.resultat, DA(1_000));
    assert.equal(offers[0].resultats.coutMensuelAnnualise.formule_id, 'F049');
    assert.equal(offers[0].resultats.netEconomique.resultat, DA(69_000));
  });

  test('a benefit nobody can price stays out of the figures and is returned apart', () => {
    const { offers, comparison } = compareJobOffers({
      currency: 'DZD',
      offers: [offer('A', { nonMonetisableBenefits: 'Télétravail deux jours par semaine' }), offer('B')],
    });
    assert.equal(offers[0].nonMonetisableBenefits, 'Télétravail deux jours par semaine');
    assert.equal(offers[1].nonMonetisableBenefits, null);
    // It changed no number: both offers are identical on every criterion.
    assert.equal(offers[0].resultats.netEconomique.resultat, offers[1].resultats.netEconomique.resultat);
    assert.ok(comparison.criteria.every((row) => row.separates === false));
  });

  test('the commute is compared as time and never priced', () => {
    const { comparison } = compareJobOffers({
      currency: 'DZD',
      offers: [offer('A', { commuteMinutes: 90 }), offer('B', { commuteMinutes: 30 })],
    });
    const commute = comparison.criteria.find((row) => row.criterion === 'commuteMinutes');
    assert.equal(commute.unit, 'count', 'minutes, not money');
    assert.equal(commute.direction, 'lower');
    assert.deepEqual(commute.best, ['o2']);
    // A shorter commute did not make the offer richer: only time differs.
    assert.equal(comparison.criteria.find((row) => row.criterion === 'netValue').separates, false);
  });

  test('a higher salary can lose once the job costs are counted', () => {
    const { offers, comparison } = compareJobOffers({
      currency: 'DZD',
      offers: [offer('Proche', { net: DA(68_000) }), offer('Loin', { net: DA(75_000), transportCost: DA(12_000), mealCost: DA(6_000) })],
    });
    assert.ok(offers[0].resultats.netEconomique.resultat > offers[1].resultats.netEconomique.resultat);
    assert.deepEqual(comparison.criteria.find((row) => row.criterion === 'netValue').best, ['o1']);
  });
});
