// The "Aujourd'hui" home screen and the dashboards per public (P6-06): screens
// C04, LY02, ET02, JA02, SA02 and tab `08_Tableaux_Bord`.
//
// This service COMPOSES. It computes nothing of its own beyond F047 and F055:
// every figure comes from the module that owns it — the synthesis of P6-04, the
// budget view of P6-05, the calendar of P6-07, the reserve of P6-09, the goals
// of P6-08, the debts of P6-10 — and arrives already wrapped in the engine's
// answer contract. That is the client's rule, « indicateurs lus dans le moteur
// P4-09, jamais recalculés côté client », applied one layer earlier: they are
// not recomputed here either.
//
// Two shapes of honesty run through it:
//   - a KPI that cannot be computed becomes an INVITATION to complete, never a
//     zero and never a blank card;
//   - a module that does not exist yet produces no KPI and no action at all.
//     An action pointing at a screen nobody built would be worse than silence.

import {
  ACTIONS_MAX,
  ACTION_PRIORITIES,
  DASHBOARD_ACTIONS,
  DATA_AGE_WARNING_DAYS,
  HEALTH_INDEX_NOT_FOR_YOUTH,
  KPI_MAX,
  MINOR_ACTIONS_MAX,
  MINOR_ALERTS_MAX,
  PERSONAL_INCOME_CATEGORY_KEYS,
  PERSONAL_INCOME_DEFINITION_VERSION,
  UPCOMING_DAYS,
  dashboardFor,
  kpiByKey,
} from '../constants/finDashboard.js';
import { isAdultAgeRange } from '../constants/finPublics.js';
import { computed, isNotComputed } from './finance/contract.js';
import { financialHealth } from './finHealth.service.js';
import { dataAgeDays, savingsRate as savingsRateOf, studentAutonomy } from './finance/formulas.js';

const DAY = 24 * 3600 * 1000;

/**
 * F047 — « autonomie financière étudiant ».
 *
 * The one figure this service computes itself, because it is the only one whose
 * inputs are a reading of the categories rather than a module's own total. The
 * definition of "personal income" is ours and versioned
 * (PERSONAL_INCOME_CATEGORY_KEYS), and the version travels in the snapshot: a
 * ratio whose definition nobody can look up is a ratio nobody can argue with.
 */
export function autonomy({ incomes = [], totalExpenses = null, currency, now = new Date() } = {}) {
  const personal = incomes.filter((income) => PERSONAL_INCOME_CATEGORY_KEYS.includes(income.categoryKey));
  const inputs = {
    definition_revenus_personnels: PERSONAL_INCOME_CATEGORY_KEYS,
    definition_version: PERSONAL_INCOME_DEFINITION_VERSION,
    revenus_personnels: personal.length,
    depenses_totales: totalExpenses,
  };
  // No personal income declared at all is not "0 % autonomous": it is a figure
  // we cannot read, because nothing says whether the person has none or has not
  // recorded any.
  if (personal.length === 0 || totalExpenses === null) {
    return computed('F047', null, { inputs, currency, now });
  }
  const own = personal.reduce((sum, income) => sum + income.monthly, 0);
  return computed('F047', studentAutonomy(own, totalExpenses), { inputs: { ...inputs, revenus_personnels_montant: own }, currency, now });
}

/**
 * F055 — the client's « bannière de qualité si une donnée est ancienne ».
 *
 * Measured on the most recent thing the person actually recorded: if nothing has
 * been touched for weeks, every figure on the screen is describing a past that
 * may have moved on. `null` when there is nothing at all — that is the empty
 * state, not stale data.
 */
export function dataQuality(lastCollectedAt, { now = new Date(), thresholdDays = DATA_AGE_WARNING_DAYS } = {}) {
  const inputs = { date_collecte: lastCollectedAt?.toISOString() ?? null, seuil_jours: thresholdDays };
  const age = lastCollectedAt ? dataAgeDays(lastCollectedAt, now) : null;
  return {
    age: computed('F055', age, { inputs, now }),
    // A fact, not a scolding: "these figures are N days old" is information the
    // person can act on.
    stale: age === null ? null : age > thresholdDays,
    seuilJours: thresholdDays,
  };
}

/**
 * One KPI card.
 *
 * `answer` is the contract the owning module produced. When it says "not
 * computable", the card carries the invitation instead — the client's « une
 * carte non calculable devient une invitation à compléter » — and the card
 * still shows which formula it would have been, so the "Pourquoi ?" panel works
 * either way.
 */
function card(key, answer) {
  const definition = kpiByKey(key);
  const missing = !answer || isNotComputed(answer);
  return {
    key,
    formule: definition?.formula ?? null,
    answer: answer ?? null,
    // The invitation is a KEY, not a sentence: the interface translates it and
    // knows which screen it points at.
    invitation: missing ? (definition?.invite ?? null) : null,
  };
}

