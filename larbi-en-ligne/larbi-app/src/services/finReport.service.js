// The monthly report (P8-10, tab 14_Synthese_Rapports): sections R-01 to
// R-12, each one read from the module that owns its figures — this service
// computes nothing of its own beyond the comparison with the previous month
// (PB-F023). Real and fictional stay apart: every figure here is real.
//
// « Versionné » (ARC-10): the report says which layout it follows
// (`REPORT_VERSION`), when it was produced, and every figure keeps its own
// formula id and version from the engine's answer contract — a report read in
// six months says exactly how each number was obtained.
import { accountsWithBalances } from './finAccount.service.js';
import { buildBudgetView } from './finBudgetView.service.js';
import { currentBudget, loadBudgetData } from './finBudget.service.js';
import { methodAnalysis } from './finBudgetMethods.service.js';
import { buildDebtSynthesis, listDebts } from './finDebt.service.js';
import { buildGoalView, goalsWithCapital, listGoals } from './finGoal.service.js';
import { clearingView } from './finMovement.service.js';
import { markedSavingsInPeriod } from './finSavings.service.js';
import { isReal } from './finance/dataModel.js';
import { buildReserveView } from './finReserve.service.js';
import { buildSynthesis, debtRatioIncome, loadSynthesisData } from './finSynthesis.service.js';
import { buildWealthView, listAssets } from './finWealth.service.js';
import { computed } from './finance/contract.js';

export const REPORT_VERSION = 1;

const DAY = 24 * 3600 * 1000;

// The first and last instant of a month given as `YYYY-MM`.
export function monthBounds(month) {
  const [year, index] = month.split('-').map(Number);
  const start = new Date(Date.UTC(year, index - 1, 1));
  const end = new Date(Date.UTC(year, index, 1) - 1);
  return { start, end };
}

const previousMonthKey = (month) => {
  const [year, index] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, index - 2, 1));
  return date.toISOString().slice(0, 7);
};

// PB-F023 — (period − previous) / |previous|, not computable on a zero base.
const trend = (current, previous, { currency, now }) =>
  computed('PB-F023', current === null || previous === null || previous === 0 ? null : (current - previous) / Math.abs(previous), {
    inputs: { periode: current, periode_precedente: previous },
    currency,
    now,
  });

/**
 * Two months of the person's choosing, side by side (P8-24, the Synthèse's
 * « comparer deux mois »). Everything comes from the monthly report itself —
 * `buildMonthlyReport` for each month — and the change from one to the other is
 * PB-F023 (`(B − A) / |A|`, not computable on a zero base). Nothing is
 * recomputed by the screen, and nothing is judged: a figure and its change.
 */
export async function compareMonths(prisma, user, { month, other, now = new Date(), wealthFromAccounts }) {
  const [a, b] = await Promise.all([
    buildMonthlyReport(prisma, user, { month, now, wealthFromAccounts }),
    buildMonthlyReport(prisma, user, { month: other, now, wealthFromAccounts }),
  ]);
  const currency = a.currency;
  const change = (field) => trend(b.sections.R01[field].resultat, a.sections.R01[field].resultat, { currency, now });
  // The categories of both months, each with its two amounts (null: not among the top five that month).
  const keys = new Map();
  for (const [side, report] of [['a', a], ['b', b]]) {
    for (const row of report.sections.R03.topCategories) {
      const key = row.categoryId ?? 'none';
      keys.set(key, { ...(keys.get(key) ?? { categoryId: row.categoryId ?? null, label: row.label, a: null, b: null }), [side]: row.total });
    }
  }
  return {
    currency,
    mois: { a: month, b: other },
    revenus: { a: a.sections.R01.revenus, b: b.sections.R01.revenus, variation: change('revenus') },
    depenses: { a: a.sections.R01.depenses, b: b.sections.R01.depenses, variation: change('depenses') },
    fluxNet: { a: a.sections.R01.fluxNet, b: b.sections.R01.fluxNet, variation: change('fluxNet') },
    categories: [...keys.values()].sort((x, y) => (y.b ?? y.a ?? 0) - (x.b ?? x.a ?? 0)),
  };
}

