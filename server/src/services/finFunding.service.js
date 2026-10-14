// Funding readiness (P6-16): composes figures ALREADY built by earlier tasks
// rather than computing anything new — completeness is the only dimension
// this file adds, and it is a mechanical fact ("is X declared"), never a
// judgement.
import { FUNDING_INDEX_BLOCKED, STABILITY_BLOCKED } from '../constants/finFunding.js';
import { buildDebtSynthesis, listDebts } from './finDebt.service.js';
import { buildReserveView } from './finReserve.service.js';
import { markedSavings } from './finSavings.service.js';
import { computed } from './finance/contract.js';
import { monthlyAmount, totalIncome } from './finance/formulas.js';

async function netMonthlyIncome(prisma, userId, currency) {
  const incomes = await prisma.finIncome.findMany({
    where: { userId, deletedAt: null, archivedAt: null, currency, status: { not: 'fictional' } },
    select: { value: true, frequency: true },
  });
  const entries = incomes.map((income) => monthlyAmount(income.value, income.frequency)).filter((v) => v !== null).map((amount) => ({ amount, currency }));
  return entries.length === 0 ? null : totalIncome(entries, { currency });
}

/**
 * Completeness: a mechanical fact, not a judgement — which of this account's
 * declarations already exist. Each check reuses data another task already
 * requires to exist (a public, an income, a reserve target, a real asset),
 * so this adds no new category of personal data.
 */
async function buildCompleteness(prisma, userId) {
  const [user, incomeCount, assetCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { finPublic: true, finReserveTargetMonths: true } }),
    prisma.finIncome.count({ where: { userId, deletedAt: null, archivedAt: null, status: { not: 'fictional' } } }),
    prisma.finAsset.count({ where: { userId, deletedAt: null, archivedAt: null, status: { not: 'fictional' } } }),
  ]);
  const checks = [
    { key: 'public', done: Boolean(user?.finPublic) },
    { key: 'income', done: incomeCount > 0 },
    { key: 'reserveTarget', done: user?.finReserveTargetMonths !== null && user?.finReserveTargetMonths !== undefined },
    { key: 'wealth', done: assetCount > 0 },
  ];
  const done = checks.filter((check) => check.done).length;
  return { ratio: done / checks.length, checks };
}

export async function buildFundingReadiness(prisma, userId, { currency } = {}) {
  const [completeness, debts, user, savings, income] = await Promise.all([
    buildCompleteness(prisma, userId),
    listDebts(prisma, userId, {}),
    prisma.user.findUnique({ where: { id: userId }, select: { finReserveTargetMonths: true } }),
    markedSavings(prisma, userId, currency),
    netMonthlyIncome(prisma, userId, currency),
  ]);
  const reserveWithTarget = await buildReserveView(prisma, userId, { currency, targetMonths: user?.finReserveTargetMonths ?? null });
  const debtSynthesis = buildDebtSynthesis(debts, { netMonthlyIncome: income, currency });

  const missing = new Set(completeness.checks.filter((c) => !c.done).map((c) => c.key));
  missing.add('stability');
  if (debtSynthesis.tauxEffort === null || debtSynthesis.tauxEffort.resultat === null) missing.add('debtEffort');
  if (reserveWithTarget.cibleMois === null) missing.add('reserveTarget');

  return {
    currency,
    dimensions: {
      completeness: { ratio: completeness.ratio, checks: completeness.checks },
      stability: STABILITY_BLOCKED,
      debtEffort: debtSynthesis.tauxEffort,
      // F007 again (the same figure P6-08/P6-09 already share): wrapped in
      // the engine's own contract here too, so every dimension on this
      // screen explains itself the same way.
      downPayment: computed('F007', savings, { inputs: { devise: currency }, currency, now: new Date() }),
      reserve: reserveWithTarget.moisReserve,
    },
    // Said out loud, so no screen can present this as a credit decision.
    indiceGlobal: FUNDING_INDEX_BLOCKED,
    piecesManquantes: [...missing],
    calculeLe: new Date().toISOString(),
    reserve: reserveWithTarget,
  };
}
