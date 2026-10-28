import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  alertLevel,
  buildBudgetView,
  consumedByCategory,
  daysElapsed,
  daysInPeriod,
  daysRemaining,
  wholeCalendarMonths,
} from '../../src/services/finBudgetView.service.js';
import { isBudgetableFamily, kindForFamily, mergeProposals, proposeFromHistory, proposeFromOnboarding } from '../../src/services/finBudgetProposal.service.js';
import { nextPeriod } from '../../src/services/finBudget.service.js';
import { DEFAULT_ALERT_THRESHOLDS } from '../../src/constants/finBudget.js';

// The pure side of P6-05: periods, alert levels, the figures of one budget and
// the proposed distribution. No database, no clock — `now` is always an
// argument, so these tests say what they mean instead of depending on the day
// they run.

const D = (text) => new Date(`${text}T00:00:00.000Z`);

const budgetOf = (extra = {}) => ({
  periodStart: D('2026-10-01'),
  periodEnd: D('2026-10-31'),
  currency: 'DZD',
  alertThresholds: DEFAULT_ALERT_THRESHOLDS,
  ...extra,
});

const envelope = (extra = {}) => ({ id: 'e1', categoryId: 'c1', kind: 'variable', value: 1000000, cap: null, recurring: true, ...extra });
const spent = (extra = {}) => ({ kind: 'expense', value: 100000, currency: 'DZD', categoryId: 'c1', planned: false, status: 'real', ...extra });

describe('P6-05 — periods', () => {
  test('a period counts both of its ends', () => {
    assert.equal(daysInPeriod(D('2026-10-01'), D('2026-10-31')), 31);
    assert.equal(daysInPeriod(D('2026-02-01'), D('2026-02-28')), 28);
  });

  test('elapsed and remaining days are clamped into the period', () => {
    const [start, end] = [D('2026-10-01'), D('2026-10-31')];
    assert.equal(daysElapsed(start, end, D('2026-09-20')), 0, 'nothing has elapsed before it starts');
    assert.equal(daysElapsed(start, end, D('2026-10-16')), 16);
    assert.equal(daysElapsed(start, end, D('2026-11-05')), 31, 'everything has elapsed after it ends');
    assert.equal(daysRemaining(start, end, D('2026-10-16')), 15);
    assert.equal(daysRemaining(start, end, D('2026-11-05')), 0);
  });

  test('only a whole number of calendar months is counted as such', () => {
    assert.equal(wholeCalendarMonths(D('2026-10-01'), D('2026-10-31')), 1);
    assert.equal(wholeCalendarMonths(D('2026-10-01'), D('2026-12-31')), 3);
    assert.equal(wholeCalendarMonths(D('2026-01-01'), D('2026-12-31')), 12);
    assert.equal(wholeCalendarMonths(D('2026-02-01'), D('2026-02-28')), 1, 'February is a whole month');
    // A fortnight, and a month shifted by ten days: both would need a monthly
    // income stretched over something that is not a month.
    assert.equal(wholeCalendarMonths(D('2026-10-01'), D('2026-10-15')), null);
    assert.equal(wholeCalendarMonths(D('2026-10-10'), D('2026-11-09')), null);
  });

  test('the next period follows the calendar, not a count of days', () => {
    assert.deepEqual(nextPeriod('monthly', D('2026-01-01'), D('2026-01-31')), { periodStart: D('2026-02-01'), periodEnd: D('2026-02-28') });
    assert.deepEqual(nextPeriod('quarterly', D('2026-01-01'), D('2026-03-31')), { periodStart: D('2026-04-01'), periodEnd: D('2026-06-30') });
    assert.deepEqual(nextPeriod('yearly', D('2026-01-01'), D('2026-12-31')), { periodStart: D('2027-01-01'), periodEnd: D('2027-12-31') });
    assert.equal(nextPeriod('none', D('2026-01-01'), D('2026-01-31')), null, 'a one-off budget has no next period');
  });

  test('a period that does not start on the 1st keeps its day, clamped to the month', () => {
    // Date arithmetic overflows on its own: 31 January plus one month gives
    // 3 March, and a monthly budget would walk a little further out of the
    // calendar every period. The day is clamped to the target month instead.
    assert.deepEqual(nextPeriod('monthly', D('2026-01-31'), D('2026-02-27')), { periodStart: D('2026-02-28'), periodEnd: D('2026-03-27') });
    assert.deepEqual(nextPeriod('monthly', D('2026-01-15'), D('2026-02-14')), { periodStart: D('2026-02-15'), periodEnd: D('2026-03-14') });
  });
});

