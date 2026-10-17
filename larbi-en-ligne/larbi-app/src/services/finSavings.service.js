// What this account has actually set aside (F007, "épargne nette"), shared by
// the safety reserve (P6-09) and by what a goal may claim as already allocated
// (P6-08). A deposit into savings is a real, non-planned movement categorised
// under the client's "goal" family (money leaving day-to-day spending for a
// goal); a withdrawal back out is the same family on the income side. Neither
// task invents a separate ledger: this is the one place that counts it.
import { netSavings } from './finance/formulas.js';

export async function markedSavingsRaw(prisma, userId, currency) {
  const [deposits, withdrawals] = await Promise.all([
    prisma.finTransaction.aggregate({
      where: { userId, deletedAt: null, status: 'real', planned: false, kind: 'expense', currency, category: { family: 'goal' } },
      _sum: { value: true },
    }),
    prisma.finTransaction.aggregate({
      where: { userId, deletedAt: null, status: 'real', planned: false, kind: 'income', currency, category: { family: 'goal' } },
      _sum: { value: true },
    }),
  ]);
  return { deposits: deposits._sum.value ?? 0, withdrawals: withdrawals._sum.value ?? 0 };
}

// The same two sums, restricted to a period. F008 (« taux d'épargne ») divides
// net savings by net income OVER THE SAME PERIOD: dividing the cumulative pool
// by one month's income would not be a rate, it would be a number with no
// meaning. The savings movements are dated, so the period is a real filter and
// not an approximation.
export async function markedSavingsInPeriod(prisma, userId, currency, { from, to }) {
  const where = { userId, deletedAt: null, status: 'real', planned: false, currency, category: { family: 'goal' }, occurredAt: { gte: from, lte: to } };
  const [deposits, withdrawals] = await Promise.all([
    prisma.finTransaction.aggregate({ where: { ...where, kind: 'expense' }, _sum: { value: true } }),
    prisma.finTransaction.aggregate({ where: { ...where, kind: 'income' }, _sum: { value: true } }),
  ]);
  const made = { deposits: deposits._sum.value ?? 0, withdrawals: withdrawals._sum.value ?? 0 };
  // Nothing marked as savings in the period is NOT "saved zero": we cannot tell
  // "put nothing aside" from "did not record it", so the rate is simply not
  // computed (the project's rule, « non calculé plutôt que 0 »).
  const any = made.deposits > 0 || made.withdrawals > 0;
  return { ...made, net: any ? netSavings(made.deposits, made.withdrawals) : null };
}

// F007 itself: the net figure, ready to feed F014 (reserve) or a goal's cap.
export async function markedSavings(prisma, userId, currency) {
  const { deposits, withdrawals } = await markedSavingsRaw(prisma, userId, currency);
  return netSavings(deposits, withdrawals);
}

// How much of that pool is already claimed by this account's OTHER real
// (non-fictional) goals — so a new or corrected goal cannot claim savings
// twice over, and a fictional goal is never counted against real money.
export async function allocatedByOtherGoals(prisma, userId, currency, exceptId = null) {
  const sum = await prisma.finGoal.aggregate({
    where: {
      userId,
      deletedAt: null,
      currency,
      status: { not: 'fictional' },
      ...(exceptId ? { id: { not: exceptId } } : {}),
    },
    _sum: { allocated: true },
  });
  return sum._sum.allocated ?? 0;
}
