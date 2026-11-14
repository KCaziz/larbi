// Safety reserve (P6-09), screen C12, measured by the client's final rules
// PB-F017 to PB-F019 (P8-01 point 1). No table of its own: the capital is the
// one allocated to this account's emergency-fund goal, and the only thing the
// reserve owns outright is the target it chooses (users.finReserveTargetMonths,
// P3-18's extension). The page itself merges into « Objectifs & sécurité » in
// P8-12; the measure is corrected now (P8-04, diagnostic n°2, C3 and C4).
import { defaultEmergencyMonths } from '../constants/finGoal.js';
import { goalsWithCapital } from './finGoal.service.js';
import { ONBOARDING_QUESTIONS } from '../constants/finOnboarding.js';
import { HttpError } from '../utils/httpError.js';
import { essentialCategoryIds } from './finCategory.service.js';
import { computed } from './finance/contract.js';
import { livingAllowance, monthlyAmount, safetyFundGap, safetyFundMonths, safetyFundTarget } from './finance/formulas.js';

// The essential expenses are averaged over at most this many whole months.
const ESSENTIAL_WINDOW_MONTHS = 3;

// The goal template that IS the emergency fund (GO-01 in the client's last
// workbook; `emergency` in constants/finGoal.js).
export const EMERGENCY_GOAL_TEMPLATE = 'emergency';

// A goal IS the emergency fund when made from that model — or, made by hand
// (« Autre objectif »), when its name says so (recette R6-01): a person who
// named a goal « Fonds d'urgence » was told no emergency fund existed. The
// database collation ignores case and accents.
const EMERGENCY_NAMES = ['urgence', 'emergency', 'طوارئ'];
export const EMERGENCY_GOAL_WHERE = {
  OR: [{ templateKey: EMERGENCY_GOAL_TEMPLATE }, { templateKey: null, OR: EMERGENCY_NAMES.map((name) => ({ label: { contains: name } })) }],
};
// Its complement, written out: `NOT` over a nullable column would also drop
// every goal without a model (SQL's NULL is neither equal nor different).
export const NOT_EMERGENCY_GOAL_WHERE = {
  OR: [{ templateKey: { not: EMERGENCY_GOAL_TEMPLATE } }, { templateKey: null, NOT: EMERGENCY_NAMES.map((name) => ({ label: { contains: name } })) }],
};

const startOfDay = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
const monthsBefore = (date, months) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - months, date.getUTCDate()));

/**
 * How many WHOLE months of history lie between `first` and `now`, capped at
 * `ESSENTIAL_WINDOW_MONTHS`. 0 when the history is shorter than a month.
 *
 * Diagnostic n°2, C4: the average used to divide by 3 whatever the history,
 * so two weeks of rent and groceries became a third of themselves per month —
 * essential expenses under-estimated, months of reserve over-estimated.
 */
export function coveredMonths(first, now) {
  if (!first) return 0;
  let months = 0;
  while (months < ESSENTIAL_WINDOW_MONTHS && monthsBefore(now, months + 1).getTime() >= startOfDay(first).getTime()) months += 1;
  return months;
}

export const RESERVE_ESTIMATE_KEY = 'essentialExpenses';

/**
 * Saves the monthly estimate of essential expenses typed on the reserve screen
 * (recette R12-01). The screen used to send it as an onboarding answer, which
 * the onboarding refuses for every profile that has its own questions instead
 * (salaried: « charges fixes », student: rent, food…) — « Cette valeur n'est
 * pas valide » for them. Kept with the sign-up answers, where the reserve reads
 * the declared estimate, under the common key.
 */
export async function saveEssentialEstimate(prisma, userId, { amount, currency }) {
  const existing = await prisma.finOnboarding.findUnique({ where: { userId }, select: { id: true, answers: true, currency: true } });
  const estimate = { amount, frequency: 'mensuel', confirmed: true };
  if (!existing) {
    await prisma.finOnboarding.create({ data: { userId, currency, answers: { [RESERVE_ESTIMATE_KEY]: estimate }, fictional: false, source: 'manual', status: 'declared' } });
    return;
  }
  // The sign-up answers carry ONE currency; an estimate in another one would be
  // read as if it were in theirs.
  if (existing.currency !== currency) throw new HttpError(409, 'The sign-up answers are in another currency', { reason: 'currency' });
  await prisma.finOnboarding.update({ where: { id: existing.id }, data: { answers: { ...(existing.answers ?? {}), [RESERVE_ESTIMATE_KEY]: estimate }, version: { increment: 1 } } });
}

