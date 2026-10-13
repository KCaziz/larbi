import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { autonomy, buildDashboard, dataQuality } from '../../src/services/finDashboard.service.js';
import {
  ACTIONS_MAX,
  DASHBOARDS,
  DASHBOARD_KPIS,
  DATA_AGE_WARNING_DAYS,
  HEALTH_INDEX_BLOCKED,
  KPI_KEYS,
  KPI_MAX,
  KPI_MIN,
  MINOR_ACTIONS_MAX,
  MINOR_ALERTS_MAX,
  PERSONAL_INCOME_CATEGORY_KEYS,
  dashboardFor,
} from '../../src/constants/finDashboard.js';
import { computed } from '../../src/services/finance/contract.js';

// The pure side of P6-06: the registry of dashboards, the hard limits on what a
// ten-second screen may show, the invitation that replaces an uncomputable
// card, and the two figures this service computes itself (F047, F055).

const D = (text) => new Date(`${text}T00:00:00.000Z`);
const NOW = D('2026-10-16');

const answer = (id, result, unit = 'DZD') => computed(id, result, { currency: unit, now: NOW });
const synthesisOf = (extra = {}) => ({
  fluxNet: answer('F004', 1500000),
  revenus: answer('F002', 6000000),
  depenses: answer('F003', 4500000),
  nonCategorisees: 0,
  ...extra,
});

describe('P6-06 — the registry', () => {
  test('every dashboard only names KPIs that exist', () => {
    for (const [code, dashboard] of Object.entries(DASHBOARDS)) {
      for (const key of dashboard.kpis) {
        assert.ok(KPI_KEYS.includes(key), `${code} names an unknown KPI: ${key}`);
      }
    }
  });

  test('a full dashboard offers more KPIs than the screen shows, so there is always a fallback', () => {
    // The preference order is longer than the cap on purpose: somebody without
    // a budget must still have five figures to fall back on.
    //
    // A minors' dashboard is the exception, and not an oversight: « Ma semaine »
    // is meant to be small (« 1 alerte + 1 mission max »), so five cards there
    // would contradict the client's own rule.
    for (const [code, dashboard] of Object.entries(DASHBOARDS)) {
      if (dashboard.minor) {
        assert.ok(dashboard.kpis.length <= KPI_MIN, `${code} is a minors' dashboard and must stay small`);
        continue;
      }
      assert.ok(dashboard.kpis.length >= KPI_MAX, `${code} offers only ${dashboard.kpis.length}`);
    }
  });

  test('every KPI declares the module it reads and the invitation it falls back to', () => {
    for (const kpi of DASHBOARD_KPIS) {
      assert.ok(kpi.needs, `${kpi.key} does not say what it reads`);
      assert.ok(kpi.invite, `${kpi.key} has no invitation to complete`);
    }
  });

  test('an unknown public falls back to a general dashboard rather than failing', () => {
    assert.equal(dashboardFor('NOPE').title, 'general');
    assert.equal(dashboardFor(null).title, 'general');
  });

  test("the lycéen dashboard excludes debt and never shows real patrimony", () => {
    // The client's rule, and P6-03 already enforces it on the questions: the
    // dashboard must not put back what the onboarding refuses to ask.
    assert.deepEqual(DASHBOARDS.LYC.excludes, ['debts', 'reserve']);
    assert.equal(DASHBOARDS.LYC.minor, true);
  });

  test('the overall financial-health score is declared as waiting, not computed', () => {
    // F053's weights are a threshold the client still owes (P6-01 point 5). A
    // score is a judgement on somebody, not a figure they can check, so none is
    // published on weights we invented.
    assert.equal(HEALTH_INDEX_BLOCKED.formula, 'F053');
    assert.equal(HEALTH_INDEX_BLOCKED.waitingOn, 'P6-01');
    assert.ok(!DASHBOARDS.SAL.kpis.includes('healthIndex'), 'it is not among the cards either');
  });
});