describe('P6-05 — alert levels', () => {
  test('the declared thresholds decide, and nothing else', () => {
    assert.equal(alertLevel(0.5), 'none');
    assert.equal(alertLevel(0.8), 'warning', 'the 80 % threshold is reached, not passed');
    assert.equal(alertLevel(0.95), 'warning');
    assert.equal(alertLevel(1), 'reached');
    assert.equal(alertLevel(1.3), 'exceeded');
  });

  test('a rate that is not computable raises no alert', () => {
    // An envelope of 0 gives no rate (F010: « si budget > 0 »); claiming an
    // alert on it would be inventing one.
    assert.equal(alertLevel(null), 'none');
  });

  test('a budget may declare its own thresholds', () => {
    assert.equal(alertLevel(0.65, [0.6, 1]), 'warning');
    assert.equal(alertLevel(0.65, [0.9, 1]), 'none');
  });
});

describe('P6-05 — what an envelope consumes', () => {
  test('only real, realised expenses count', () => {
    const rows = [
      spent({ value: 100000 }),
      spent({ value: 50000, planned: true }),
      spent({ value: 70000, status: 'fictional' }),
      spent({ value: 40000, kind: 'income' }),
      spent({ value: 10000, status: 'nonsense' }),
    ];
    assert.deepEqual([...consumedByCategory(rows).entries()], [['c1', 100000]]);
  });

  test('uncategorised spending is kept under its own key', () => {
    const map = consumedByCategory([spent({ categoryId: null, value: 30000 })]);
    assert.equal(map.get(null), 30000);
  });
});