// AN-F002 and the monthly cascade (G-10) read the real expenses by what they
// are: essential or flexible, by the flag the reference gives each category
// and the person may change (AN-F001, « classification visible »).
const isDebtGroup = (row) => row.category?.group === 'Dettes & engagements';

/**
 * R-06 and the cascade, from the period's real movements.
 *
 * `reduction` is the share of the flexible spending the person imagines
 * cutting (AN-F010, 0 to 100 %): THEIR figure, simulation only — nothing is
 * saved, nothing is advised. The scenario savings are the current capacity
 * plus that reduction (AN-F009), and the scenario rate is over realised
 * income (AN-F011).
 */
export function savingsScenarioAndCascade(movements, { currency, reduction = 0.1, saved = 0, now }) {
  const real = movements.filter((row) => row.currency === currency && !row.planned && isReal(row) && row.category?.family !== 'goal');
  const sum = (rows) => rows.reduce((total, row) => total + row.value, 0);
  const expenses = real.filter((row) => row.kind === 'expense');
  const income = sum(real.filter((row) => row.kind === 'income'));
  const essential = expenses.filter((row) => row.category?.essential === true && !isDebtGroup(row));
  const debt = expenses.filter((row) => isDebtGroup(row));
  const flexible = expenses.filter((row) => !(row.category?.essential === true) && !isDebtGroup(row));
  const flexibleTotal = sum(flexible);
  const capacity = income - sum(expenses);
  const cut = Math.round(flexibleTotal * reduction);
  const inputs = { revenus_realises: income, depenses_flexibles: flexibleTotal, reduction_saisie: reduction };
  const answer = (id, result) => computed(id, result, { inputs, currency, now });
  const hasData = income > 0 || expenses.length > 0;
  return {
    scenario: {
      depensesFlexibles: answer('AN-F002', hasData ? flexibleTotal : null),
      reduction,
      reductionSimulee: answer('AN-F010', hasData ? cut : null),
      epargneScenario: answer('AN-F009', hasData ? capacity + cut : null),
      tauxEpargneScenario: answer('AN-F011', income > 0 ? (capacity + cut) / income : null),
    },
    // Revenus → charges → dette → flexibles → épargne → reste: the month in
    // one line, each step a plain total (nothing here is a formula).
    cascade: hasData
      ? [
          { cle: 'income', montant: income },
          { cle: 'essential', montant: -sum(essential) },
          { cle: 'debt', montant: -sum(debt) },
          { cle: 'flexible', montant: -flexibleTotal },
          { cle: 'saved', montant: -saved },
          { cle: 'left', montant: income - sum(expenses) - saved },
        ]
      : [],
  };
}

