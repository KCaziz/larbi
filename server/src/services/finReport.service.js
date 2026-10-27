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

export async function buildMonthlyReport(prisma, user, { month, now = new Date(), wealthFromAccounts }) {
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
    currency,
    sections: { R01: r01, R02: r02, R03: r03, R04: r04, R05: r05, R07: r07, R08: r08, R09: r09, R10: r10, R11: r11 },
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