describe('P6-06 — the limits of a ten-second screen', () => {
  test('never more than five KPIs, whatever the public', () => {
    for (const code of Object.keys(DASHBOARDS)) {
      const view = buildDashboard({
        publicCode: code,
        synthesis: synthesisOf(),
        budgetView: { resteAAffecter: answer('F009', 1000000), budgetJournalier: answer('F012', 50000), alertes: [] },
        budget: { id: 'b1' },
        reserve: { moisReserve: computed('F014', 3, { now: NOW }) },
        goals: [{ id: 'g1', label: 'Ordinateur', priority: 1, view: { progres: computed('F025', 0.4, { now: NOW }), reste: answer('F026', 600000) } }],
        debts: { tauxEffort: computed('F018', 0.2, { now: NOW }) },
        subscriptions: { coutMensuel: answer('F003', 220000) },
        periodSavings: { net: 500000, deposits: 500000, withdrawals: 0 },
        currency: 'DZD',
        now: NOW,
      });
      assert.ok(view.kpis.length <= KPI_MAX, `${code} shows ${view.kpis.length}`);
      assert.ok(view.actions.length <= ACTIONS_MAX, `${code} proposes ${view.actions.length} actions`);
    }
  });

  test('a minor gets one alert and one action at most', () => {
    const view = buildDashboard({
      publicCode: 'LYC',
      synthesis: synthesisOf({ depenses: answer('F003', null) }),
      budget: null,
      budgetView: {
        resteAAffecter: answer('F009', null),
        budgetJournalier: answer('F012', null),
        alertes: [
          { enveloppe: 'e1', categoryId: 'c1', niveau: 'exceeded', taux: 1.4 },
          { enveloppe: 'e2', categoryId: 'c2', niveau: 'reached', taux: 1 },
        ],
      },
      uncategorised: 5,
      onboarding: { remaining: 3 },
      currency: 'DZD',
      now: NOW,
    });
    assert.equal(view.minor, true);
    assert.equal(view.alertes.length, MINOR_ALERTS_MAX);
    assert.equal(view.actions.length, MINOR_ACTIONS_MAX);
  });

  test('an age bracket under 18 makes a minor of any public', () => {
    // Somebody under 18 who declared themselves a salarié is still a minor, the
    // same rule P6-03 applies to the questions.
    const view = buildDashboard({ publicCode: 'SAL', ageRange: 'under18', synthesis: synthesisOf(), currency: 'DZD', now: NOW });
    assert.equal(view.minor, true);
  });

  test('a lycéen is never shown a debt figure, even when debts exist', () => {
    const view = buildDashboard({
      publicCode: 'LYC',
      synthesis: synthesisOf(),
      debts: { tauxEffort: computed('F018', 0.3, { now: NOW }) },
      reserve: { moisReserve: computed('F014', 2, { now: NOW }) },
      currency: 'DZD',
      now: NOW,
    });
    assert.ok(!view.kpis.some((kpi) => kpi.key === 'debtEffort'));
    assert.ok(!view.kpis.some((kpi) => kpi.key === 'reserveMonths'));
  });

  test('the actions come back in the client s priority order', () => {
    const view = buildDashboard({
      publicCode: 'SAL',
      synthesis: synthesisOf(),
      budget: null,
      reserve: { moisReserve: answer('F014', null) },
      upcoming: [{ kind: 'planned_expense', date: D('2026-10-18'), value: 500000, categoryId: null }],
      uncategorised: 4,
      onboarding: { remaining: 2 },
      currency: 'DZD',
      now: NOW,
    });
    // sécurité > échéance > budget > apprentissage.
    assert.deepEqual(view.actions.map((action) => action.priority), ['securite', 'echeance', 'budget']);
    assert.equal(view.actions[0].key, 'buildReserve');
    assert.ok(view.actions.every((action) => action.to.startsWith('/')), 'each action points at a screen that exists');
  });
});

describe('P6-06 — an uncomputable card becomes an invitation', () => {
  test('a figure that cannot be computed carries the invitation, never a zero', () => {
    const view = buildDashboard({
      publicCode: 'SAL',
      synthesis: synthesisOf({ fluxNet: answer('F004', null), revenus: answer('F002', null), depenses: answer('F003', null) }),
      currency: 'DZD',
      now: NOW,
    });
    const netFlow = view.kpis.find((kpi) => kpi.key === 'netFlow');
    assert.equal(netFlow.answer.resultat, null, 'not zero');
    assert.equal(netFlow.invitation, 'addMovement');
    assert.equal(netFlow.formule, 'F004', 'the card still says which formula it would have been');
  });

  test('a computed figure carries no invitation', () => {
    const view = buildDashboard({ publicCode: 'SAL', synthesis: synthesisOf(), currency: 'DZD', now: NOW });
    assert.equal(view.kpis.find((kpi) => kpi.key === 'netFlow').invitation, null);
  });

  test('a module that does not exist yet offers no card at all', () => {
    // Not even an invitation: an invitation to open a screen nobody built would
    // be worse than showing nothing.
    const view = buildDashboard({ publicCode: 'SAL', synthesis: synthesisOf(), budget: null, budgetView: null, reserve: null, debts: null, currency: 'DZD', now: NOW });
    assert.ok(!view.kpis.some((kpi) => kpi.key === 'remainingToAllocate'));
    assert.ok(!view.kpis.some((kpi) => kpi.key === 'debtEffort'));
  });

  test('computed cards come before the ones that only invite', () => {
    const view = buildDashboard({
      publicCode: 'SAL',
      synthesis: synthesisOf(),
      budget: { id: 'b1' },
      budgetView: { resteAAffecter: answer('F009', null), budgetJournalier: answer('F012', null), alertes: [] },
      reserve: { moisReserve: computed('F014', 4, { now: NOW }) },
      currency: 'DZD',
      now: NOW,
    });
    const firstInvitation = view.kpis.findIndex((kpi) => kpi.invitation !== null);
    const lastComputed = view.kpis.map((kpi) => kpi.invitation === null).lastIndexOf(true);
    assert.ok(firstInvitation === -1 || firstInvitation > lastComputed, 'what can be shown is shown first');
  });

  test('the priority goal is one goal, the furthest along or the one marked', () => {
    const view = buildDashboard({
      publicCode: 'EPG',
      synthesis: synthesisOf(),
      goals: [
        { id: 'g1', label: 'Voyage', priority: 0, view: { progres: computed('F025', 0.8, { now: NOW }), reste: answer('F026', 100000) } },
        { id: 'g2', label: 'Ordinateur', priority: 5, view: { progres: computed('F025', 0.1, { now: NOW }), reste: answer('F026', 900000) } },
      ],
      currency: 'DZD',
      now: NOW,
    });
    assert.equal(view.objectifPrioritaire.id, 'g2', 'the one the person marked wins over the one furthest along');
  });

  test('no goal at all is not an empty goal card', () => {
    const view = buildDashboard({ publicCode: 'EPG', synthesis: synthesisOf(), goals: [], currency: 'DZD', now: NOW });
    assert.equal(view.objectifPrioritaire, null);
  });
});