export async function buildMonthlyReport(prisma, user, { month, now = new Date(), wealthFromAccounts, reduction = 0.1 }) {
  const userId = user.id;
  const currency = user.finCurrency;
  const period = monthBounds(month);
  const previous = monthBounds(previousMonthKey(month));
  // A month still running is read up to today.
  const until = period.end > now ? now : period.end;

  const [data, previousData, accountsEnd, accountsStart, budget, goalRows, debtRows, assets, quality] = await Promise.all([
    loadSynthesisData(prisma, userId, period),
    loadSynthesisData(prisma, userId, previous),
    accountsWithBalances(prisma, userId, { now: until }),
    accountsWithBalances(prisma, userId, { now: new Date(period.start.getTime() - 1) }),
    currentBudget(prisma, userId, new Date(Math.min(until.getTime(), period.start.getTime() + 14 * DAY))),
    listGoals(prisma, userId),
    listDebts(prisma, userId),
    listAssets(prisma, userId),
    clearingView(prisma, userId, { from: period.start, to: until, now }),
  ]);

  // R-01 — the summary of the month, and its comparison with the previous one.
  const synthesis = buildSynthesis({ ...data, fallbackCurrency: currency, period, now });
  const before = buildSynthesis({ ...previousData, fallbackCurrency: currency, period: previous, now });
  const r01 = {
    revenus: synthesis.revenus,
    depenses: synthesis.depenses,
    fluxNet: synthesis.fluxNet,
    tendance: {
      revenus: trend(synthesis.revenus.resultat, before.revenus.resultat, { currency, now }),
      depenses: trend(synthesis.depenses.resultat, before.depenses.resultat, { currency, now }),
      fluxNet: trend(synthesis.fluxNet.resultat, before.fluxNet.resultat, { currency, now }),
    },
    moisPrecedent: { revenus: before.revenus.resultat, depenses: before.depenses.resultat, fluxNet: before.fluxNet.resultat },
  };

  // R-02 — accounts: balance at the start and at the end, and what changed.
  const startById = new Map(accountsStart.accounts.map((account) => [account.id, account.solde.resultat]));
  const r02 = accountsEnd.accounts
    .filter((account) => !account.archivedAt)
    .map((account) => ({
      id: account.id,
      label: account.label,
      currency: account.currency,
      inclusDansTotal: account.includeInTotal,
      debut: startById.get(account.id) ?? null,
      fin: account.solde.resultat,
      variation: startById.has(account.id) ? account.solde.resultat - startById.get(account.id) : null,
    }));

  // R-03 — spending: the top categories and the average per day (PB-F011).
  const ids = synthesis.repartition.map((row) => row.categoryId).filter(Boolean);
  const labels = new Map((await prisma.finCategory.findMany({ where: { id: { in: ids } }, select: { id: true, label: true } })).map((row) => [row.id, row.label]));
  const daysElapsed = Math.max(1, Math.round((until.getTime() - period.start.getTime()) / DAY) + (until === now ? 1 : 0));
  const r03 = {
    topCategories: synthesis.repartition.slice(0, 5).map((row) => ({ ...row, label: row.categoryId ? (labels.get(row.categoryId) ?? null) : null })),
    moyenneJournaliere: computed('PB-F011', synthesis.depenses.resultat === null ? null : Math.round(synthesis.depenses.resultat / daysElapsed), {
      inputs: { depenses: synthesis.depenses.resultat, jours_ecoules: daysElapsed },
      currency,
      now,
    }),
    nonCategorisees: synthesis.nonCategorisees,
  };

  // R-04 / R-05 — the budget of the month and, when there is one, the 50/30/20
  // reading (an analysis, never a verdict).
  let r04 = null;
  let r05 = null;
  if (budget) {
    const budgetData = await loadBudgetData(prisma, userId, budget);
    const view = buildBudgetView({ budget, ...budgetData, now: until });
    r04 = { label: budget.label, prevu: view.totalPrevu, reel: view.totalReel, reste: view.ecart, depassement: view.depassement, projection: view.projectionFinPeriode };
    r05 = await methodAnalysis(prisma, userId, { method: 'M-01', budget, view, movements: budgetData.movements });
  }

  // R-06 and the cascade (G-10).
  const periodSavings = await markedSavingsInPeriod(prisma, userId, currency, { from: period.start, to: until });
  const r06 = savingsScenarioAndCascade(data.movements, { currency, reduction, saved: periodSavings.net ?? 0, now });

  // R-07 / R-08 — goals and the emergency fund.
  const goals = await goalsWithCapital(prisma, userId, goalRows.filter((goal) => goal.status !== 'fictional'));
  const r07 = goals.map((goal) => ({ id: goal.id, label: goal.label, progressStatus: goal.progressStatus, vue: buildGoalView(goal, { now }) }));
  const reserve = await buildReserveView(prisma, userId, { currency, targetMonths: user.finReserveTargetMonths ?? null, now });
  const r08 = { moisReserve: reserve.moisReserve, cible: reserve.cibleMontant, manque: reserve.manque };

  // R-09 — debts (receivables kept apart by the synthesis itself).
  const r09 = debtRows.length === 0 ? null : buildDebtSynthesis(debtRows, { netMonthlyIncome: debtRatioIncome(synthesis), currency, now });

  // R-10 — the real patrimony (PB-F024), read like the patrimony screen.
  const { assets: wealthAssets, liabilities } = wealthFromAccounts({ declared: assets, debts: debtRows, accounts: accountsEnd.accounts, now });
  const wealth = buildWealthView({ assets: wealthAssets, debts: liabilities, currency, now });
  const r10 = { patrimoineNet: wealth.patrimoineNet, totalActifs: wealth.totalActifs, totalDettes: wealth.totalDettes };

  // R-11 — quality: the clearing rate (AN-F004) and what is missing.
  const r11 = { tauxPointage: quality.taux, nonPointees: quality.counts.unchecked + quality.counts.to_verify, nonCategorisees: synthesis.nonCategorisees };

  return {
    version: REPORT_VERSION,
    genereLe: now.toISOString(),
    mois: month,
    periode: { debut: period.start, fin: period.end, luJusquAu: until },
    cascade: r06.cascade,
    currency,
    sections: { R01: r01, R02: r02, R03: r03, R04: r04, R05: r05, R06: r06.scenario, R07: r07, R08: r08, R09: r09, R10: r10, R11: r11 },
  };
}