// What the person declared at sign-up for the essential expenses, normalised
// to the month (F001), or null. The bridge for an account whose real history
// does not yet cover one whole month.
async function declaredEssentialExpenses(prisma, userId, currency) {
  const onboarding = await prisma.finOnboarding.findUnique({ where: { userId }, select: { answers: true, currency: true } });
  if (!onboarding || onboarding.currency !== currency) return null;
  // Recette R12-01: the total corrected on the reserve screen is kept under the
  // common key, whatever the profile; when it is there it IS the estimate, and
  // replaces the detail given at sign-up (rent, transport… of a student).
  const corrected = onboarding.answers?.[RESERVE_ESTIMATE_KEY];
  if (corrected && !corrected.skipped && typeof corrected.amount === 'number') {
    const monthly = monthlyAmount(corrected.amount, corrected.frequency);
    if (monthly !== null) return monthly;
  }
  const essentialKeys = new Set(ONBOARDING_QUESTIONS.filter((q) => q.role === 'essentialExpenses').map((q) => q.key));
  let total = 0;
  let any = false;
  for (const [key, value] of Object.entries(onboarding.answers ?? {})) {
    if (!essentialKeys.has(key) || !value || value.skipped || typeof value.amount !== 'number') continue;
    const monthly = monthlyAmount(value.amount, value.frequency);
    if (monthly === null) continue;
    total += monthly;
    any = true;
  }
  return any ? total : null;
}

/**
 * The monthly essential expenses, and where the figure comes from.
 *
 * The average of the real spending on the client's « dépenses essentielles »
 * categories over the whole months the history actually covers (1 to 3).
 * Shorter than a month, the sign-up declaration is used instead, and said so;
 * without either, the figure is unknown — never a guess.
 */
export async function essentialMonthlyExpenses(prisma, userId, currency, now = new Date(), accountId = null) {
  // The categories flagged « Essentielle ? » — by the client's reference, or by
  // the person on their own categories (P8-08).
  const categoryIds = await essentialCategoryIds(prisma, userId);
  const where = {
    userId,
    deletedAt: null,
    status: 'real',
    planned: false,
    kind: 'expense',
    currency,
    categoryId: { in: categoryIds },
    // The Accueil on one account: only what that account paid.
    ...(accountId ? { accountId } : {}),
  };
  const first = await prisma.finTransaction.findFirst({ where: { ...where, occurredAt: { lte: now } }, orderBy: { occurredAt: 'asc' }, select: { occurredAt: true } });
  const months = coveredMonths(first?.occurredAt ?? null, now);

  if (months > 0) {
    const sum = await prisma.finTransaction.aggregate({ where: { ...where, occurredAt: { gte: monthsBefore(now, months), lte: now } }, _sum: { value: true } });
    return { amount: Math.round((sum._sum.value ?? 0) / months), source: 'history', months };
  }
  const declared = await declaredEssentialExpenses(prisma, userId, currency);
  if (declared !== null) return { amount: declared, source: 'declared', months: 0 };
  // Recette R9-08: less than a month of history and no estimate — what is
  // already recorded is used, never ignored: first the budget's essential
  // envelopes (what the person plans to spend on them each month), then the
  // essential expenses recorded so far (a floor, said so).
  const planned = await budgetedEssentialExpenses(prisma, userId, currency, categoryIds, now);
  if (planned !== null) return { amount: planned, source: 'budget', months: 0 };
  if (first) {
    const sum = await prisma.finTransaction.aggregate({ where: { ...where, occurredAt: { lte: now } }, _sum: { value: true } });
    if (sum._sum.value) return { amount: Math.round(sum._sum.value), source: 'recorded', months: 0 };
  }
  return { amount: null, source: null, months: 0 };
}

// The current budget's planned amount on essential categories, by the month,
// or null. An envelope on a whole group counts when the group holds an
// essential category.
async function budgetedEssentialExpenses(prisma, userId, currency, categoryIds, now) {
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const budget = await prisma.finBudget.findFirst({
    where: { userId, deletedAt: null, archivedAt: null, currency, periodStart: { lte: now }, periodEnd: { gte: today } },
    select: { periodStart: true, periodEnd: true, envelopes: { where: { deletedAt: null, archivedAt: null }, select: { categoryId: true, categoryGroup: true, value: true } } },
    orderBy: { periodStart: 'desc' },
  });
  if (!budget || budget.envelopes.length === 0) return null;
  const essential = new Set(categoryIds);
  const groups = new Set(
    (await prisma.finCategory.findMany({ where: { id: { in: categoryIds } }, select: { group: true } })).map((row) => row.group).filter(Boolean),
  );
  const total = budget.envelopes
    .filter((line) => (line.categoryId ? essential.has(line.categoryId) : groups.has(line.categoryGroup)))
    .reduce((sum, line) => sum + line.value, 0);
  if (total === 0) return null;
  // A budget of about a month is taken as is; another length is brought to the month.
  const days = Math.max(1, Math.round((budget.periodEnd - budget.periodStart) / 86400000));
  return Math.round(days >= 27 && days <= 31 ? total : (total * 30.4375) / days);
}