describe('P6-06 — F047, student autonomy', () => {
  test('only income the person earns counts as their own', () => {
    const result = autonomy({
      incomes: [
        { categoryKey: 'income.job_etudiant', monthly: 2000000 },
        { categoryKey: 'income.bourse', monthly: 1000000 },
        { categoryKey: 'income.aide_familiale', monthly: 3000000 },
      ],
      totalExpenses: 4000000,
      currency: 'DZD',
      now: NOW,
    });
    assert.equal(result.resultat, 0.5, '2 000 000 earned over 4 000 000 spent');
    assert.equal(result.formule_id, 'F047');
  });

  test('the definition travels with the figure, and says which version it is', () => {
    const result = autonomy({ incomes: [{ categoryKey: 'income.salaire_net', monthly: 1000 }], totalExpenses: 2000, currency: 'DZD', now: NOW });
    assert.deepEqual(result.entrees_snapshot.definition_revenus_personnels, PERSONAL_INCOME_CATEGORY_KEYS);
    assert.equal(result.entrees_snapshot.definition_version, 1);
  });

  test('no personal income declared is not 0 % autonomous', () => {
    const result = autonomy({ incomes: [{ categoryKey: 'income.bourse', monthly: 1000000 }], totalExpenses: 4000000, currency: 'DZD', now: NOW });
    assert.equal(result.resultat, null, 'nothing says whether they have none or recorded none');
  });

  test('unknown spending makes the ratio unknown', () => {
    const result = autonomy({ incomes: [{ categoryKey: 'income.job_etudiant', monthly: 2000000 }], totalExpenses: null, currency: 'DZD', now: NOW });
    assert.equal(result.resultat, null);
  });
});

describe('P6-06 — F055, the quality banner', () => {
  test('old data is reported with its age', () => {
    const quality = dataQuality(D('2026-08-01'), { now: NOW });
    assert.equal(quality.age.formule_id, 'F055');
    assert.equal(quality.age.resultat, 76);
    assert.equal(quality.stale, true);
    assert.equal(quality.seuilJours, DATA_AGE_WARNING_DAYS);
  });

  test('recent data raises no banner', () => {
    const quality = dataQuality(D('2026-10-14'), { now: NOW });
    assert.equal(quality.stale, false);
  });

  test('no data at all is the empty state, not stale data', () => {
    const quality = dataQuality(null, { now: NOW });
    assert.equal(quality.age.resultat, null);
    assert.equal(quality.stale, null);
  });

  test('the threshold is an argument, never hidden', () => {
    assert.equal(dataQuality(D('2026-10-01'), { now: NOW, thresholdDays: 10 }).stale, true);
    assert.equal(dataQuality(D('2026-10-01'), { now: NOW, thresholdDays: 60 }).stale, false);
  });
});

describe('P6-06 — F008, the savings rate', () => {
  test('both halves come from the same period', () => {
    const view = buildDashboard({
      publicCode: 'EPG',
      synthesis: synthesisOf(),
      periodSavings: { net: 600000, deposits: 600000, withdrawals: 0 },
      currency: 'DZD',
      now: NOW,
    });
    const rate = view.kpis.find((kpi) => kpi.key === 'savingsRate');
    assert.equal(rate.answer.resultat, 0.1, '600 000 put aside out of 6 000 000 of income');
    assert.equal(rate.answer.entrees_snapshot.revenus_periode, 6000000);
  });

  test('nothing marked as savings in the period is not a rate of zero', () => {
    const view = buildDashboard({
      publicCode: 'EPG',
      synthesis: synthesisOf(),
      periodSavings: { net: null, deposits: 0, withdrawals: 0 },
      currency: 'DZD',
      now: NOW,
    });
    const rate = view.kpis.find((kpi) => kpi.key === 'savingsRate');
    assert.equal(rate.answer.resultat, null);
    assert.equal(rate.invitation, 'addIncome');
  });
});