// The report as rows « section ; indicateur ; valeur ; formule ; version » —
// the shape of the CSV and of the spreadsheet. Amounts stay in centimes, as
// stored, so the export adds up exactly to the screen.
export function reportRows(report) {
  const rows = [];
  const add = (section, label, answer) => {
    if (answer === null || answer === undefined) return;
    if (typeof answer === 'object' && 'resultat' in answer) rows.push([section, label, answer.resultat, answer.unite, answer.formule_id, answer.formule_version]);
    else rows.push([section, label, answer, '', '', '']);
  };
  const s = report.sections;
  add('R-01', 'Revenus', s.R01.revenus);
  add('R-01', 'Dépenses', s.R01.depenses);
  add('R-01', 'Flux net', s.R01.fluxNet);
  add('R-01', 'Tendance des dépenses', s.R01.tendance.depenses);
  for (const account of s.R02) {
    add('R-02', `${account.label} — début`, account.debut);
    add('R-02', `${account.label} — fin`, account.fin);
  }
  for (const row of s.R03.topCategories) add('R-03', row.label ?? 'Sans catégorie', row.total);
  add('R-03', 'Moyenne par jour', s.R03.moyenneJournaliere);
  if (s.R04) {
    add('R-04', 'Budget prévu', s.R04.prevu);
    add('R-04', 'Dépenses dans les enveloppes', s.R04.reel);
    add('R-04', 'Reste', s.R04.reste);
  }
  add('R-06', 'Dépenses flexibles', s.R06.depensesFlexibles);
  add('R-06', 'Réduction simulée', s.R06.reductionSimulee);
  add('R-06', 'Épargne du scénario', s.R06.epargneScenario);
  add('R-06', 'Taux d’épargne du scénario', s.R06.tauxEpargneScenario);
  for (const goal of s.R07) add('R-07', goal.label, goal.vue.progres);
  add('R-08', 'Mois de fonds d’urgence', s.R08.moisReserve);
  add('R-08', 'Manque', s.R08.manque);
  if (s.R09) {
    add('R-09', 'Encours', s.R09.encours);
    add('R-09', 'Ratio dette / revenu', s.R09.tauxEffort);
  }
  add('R-10', 'Patrimoine net', s.R10.patrimoineNet);
  add('R-11', 'Taux de pointage', s.R11.tauxPointage);
  add('R-11', 'Mouvements à pointer', s.R11.nonPointees);
  return rows;
}