// PB-F018's « capital_fonds_urgence »: what is allocated to this account's
// real emergency-fund goal(s), in this currency. Diagnostic n°2, C3: the
// reserve used to be the cumulative sum of every « épargne » movement, which
// is neither a balance nor the fund the client measures.
async function emergencyFundCapital(prisma, userId, currency, accountId = null) {
  const rows = await prisma.finGoal.findMany({
    where: { userId, deletedAt: null, archivedAt: null, currency, status: { not: 'fictional' }, ...(accountId ? { accountId } : {}), ...EMERGENCY_GOAL_WHERE },
    select: { allocated: true, accountId: true },
  });
  if (rows.length === 0) return null;
  // On its own account (P8-12), the fund holds what the account holds.
  const goals = await goalsWithCapital(prisma, userId, rows);
  return goals.reduce((sum, goal) => sum + goal.allocated, 0);
}

/**
 * The person's « reste à vivre » (F006, recette R11-15): net income − fixed
 * charges − mandatory instalments, by the month. Shown beside the reserve —
 * the reserve's target stays the client's F015 (months × essential spending);
 * the reste à vivre is what pays for building it. Each part says where it
 * comes from; an unknown income or fixed charges leave it uncomputed.
 */
export async function livingAllowanceOf(prisma, userId, currency, now = new Date()) {
  const incomes = await prisma.finIncome.findMany({
    where: { userId, deletedAt: null, archivedAt: null, currency, status: { not: 'fictional' } },
    select: { value: true, frequency: true },
  });
  const netIncome = incomes.length === 0 ? null : incomes.reduce((sum, row) => sum + (monthlyAmount(row.value, row.frequency) ?? 0), 0);

  // Fixed charges: the real spending on the client's « charges fixes »
  // categories, averaged over the whole months the history covers (1 to 3).
  const fixedIds = (await prisma.finCategory.findMany({ where: { family: 'fixed', deletedAt: null, OR: [{ userId: null }, { userId }] }, select: { id: true } })).map((row) => row.id);
  const where = { userId, deletedAt: null, status: 'real', planned: false, kind: 'expense', currency, categoryId: { in: fixedIds } };
  const first = await prisma.finTransaction.findFirst({ where: { ...where, occurredAt: { lte: now } }, orderBy: { occurredAt: 'asc' }, select: { occurredAt: true } });
  const months = coveredMonths(first?.occurredAt ?? null, now);
  let fixedCharges = null;
  if (months > 0) {
    const sum = await prisma.finTransaction.aggregate({ where: { ...where, occurredAt: { gte: monthsBefore(now, months), lte: now } }, _sum: { value: true } });
    fixedCharges = Math.round((sum._sum.value ?? 0) / months);
  }
  // Recette R12-02: shorter than a month, the same bridges as the essential
  // expenses — the declared estimate, then the budget's fixed envelopes — so
  // a new account is not left with « non calculé ».
  let fixedSource = months > 0 ? 'history' : null;
  if (fixedCharges === null) {
    const declared = await declaredEssentialExpenses(prisma, userId, currency);
    if (declared !== null) [fixedCharges, fixedSource] = [declared, 'declared'];
  }
  if (fixedCharges === null) {
    const planned = await budgetedEssentialExpenses(prisma, userId, currency, fixedIds, now);
    if (planned !== null) [fixedCharges, fixedSource] = [planned, 'budget'];
  }

  const debts = await prisma.finDebt.findMany({
    where: { userId, deletedAt: null, archivedAt: null, currency, direction: { not: 'lent' } },
    select: { monthlyInstalment: true },
  });
  const instalments = debts.reduce((sum, row) => sum + (row.monthlyInstalment ?? 0), 0);

  const inputs = { revenus_nets_mensuels: netIncome, charges_fixes_mensuelles: fixedCharges, mensualites: instalments, mois_historique: months };
  const warnings = [];
  if (netIncome === null) warnings.push('Aucun revenu déclaré : le reste à vivre n’est pas encore calculé.');
  if (fixedCharges === null) warnings.push('Moins d’un mois de dépenses enregistrées et ni estimation ni budget : les charges fixes ne sont pas encore connues.');
  if (fixedSource === 'declared') warnings.push('Moins d’un mois de dépenses enregistrées : les charges fixes viennent de votre estimation.');
  if (fixedSource === 'budget') warnings.push('Moins d’un mois de dépenses enregistrées : les charges fixes viennent des enveloppes de votre budget.');
  const result = netIncome === null || fixedCharges === null ? null : livingAllowance({ netIncome, fixedCharges, mandatoryInstalments: instalments });
  return { answer: computed('F006', result, { inputs, currency, warnings, now }), netIncome, fixedCharges, fixedSource, instalments };
}