describe('P6-05 — the view of one budget', () => {
  const view = (extra = {}) =>
    buildBudgetView({
      budget: budgetOf(),
      envelopes: [envelope({ id: 'e1', categoryId: 'c1', kind: 'fixed', value: 3000000 }), envelope({ id: 'e2', categoryId: 'c2', value: 2000000 })],
      now: D('2026-10-16'),
      ...extra,
    });

  test('nothing planned is not zero planned', () => {
    const empty = buildBudgetView({ budget: budgetOf(), envelopes: [], now: D('2026-10-16') });
    assert.equal(empty.totalPrevu.resultat, null);
    assert.equal(empty.totalReel.resultat, null);
    assert.ok(empty.totalPrevu.avertissements.length > 0, 'the formula says why');
  });

  test('the remainder to allocate is the resources minus the plan', () => {
    const v = view({ incomes: [{ label: 'Salaire', value: 6000000, currency: 'DZD', frequency: 'mensuel' }] });
    assert.equal(v.ressources.resultat, 6000000);
    assert.equal(v.resteAAffecter.resultat, 1000000);
    assert.equal(v.depassementRessources, false);
  });

  test('a yearly resource is a twelfth of itself, and a quarter counts three months', () => {
    const v = buildBudgetView({
      budget: budgetOf({ periodEnd: D('2026-12-31') }),
      envelopes: [envelope({ value: 1000000 })],
      incomes: [{ label: 'Bourse', value: 12000000, currency: 'DZD', frequency: 'annuel' }],
      now: D('2026-10-16'),
    });
    assert.equal(v.periode.mois, 3);
    assert.equal(v.ressources.resultat, 3000000, '1 000 000 per month over three months');
  });

  test('a resource with an unusable frequency is reported, not guessed', () => {
    const v = view({ incomes: [{ label: 'Prime', value: 500000, currency: 'DZD', frequency: 'quand-ça-vient' }] });
    assert.equal(v.ressources.resultat, null);
    assert.ok(v.avertissements.some((text) => text.includes('fréquence inutilisable')));
  });

  test('a budget above the resources is allowed and signalled', () => {
    const v = view({ incomes: [{ label: 'Salaire', value: 4000000, currency: 'DZD', frequency: 'mensuel' }] });
    assert.equal(v.resteAAffecter.resultat, -1000000);
    assert.equal(v.depassementRessources, true);
    assert.ok(v.avertissements.some((text) => text.includes('autorisé')));
  });

  test('an overspent envelope shows a negative remainder and an alert', () => {
    const v = view({ movements: [spent({ categoryId: 'c2', value: 2600000 })] });
    const line = v.enveloppes.find((row) => row.id === 'e2');
    assert.equal(line.ecart.resultat, -600000);
    assert.equal(line.tauxConsommation.resultat, 1.3);
    assert.equal(line.alerte.niveau, 'exceeded');
    assert.deepEqual(line.alerte.seuils, DEFAULT_ALERT_THRESHOLDS, 'the thresholds compared against are visible');
  });

  test('the optional ceiling is reported apart from the plan', () => {
    const v = buildBudgetView({
      budget: budgetOf(),
      envelopes: [envelope({ value: 1000000, cap: 1200000 })],
      movements: [spent({ value: 1300000 })],
      now: D('2026-10-16'),
    });
    assert.equal(v.enveloppes[0].plafondDepasse, true);
    const none = buildBudgetView({ budget: budgetOf(), envelopes: [envelope({ value: 1000000 })], now: D('2026-10-16') });
    assert.equal(none.enveloppes[0].plafondDepasse, null, '"no ceiling" is not "ceiling respected"');
  });

  test('the projection extrapolates the pace, it does not forecast behaviour', () => {
    // 800 000 over 16 of 31 days.
    const v = view({ movements: [spent({ categoryId: 'c2', value: 800000 })] });
    const line = v.enveloppes.find((row) => row.id === 'e2');
    assert.equal(line.projection.resultat, 1550000);
    assert.equal(line.projection.formule_id, 'F011');
  });

  test('once the period is over there is no daily budget left to compute', () => {
    const v = view({ now: D('2026-11-10') });
    assert.equal(v.periode.joursRestants, 0);
    assert.equal(v.budgetJournalier.resultat, null, 'PB-F013: « si jours restants > 0 »');
  });

  // Diagnostic n°2, C5 (P8-04). The daily budget used to take the fixed
  // envelopes still to pay away a SECOND time from a remainder that already
  // contained them. PB-F013: max(0, budget restant) / jours restants.
  test('the daily budget is what is left of the envelopes over the remaining days (PB-F013)', () => {
    // 5 000 000 planned, nothing spent yet, 15 days left: the 3 000 000 fixed
    // envelope is part of what is left, not taken away once more.
    const untouched = view();
    assert.equal(untouched.periode.joursRestants, 15);
    assert.equal(untouched.budgetJournalier.resultat, Math.floor(5000000 / 15));
    assert.equal(untouched.budgetJournalier.formule_id, 'PB-F013');

    const spending = view({ movements: [spent({ categoryId: 'c2', value: 1000000 })] });
    assert.equal(spending.budgetJournalier.resultat, Math.floor(4000000 / 15));
  });

  test('an overspend leaves a daily budget of 0, and is reported apart', () => {
    const v = view({ movements: [spent({ categoryId: 'c2', value: 6000000 })] });
    assert.equal(v.ecart.resultat, -1000000, 'PB-F008 may be negative');
    assert.equal(v.budgetJournalier.resultat, 0, 'never a negative budget per day');
    assert.equal(v.depassement, 1000000);
    assert.equal(view().depassement, 0);
  });

  test('spending no envelope covers does not eat into the envelopes', () => {
    const v = view({ movements: [spent({ categoryId: 'c9', value: 2000000 })] });
    assert.equal(v.ecart.resultat, 5000000);
    assert.equal(v.horsEnveloppe.resultat, 2000000, 'it is shown apart');
  });

  test('the planned goal contributions are allocated outside the budget (PB-F009)', () => {
    const v = view({
      incomes: [{ label: 'Salaire', value: 6000000, currency: 'DZD', frequency: 'mensuel' }],
      goals: [{ currency: 'DZD', monthlyContribution: 500000 }, { currency: 'DZD', monthlyContribution: null }, { currency: 'EUR', monthlyContribution: 9000 }],
    });
    assert.equal(v.resteAAffecter.resultat, 6000000 - 5000000 - 500000);
    assert.equal(v.resteAAffecter.formule_id, 'PB-F009');
    assert.equal(v.resteAAffecter.entrees_snapshot.allocations_hors_budget, 500000);
  });

  test('the monthly provisions are allocated outside the budget too (client’s answer C2)', () => {
    // 1 200 000 still to set aside, due in March 2027: 5 months from October
    // (F045) → 240 000 a month.
    const v = view({
      incomes: [{ label: 'Salaire', value: 6000000, currency: 'DZD', frequency: 'mensuel' }],
      goals: [{ currency: 'DZD', monthlyContribution: 500000 }],
      provisions: [
        { id: 'p1', label: 'Rentrée', value: 1500000, provisioned: 300000, currency: 'DZD', targetDate: D('2027-03-15') },
        { id: 'p2', label: 'Déjà réunie', value: 100000, provisioned: 100000, currency: 'DZD', targetDate: D('2027-01-15') },
      ],
    });
    assert.equal(v.resteAAffecter.resultat, 6000000 - 5000000 - 500000 - 240000);
    assert.equal(v.resteAAffecter.entrees_snapshot.provisions, 240000);
    assert.equal(v.resteAAffecter.entrees_snapshot.contributions_objectifs, 500000);
  });

  test('the net flow is received income minus real spending, not expected income (PB-F006)', () => {
    const incomes = [{ label: 'Salaire', value: 6000000, currency: 'DZD', frequency: 'mensuel' }];
    const before = view({ incomes, movements: [spent({ categoryId: 'c2', value: 1000000 })] });
    assert.equal(before.fluxNet.resultat, null, 'the salary has not arrived: nothing to compare yet');

    const after = view({ incomes, movements: [spent({ categoryId: 'c2', value: 1000000 }), spent({ id: 'in', kind: 'income', categoryId: null, value: 6000000 })] });
    assert.equal(after.fluxNet.resultat, 5000000);
    assert.equal(after.fluxNet.formule_id, 'PB-F006');
  });

  test('money set aside is not part of the real spending total (PB-F005)', () => {
    const v = view({ movements: [spent({ categoryId: 'c2', value: 400000 }), spent({ id: 's', categoryId: 'g', value: 900000, category: { family: 'goal' } })] });
    assert.equal(v.totalReel.resultat, 400000);
    assert.equal(v.totalReel.formule_id, 'PB-F005');
    assert.equal(v.totalPrevu.formule_id, 'PB-F007');
  });

  test('a row in another currency is not converted and is reported', () => {
    const v = view({
      movements: [spent({ categoryId: 'c2', value: 500000, currency: 'EUR' })],
      incomes: [{ label: 'Salaire', value: 4000, currency: 'EUR', frequency: 'mensuel' }],
    });
    assert.equal(v.enveloppes.find((row) => row.id === 'e2').reel, 0);
    assert.equal(v.ressources.resultat, null);
    assert.equal(v.avertissements.filter((text) => text.includes('autre devise')).length, 2);
  });

  test('spending no envelope covers is kept apart', () => {
    const v = view({ movements: [spent({ categoryId: 'c9', value: 300000 })] });
    assert.equal(v.horsEnveloppe.resultat, 300000);
    const nothing = view();
    assert.equal(nothing.horsEnveloppe.resultat, null, 'no spending outside is not zero outside');
  });

  test('the alerts come back worst first', () => {
    const v = view({
      movements: [spent({ categoryId: 'c1', value: 2500000 }), spent({ categoryId: 'c2', value: 2600000 })],
    });
    assert.deepEqual(
      v.alertes.map((alert) => [alert.categoryId, alert.niveau]),
      [
        ['c2', 'exceeded'],
        ['c1', 'warning'],
      ],
    );
  });

  test('every figure carries its formula, its inputs and its date', () => {
    const v = view();
    for (const key of ['totalPrevu', 'totalReel', 'ressources', 'resteAAffecter', 'ecart', 'budgetJournalier', 'fluxNet', 'horsEnveloppe']) {
      assert.ok(v[key].formule_id, `${key} says which formula`);
      assert.ok(v[key].calcule_le, `${key} says when`);
      assert.equal(v[key].unite, 'DZD');
      assert.equal(v[key].entrees_snapshot.jours_periode, 31);
      assert.deepEqual(v[key].entrees_snapshot.seuils_alerte, DEFAULT_ALERT_THRESHOLDS, 'the thresholds are never hidden');
    }
  });
});

