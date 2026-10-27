// What this account has actually set aside (F007, "épargne nette"), shared by
// the goals (what a goal may claim as already allocated, P6-08), the funding
// readiness and the savings rate.
//
// Since P8-03, setting money aside is a TRANSFER to a savings account (AC-04):
// a deposit is a `transfer_in` on such an account, a withdrawal a
// `transfer_out` from it. A movement still entered under the client's « goal »
// category family (an expense to save, an income to take back) is counted the
// same way, so nothing entered that way before or since is lost. This stays
// the one place that counts savings.
import { SAVINGS_ACCOUNT_TYPE } from '../constants/finAccounts.js';
import { netSavings } from './finance/formulas.js';

const sumOf = async (prisma, where) => (await prisma.finTransaction.aggregate({ where, _sum: { value: true } }))._sum.value ?? 0;

async function savingsSums(prisma, userId, currency, occurredAt) {
  const base = { userId, deletedAt: null, status: 'real', planned: false, currency, ...(occurredAt ? { occurredAt } : {}) };
  const savingsAccount = { account: { type: SAVINGS_ACCOUNT_TYPE } };
  const goalFamily = { category: { family: 'goal' } };
  const [transfersIn, transfersOut, goalExpenses, goalIncome] = await Promise.all([
    sumOf(prisma, { ...base, ...savingsAccount, kind: 'transfer_in' }),
    sumOf(prisma, { ...base, ...savingsAccount, kind: 'transfer_out' }),
    sumOf(prisma, { ...base, ...goalFamily, kind: 'expense' }),
    sumOf(prisma, { ...base, ...goalFamily, kind: 'income' }),
  ]);
  return { deposits: transfersIn + goalExpenses, withdrawals: transfersOut + goalIncome };
}

export const markedSavingsRaw = (prisma, userId, currency) => savingsSums(prisma, userId, currency, null);

// The same two sums, restricted to a period. F008 (« taux d'épargne ») divides
// net savings by net income OVER THE SAME PERIOD: dividing the cumulative pool
// by one month's income would not be a rate, it would be a number with no
// meaning.
export async function markedSavingsInPeriod(prisma, userId, currency, { from, to }) {
  const made = await savingsSums(prisma, userId, currency, { gte: from, lte: to });
  // Nothing set aside in the period is NOT "saved zero": we cannot tell "put
  // nothing aside" from "did not record it", so the rate is simply not
  // computed (the project's rule, « non calculé plutôt que 0 »).
  const any = made.deposits > 0 || made.withdrawals > 0;
  return { ...made, net: any ? netSavings(made.deposits, made.withdrawals) : null };
}

// F007 itself: the net figure, ready to bound a goal's capital.
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