export async function buildReserveView(prisma, userId, { currency, targetMonths, now = new Date(), accountId = null } = {}) {
  const warnings = [];
  // GO-01's target by educational profile when the person has not chosen one
  // (decision P8-01 point 3) — always changeable.
  let defaultTarget = false;
  if (targetMonths === null || targetMonths === undefined) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { finPublic: true, finIncomeRegularity: true } });
    const months = defaultEmergencyMonths({ finPublic: user?.finPublic ?? null, incomeRegularity: user?.finIncomeRegularity ?? 'stable' });
    if (months !== null) {
      targetMonths = months;
      defaultTarget = true;
    }
  }
  const capital = await emergencyFundCapital(prisma, userId, currency, accountId);
  // Recette R10-07: which goal(s) ARE the fund, so the screen can open or delete them.
  const fundGoals = await prisma.finGoal.findMany({
    where: { userId, deletedAt: null, archivedAt: null, currency, status: { not: 'fictional' }, ...(accountId ? { accountId } : {}), ...EMERGENCY_GOAL_WHERE },
    select: { id: true, label: true, accountId: true },
  });
  const essential = await essentialMonthlyExpenses(prisma, userId, currency, now, accountId);

  if (capital === null) warnings.push('Aucun objectif « Fonds d’urgence » n’existe encore : créez-le dans vos objectifs pour mesurer votre réserve.');
  if (essential.source === 'declared') {
    warnings.push('Votre historique couvre moins d’un mois : les dépenses essentielles sont celles déclarées à l’inscription.');
  }
  if (essential.source === 'budget') warnings.push('Votre historique couvre moins d’un mois : les dépenses essentielles sont celles prévues dans votre budget.');
  if (essential.source === 'recorded') warnings.push('Votre historique couvre moins d’un mois : les dépenses essentielles sont celles déjà enregistrées, un minimum.');
  if (essential.amount === null) warnings.push('Les dépenses essentielles ne sont pas encore connues : ni l’historique, ni l’inscription ne les renseignent.');
  if (targetMonths === null || targetMonths === undefined) warnings.push('Aucune cible en mois n’a encore été choisie.');

  const inputs = {
    capital_fonds_urgence: capital,
    depenses_essentielles_mensuelles: essential.amount,
    source_depenses_essentielles: essential.source,
    mois_historique: essential.months,
    cible_mois: targetMonths ?? null,
  };
  const answer = (id, result) => computed(id, result, { inputs, currency, warnings, now });

  const target = targetMonths === null || targetMonths === undefined ? null : safetyFundTarget(targetMonths, essential.amount);
  const gap = target === null || capital === null ? null : safetyFundGap(target, capital);
  // C12's « date estimée » (recette R9-08): at the fund's planned monthly
  // saving, the month the gap is closed. Unknown without a monthly saving.
  const contributions = capital === null ? [] : await prisma.finGoal.findMany({
    where: { userId, deletedAt: null, archivedAt: null, currency, status: { not: 'fictional' }, ...(accountId ? { accountId } : {}), ...EMERGENCY_GOAL_WHERE },
    select: { monthlyContribution: true },
  });
  const monthly = contributions.reduce((sum, row) => sum + (row.monthlyContribution ?? 0), 0);
  let estimatedDate = null;
  if (gap === 0) estimatedDate = now.toISOString();
  else if (gap > 0 && monthly > 0) {
    const months = Math.ceil(gap / monthly);
    estimatedDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + months, 1)).toISOString();
  }

  return {
    currency,
    // Kept under its old name for the screens that read it; it now holds the
    // emergency fund's capital (null when there is no such goal).
    epargneLiquide: capital,
    depensesEssentielles: essential.amount,
    // 'history' (the real spending), 'declared' (the person's estimate) or null.
    sourceDepensesEssentielles: essential.source,
    moisReserve: answer('PB-F018', capital === null ? null : safetyFundMonths(capital, essential.amount)),
    cibleMontant: answer('PB-F017', target),
    manque: answer('PB-F019', gap),
    cibleMois: targetMonths ?? null,
    cibleParDefaut: defaultTarget,
    fonds: fundGoals,
    epargneMensuelle: monthly > 0 ? monthly : null,
    dateEstimee: estimatedDate,
    // R11-15: beside the target (dépenses essentielles), the reste à vivre (F006).
    resteAVivre: await livingAllowanceOf(prisma, userId, currency, now),
    avertissements: warnings,
  };
}
