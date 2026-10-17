// Safety reserve (P6-09), screen C12: F014-F016. No table of its own — the
// liquid savings come from this account's own money movements (F007, shared
// with P6-08 in finSavings.service.js), and the only thing this account owns
// outright is the target it chooses (users.finReserveTargetMonths, P3-18's
// extension).
import { ESSENTIAL_EXPENSE_CATEGORY_KEYS, ONBOARDING_QUESTIONS } from '../constants/finOnboarding.js';
import { computed } from './finance/contract.js';
import { monthlyAmount, safetyFundGap, safetyFundMonths, safetyFundTarget } from './finance/formulas.js';
import { markedSavingsRaw } from './finSavings.service.js';

const ESSENTIAL_WINDOW_MONTHS = 3;

// The average real monthly spend on the client's own "dépenses essentielles"
// categories (derived from the onboarding, never retyped). Falls back to what
// the person declared at sign-up when no real history exists yet — the same
// bridge the budget proposal already uses (P6-05) — so a brand-new account is
// not told "non calculé" the day after onboarding.
async function essentialMonthlyExpenses(prisma, userId, currency, now = new Date()) {
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - ESSENTIAL_WINDOW_MONTHS, now.getUTCDate()));
  const categories = await prisma.finCategory.findMany({
    where: { key: { in: ESSENTIAL_EXPENSE_CATEGORY_KEYS }, deletedAt: null },
    select: { id: true },
  });
  const categoryIds = categories.map((c) => c.id);
  const sum = await prisma.finTransaction.aggregate({
    where: { userId, deletedAt: null, status: 'real', planned: false, kind: 'expense', currency, categoryId: { in: categoryIds }, occurredAt: { gte: from, lte: now } },
    _sum: { value: true },
  });
  if (sum._sum.value) return Math.round(sum._sum.value / ESSENTIAL_WINDOW_MONTHS);

  const onboarding = await prisma.finOnboarding.findUnique({ where: { userId }, select: { answers: true, currency: true } });
  if (!onboarding || onboarding.currency !== currency) return null;
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

export async function buildReserveView(prisma, userId, { currency, targetMonths, now = new Date() } = {}) {
  const warnings = [];
  const { deposits, withdrawals } = await markedSavingsRaw(prisma, userId, currency);
  const liquidSavings = deposits - withdrawals;
  const essential = await essentialMonthlyExpenses(prisma, userId, currency, now);
  if (essential === null) warnings.push('Les dépenses essentielles ne sont pas encore connues : ni l\'historique, ni l\'inscription ne les renseignent.');
  if (targetMonths === null || targetMonths === undefined) warnings.push('Aucune cible en mois n\'a encore été choisie.');

  const inputs = { epargne_liquide: liquidSavings, depenses_essentielles_mensuelles: essential, cible_mois: targetMonths ?? null, depots: deposits, retraits: withdrawals };
  const answer = (id, result, extra = {}) => computed(id, result, { inputs, currency, warnings, now, ...extra });

  const target = targetMonths === null || targetMonths === undefined ? null : safetyFundTarget(targetMonths, essential);
  const gap = target === null ? null : safetyFundGap(target, liquidSavings);

  return {
    currency,
    epargneLiquide: liquidSavings,
    depensesEssentielles: essential,
    moisReserve: answer('F014', safetyFundMonths(liquidSavings, essential)),
    cibleMontant: answer('F015', target),
    manque: answer('F016', gap),
    cibleMois: targetMonths ?? null,
    composition: { depots: deposits, retraits: withdrawals },
    avertissements: warnings,
  };
}