/**
 * Assembles the dashboard of one account.
 *
 * `sources` is what the controller loaded, module by module. A source that is
 * absent (`undefined`) means the module has nothing for this account; a source
 * that is `null` means the module does not exist yet, and then neither its KPIs
 * nor its actions are ever offered.
 */
export function buildDashboard({
  publicCode = null,
  ageRange = null,
  synthesis = null,
  budget = null,
  budgetView = null,
  reserve = null,
  goals = [],
  debts = null,
  subscriptions = null,
  autonomyAnswer = null,
  // Net savings OF THE PERIOD (F007), from finSavings: F008 divides it by the
  // income of that same period, and the cumulative pool would not be a rate.
  periodSavings = null,
  upcoming = [],
  onboarding = null,
  uncategorised = 0,
  quality = null,
  currency,
  now = new Date(),
}) {
  const dashboard = dashboardFor(publicCode);
  // A minor is a minor whichever public they picked: the lycéen experience IS
  // the minors' one, and an age bracket saying under 18 settles it for anybody
  // else (the same rule as P6-03's onboarding).
  const minor = dashboard.minor === true || isAdultAgeRange(ageRange) === false;

  // The best goal to show: the one the person marked as priority, else the one
  // furthest along. One goal, not a list — this screen answers one question.
  const sortedGoals = [...goals].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || (b.view?.progres?.resultat ?? 0) - (a.view?.progres?.resultat ?? 0));
  const topGoal = sortedGoals[0] ?? null;

  // Every KPI this account could show, by key. A module that does not exist
  // yet simply has no entry, so its KPI is never offered — not even as an
  // invitation to use a screen nobody built.
  const available = new Map();
  if (synthesis) {
    available.set('netFlow', synthesis.fluxNet);
    // « Ressources du mois » : the declared resources, expected (F001). The
    // income actually received is `revenus` (PB-F004), never added to them.
    available.set('monthlyResources', synthesis.revenusPrevus);
    available.set('monthExpenses', synthesis.depenses);
  }
  if (budgetView) {
    available.set('remainingToAllocate', budgetView.resteAAffecter);
    available.set('dailyBudget', budgetView.budgetJournalier);
  }
  if (reserve) available.set('reserveMonths', reserve.moisReserve);
  if (topGoal) available.set('goalProgress', topGoal.view.progres);
  if (debts) available.set('debtEffort', debts.tauxEffort);
  if (subscriptions) available.set('subscriptionCost', subscriptions.coutMensuel);
  if (autonomyAnswer) available.set('studentAutonomy', autonomyAnswer);
  // F008 — « taux d'épargne ». Both halves must come from the same period, and
  // either being unknown makes the rate unknown rather than zero.
  if (periodSavings !== null && synthesis) {
    available.set(
      'savingsRate',
      computed('F008', savingsRateOf(periodSavings.net, synthesis.revenus?.resultat ?? null), {
        inputs: { epargne_nette_periode: periodSavings.net, revenus_periode: synthesis.revenus?.resultat ?? null, depots: periodSavings.deposits, retraits: periodSavings.withdrawals },
        currency,
        now,
      }),
    );
  }

  // A dashboard excludes what its public must never be shown: a lycéen sees no
  // debt and no real patrimony (the client's rule, enforced here on the server
  // and not only in the interface).
  const excluded = new Set(dashboard.excludes ?? []);
  const allowed = (key) => {
    const definition = kpiByKey(key);
    return definition !== null && !excluded.has(definition.needs);
  };

  // The preference order is longer than the cap on purpose: the cards shown are
  // the first that RESOLVE, so somebody with a budget sees budget figures and
  // somebody without sees the next ones down rather than empty cards. Only once
  // there are not enough resolved ones do invitations fill the rest — which is
  // exactly the client's « invitation à compléter », and never more than the
  // five the screen is allowed.
  const order = dashboard.kpis.filter(allowed);
  const resolved = order.filter((key) => available.has(key) && !isNotComputed(available.get(key)));
  const unresolved = order.filter((key) => !resolved.includes(key) && available.has(key));
  const kpis = [...resolved, ...unresolved].slice(0, KPI_MAX).map((key) => card(key, available.get(key)));

  // ---- alerts -------------------------------------------------------------
  // Only facts: an envelope past one of ITS OWN declared thresholds (P6-05),
  // and nothing else. No alert is invented from a threshold nobody set.
  const alerts = (budgetView?.alertes ?? [])
    .filter((alert) => alert.niveau === 'exceeded' || alert.niveau === 'reached')
    .map((alert) => ({ key: 'envelopeExceeded', level: alert.niveau, enveloppe: alert.enveloppe, categoryId: alert.categoryId, taux: alert.taux }));
  const cappedAlerts = minor ? alerts.slice(0, MINOR_ALERTS_MAX) : alerts;

  // ---- actions ------------------------------------------------------------
  // « 1 à 3 actions au maximum », in the client's own priority order:
  // sécurité > échéance > budget > apprentissage.
  const reasons = new Map();
  if (upcoming.length > 0) reasons.set('confirmPlanned', { count: upcoming.length, jours: UPCOMING_DAYS });
  if (alerts.length > 0) reasons.set('envelopeExceeded', { count: alerts.length });
  if (reserve && isNotComputed(reserve.moisReserve)) reasons.set('buildReserve', {});
  if (uncategorised > 0) reasons.set('categoriseMovements', { count: uncategorised });
  if (onboarding && onboarding.remaining > 0) reasons.set('finishOnboarding', { remaining: onboarding.remaining });
  if (!budget) reasons.set('createBudget', {});
  if (synthesis && isNotComputed(synthesis.depenses)) reasons.set('addMovement', {});

  const actions = DASHBOARD_ACTIONS.filter((action) => reasons.has(action.key) && !excluded.has(action.needs))
    .sort((a, b) => ACTION_PRIORITIES.indexOf(a.priority) - ACTION_PRIORITIES.indexOf(b.priority))
    .slice(0, minor ? MINOR_ACTIONS_MAX : ACTIONS_MAX)
    .map((action) => ({ key: action.key, priority: action.priority, to: action.to, contexte: reasons.get(action.key) }));

  // ---- santé financière (F053) -------------------------------------------
  // Les mesures viennent des modules qui les possèdent ; aucune n'est
  // recalculée ici. Celles qu'aucun module ne fournit encore — l'écart au plan
  // des objectifs, l'historique de régularité du revenu, la complétude des
  // données — restent ABSENTES, donc hors du calcul, et le score l'annonce.
  // Les mettre à zéro ferait baisser la note de quelqu'un pour une donnée que
  // personne ne lui a demandée.
  const income = synthesis?.revenus?.resultat ?? null;
  const netFlowValue = synthesis?.fluxNet?.resultat ?? null;
  const health = financialHealth(
    {
      balance: income && income !== 0 && netFlowValue !== null ? netFlowValue / income : null,
      reserveMonths: reserve?.moisReserve?.resultat ?? null,
      debtRatio: debts?.tauxEffort?.resultat ?? null,
      savingsRate: available.get('savingsRate')?.resultat ?? null,
      goalsGap: null,
      // P8-16: real spending over the active budget's envelopes.
      budgetConsumption: budgetConsumptionOf(budgetView),
      dataQuality: {},
    },
    { now },
  );

  return {
    currency,
    publicCode,
    // The i18n key of this dashboard's own title (« Ma semaine », « Premier
    // revenu »...), never a sentence: it is translated like everything else.
    titre: dashboard.title,
    minor,
    kpis,
    alertes: cappedAlerts,
    actions,
    // What is coming up in the next few days. The calendar owns these rows; the
    // home screen only shows the nearest ones.
    echeances: upcoming,
    objectifPrioritaire: topGoal ? { id: topGoal.id, label: topGoal.label, progres: topGoal.view.progres, reste: topGoal.view.reste } : null,
    qualite: quality,
    // « Santé financière personnelle » (F053), enfin calculée : le
    // référentiel maître du client fournit les pondérations qui manquaient
    // (P6-22, chantier 2). Elle reste PARTIELLE tant que toutes les
    // dimensions ne sont pas mesurables, et elle le dit elle-même.
    //
    // Pas d'indice global pour un compte jeune : le client exclut l'alerte
    // adulte sur la réserve d'un lycéen, et une note « Priorité sécurité »
    // affichée à un adolescent est le même jugement d'adulte.
    santeFinanciere: minor ? HEALTH_INDEX_NOT_FOR_YOUTH : health,
    // Period the figures describe, so the screen can say what it is showing.
    periode: synthesis ? { debut: null, fin: null } : null,
    calculeLe: now.toISOString(),
  };
}

// « Respect des budgets » (P8-16): what the envelopes really consumed over
// what they allocate — null without a budget or without any allocation.
function budgetConsumptionOf(view) {
  if (!view?.enveloppes?.length) return null;
  const allocated = view.enveloppes.reduce((sum, line) => sum + line.prevu + (line.report ?? 0), 0);
  if (allocated <= 0) return null;
  return view.enveloppes.reduce((sum, line) => sum + line.reel, 0) / allocated;
}