describe('P6-05 — the proposed distribution', () => {
  test('a family decides the default kind, and only income is never budgetable', () => {
    assert.equal(kindForFamily('fixed'), 'fixed');
    assert.equal(kindForFamily('debt'), 'fixed');
    assert.equal(kindForFamily('variable'), 'variable');
    assert.equal(kindForFamily('seasonal'), 'variable');
    assert.equal(isBudgetableFamily('income'), false);
    for (const family of ['fixed', 'variable', 'seasonal', 'goal', 'asset', 'debt', 'shared']) {
      assert.equal(isBudgetableFamily(family), true, `${family} can be budgeted`);
    }
  });

  test('history proposes the monthly average and shows both numbers', () => {
    const rows = [
      { categoryId: 'c1', family: 'variable', label: 'Alimentation', total: 2700000 },
      { categoryId: 'c2', family: 'fixed', label: 'Loyer', total: 9000000 },
      { categoryId: 'c3', family: 'income', label: 'Salaire net', total: 18000000 },
    ];
    const proposals = proposeFromHistory(rows, { months: 3, currency: 'DZD' });
    assert.equal(proposals.length, 2, 'an income category is never proposed as an envelope');
    assert.deepEqual(
      proposals.map((line) => [line.categoryId, line.propose, line.kind, line.moisObserves]),
      [
        ['c2', 3000000, 'fixed', 3],
        ['c1', 900000, 'variable', 3],
      ],
    );
    assert.equal(proposals[0].observe.formule_id, 'F003');
    assert.equal(proposals[0].observe.entrees_snapshot.total_observe, 9000000, 'the observed total stays visible next to the average');
  });

  test('a window of zero months proposes nothing rather than dividing by it', () => {
    assert.deepEqual(proposeFromHistory([{ categoryId: 'c1', family: 'variable', total: 100 }], { months: 0, currency: 'DZD' }), []);
  });

  test('the onboarding proposes its declared expenses, normalised to the month', () => {
    const questions = [
      { key: 'fixedCharges', kind: 'expense', category: 'fixed.autre_charge_fixe' },
      { key: 'food', kind: 'expense', category: 'variable.alimentation_boissons' },
      { key: 'studies', kind: 'expense', category: 'fixed.scolarite_etudes' },
      { key: 'netSalary', kind: 'resource', category: 'income.salaire_net' },
    ];
    const answers = {
      fixedCharges: { amount: 2400000, frequency: 'mensuel' },
      food: { amount: 1200000, frequency: 'annuel' },
      studies: { skipped: true },
    };
    const byKey = new Map([
      ['fixed.autre_charge_fixe', 'c1'],
      ['variable.alimentation_boissons', 'c2'],
      ['fixed.scolarite_etudes', 'c3'],
    ]);
    const proposals = proposeFromOnboarding(questions, answers, byKey, { currency: 'DZD' });
    assert.deepEqual(
      proposals.map((line) => [line.categoryId, line.propose, line.kind]),
      [
        ['c1', 2400000, 'fixed'],
        ['c2', 100000, 'variable'],
      ],
    );
    assert.equal(proposals[0].observe.formule_id, 'F001');
    assert.equal(proposals[0].source, 'onboarding');
  });

  test('a question nobody was asked can never produce an envelope', () => {
    // The lycéen is never asked about debt (P6-03). Even with an answer lying
    // around, a question absent from this public's list proposes nothing.
    const answers = { debtPayment: { amount: 500000, frequency: 'mensuel' } };
    const byKey = new Map([['debt.autre_dette', 'c1']]);
    assert.deepEqual(proposeFromOnboarding([], answers, byKey, { currency: 'DZD' }), []);
  });

  test('a measurement beats an estimate, and the answer still says which', () => {
    const history = [{ categoryId: 'c1', family: 'fixed', total: 3000000, propose: 3000000, source: 'history', kind: 'fixed' }];
    const onboarding = [
      { categoryId: 'c1', family: 'fixed', propose: 2400000, source: 'onboarding', kind: 'fixed' },
      { categoryId: 'c2', family: 'variable', propose: 800000, source: 'onboarding', kind: 'variable' },
    ];
    const merged = mergeProposals(history, onboarding);
    assert.deepEqual(
      merged.map((line) => [line.categoryId, line.propose, line.source]),
      [
        ['c1', 3000000, 'history'],
        ['c2', 800000, 'onboarding'],
      ],
    );
  });
});
