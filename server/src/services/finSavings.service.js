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
