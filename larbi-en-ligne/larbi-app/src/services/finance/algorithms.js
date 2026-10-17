// The four algorithms of FINCLUDIA (P4-09), tab `11_Algorithmes`: the cases
// where the client says a closed formula is not enough and an iteration is
// needed. Pure functions, same contract as formulas.js — `null` for input that
// makes no sense, and an explicit `completed: false` when an iteration runs past
// the horizon instead of pretending to have an answer.
//
// None of these produces advice. ALG-01 compares two repayment orders the user
// chose to test; it never says which debt they should pay first.

import { MAX_ITERATION_MONTHS } from '../../constants/finance.js';
import { isAmount, isRate, roundAmount } from './money.js';

export const DEBT_STRATEGIES = ['avalanche', 'snowball'];

const validDebt = (debt) =>
  debt &&
  typeof debt === 'object' &&
  typeof debt.id === 'string' &&
  debt.id.length > 0 &&
  isAmount(debt.principal) &&
  debt.principal > 0 &&
  isRate(debt.monthlyRate) &&
  debt.monthlyRate >= 0 &&
  isAmount(debt.minimumPayment) &&
  debt.minimumPayment > 0;

// ALG-01 — "Dette coûteuse / petite dette". Month by month: interest is added,
// every debt gets its minimum, and the whole surplus (the extra payment plus the
// minimums freed by debts already cleared) goes to the priority debt —
// `avalanche` = the costliest rate first, `snowball` = the smallest balance
// first. That reallocation is the point of both methods and the client asks for
// it explicitly.
//
// `completed: false` means the debts are not repaid within the horizon (50
// years): with minimums that do not even cover the interest, no order of
// payment clears them, and that is an answer worth showing.
export function debtPayoffPlan({ debts, extraPayment = 0, strategy = 'avalanche' } = {}) {
  if (!Array.isArray(debts) || debts.length === 0 || !debts.every(validDebt)) return null;
  if (!isAmount(extraPayment) || extraPayment < 0) return null;
  if (!DEBT_STRATEGIES.includes(strategy)) return null;
  if (new Set(debts.map((debt) => debt.id)).size !== debts.length) return null;

  const open = debts.map((debt) => ({ id: debt.id, balance: debt.principal, rate: debt.monthlyRate, minimum: debt.minimumPayment }));
  const payoff = [];
  let totalPaid = 0;
  let totalInterest = 0;
  let months = 0;

  while (open.some((debt) => debt.balance > 0) && months < MAX_ITERATION_MONTHS) {
    months += 1;
    const owedBefore = open.reduce((sum, debt) => sum + debt.balance, 0);
    for (const debt of open) {
      if (debt.balance <= 0) continue;
      const interest = roundAmount(debt.balance * debt.rate);
      if (interest === null) return null;
      debt.balance += interest;
      totalInterest += interest;
    }

    // The budget of the month: every minimum, including those of cleared debts
    // (the method's "freed instalment"), plus the user's extra payment.
    let budget = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0) + extraPayment;

    const byPriority = [...open]
      .filter((debt) => debt.balance > 0)
      .sort((a, b) => (strategy === 'avalanche' ? b.rate - a.rate || a.balance - b.balance : a.balance - b.balance || b.rate - a.rate));

    // Minimums first, so no debt falls behind while the surplus attacks one.
    for (const debt of byPriority) {
      if (budget <= 0) break;
      const paid = Math.min(debt.minimum, debt.balance, budget);
      debt.balance -= paid;
      budget -= paid;
      totalPaid += paid;
      if (debt.balance <= 0) payoff.push({ id: debt.id, month: months });
    }
    // Then everything left goes to the priority debt, then the next one.
    for (const debt of byPriority) {
      if (budget <= 0) break;
      if (debt.balance <= 0) continue;
      const paid = Math.min(debt.balance, budget);
      debt.balance -= paid;
      budget -= paid;
      totalPaid += paid;
      if (debt.balance <= 0) payoff.push({ id: debt.id, month: months });
    }

    // The month changed nothing, or made it worse: the payments do not even
    // cover the interest. The balance only grows from here (interest grows with
    // it) and the payments never change in this model, so no further month
    // helps. Stop and say the plan does not repay the debts, instead of looping
    // to the horizon and overflowing on the way.
    if (open.reduce((sum, debt) => sum + debt.balance, 0) >= owedBefore) break;
  }

  const completed = open.every((debt) => debt.balance <= 0);
  return {
    strategy,
    completed,
    months: completed ? months : null,
    totalPaid: roundAmount(totalPaid),
    totalInterest: roundAmount(totalInterest),
    payoff,
    remaining: open.filter((debt) => debt.balance > 0).map((debt) => ({ id: debt.id, balance: roundAmount(debt.balance) })),
  };
}

// ALG-02 — "Minimisation des remboursements" between members of a shared space.
// Net balances (F043), debtors paired with creditors, min(credit, debt) each
// time until everything is settled.
//
// The transfers are only a shortcut: each member's NET position is untouched,
// which is the client's condition. The balances must therefore add up to zero —
// if they do not, the input is inconsistent and optimising it would invent money.
export function minimalSettlements(balances) {
  if (!Array.isArray(balances) || balances.length === 0) return null;
  if (!balances.every((entry) => entry && typeof entry === 'object' && typeof entry.member === 'string' && entry.member.length > 0 && isAmount(entry.balance))) return null;
  if (new Set(balances.map((entry) => entry.member)).size !== balances.length) return null;
  if (balances.reduce((sum, entry) => sum + entry.balance, 0) !== 0) return null;

  // Sorted by amount then name: same input, same transfers, every time.
  const creditors = balances.filter((entry) => entry.balance > 0).map((entry) => ({ ...entry })).sort((a, b) => b.balance - a.balance || a.member.localeCompare(b.member));
  const debtors = balances.filter((entry) => entry.balance < 0).map((entry) => ({ ...entry })).sort((a, b) => a.balance - b.balance || a.member.localeCompare(b.member));

  const transfers = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(-debtors[i].balance, creditors[j].balance);
    if (amount > 0) transfers.push({ from: debtors[i].member, to: creditors[j].member, amount });
    debtors[i].balance += amount;
    creditors[j].balance -= amount;
    if (debtors[i].balance === 0) i += 1;
    if (creditors[j].balance === 0) j += 1;
  }
  return transfers;
}

// ALG-03 — "Date atteinte objectif". Monthly iteration, exactly as the client
// writes it: capital = capital × (1 + r) + versement, stop when capital ≥ cible.
// `completed: false` means the target is out of reach within the horizon (a
// contribution of zero, or returns below what the goal needs).
export function goalReachDate({ capital, target, monthlyRate = 0, contribution } = {}) {
  if (!isAmount(capital) || !isAmount(target) || !isAmount(contribution)) return null;
  if (!isRate(monthlyRate) || 1 + monthlyRate < 0) return null;
  if (contribution < 0) return null;
  if (capital >= target) return { months: 0, completed: true, finalCapital: capital };

  let current = capital;
  for (let months = 1; months <= MAX_ITERATION_MONTHS; months += 1) {
    const next = roundAmount(current * (1 + monthlyRate) + contribution);
    if (next === null) return null;
    if (next <= current && contribution === 0 && monthlyRate <= 0) break; // never grows
    current = next;
    if (current >= target) return { months, completed: true, finalCapital: current };
  }
  return { months: null, completed: false, finalCapital: current };
}

const normalizeLabel = (label) =>
  String(label ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

// ALG-04 — "Détection récurrence". Same merchant or label, amount within a
// tolerance, regular interval. Every result is a CANDIDATE: the client requires
// the user to confirm before a recurrence is created, so nothing here is a fact
// and `confirmed` is always false.
export function detectRecurrences(transactions, { amountTolerance = 0.05, intervalDays = 30, intervalToleranceDays = 5, minimumOccurrences = 3 } = {}) {
  if (!Array.isArray(transactions)) return null;
  if (!isRate(amountTolerance) || amountTolerance < 0) return null;
  if (!isRate(intervalDays) || intervalDays <= 0) return null;
  if (!isRate(intervalToleranceDays) || intervalToleranceDays < 0) return null;
  if (!Number.isSafeInteger(minimumOccurrences) || minimumOccurrences < 2) return null;

  const groups = new Map();
  for (const transaction of transactions) {
    if (!transaction || typeof transaction !== 'object') return null;
    const { label, amount, date } = transaction;
    if (!isAmount(amount) || !(date instanceof Date) || Number.isNaN(date.getTime())) return null;
    const key = normalizeLabel(label);
    if (!key) continue; // nothing to match on: never grouped by amount alone
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ amount, time: date.getTime() });
  }

  const candidates = [];
  for (const [label, entries] of groups) {
    if (entries.length < minimumOccurrences) continue;
    entries.sort((a, b) => a.time - b.time);

    const reference = entries[entries.length - 1].amount; // the most recent amount
    const withinTolerance = entries.every((entry) => Math.abs(entry.amount - reference) <= Math.abs(reference) * amountTolerance);
    if (!withinTolerance) continue;

    const gaps = entries.slice(1).map((entry, index) => (entry.time - entries[index].time) / 86_400_000);
    const regular = gaps.every((gap) => Math.abs(gap - intervalDays) <= intervalToleranceDays);
    if (!regular) continue;

    const averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    candidates.push({
      label,
      amount: reference,
      occurrences: entries.length,
      averageIntervalDays: Math.round(averageGap),
      nextExpected: new Date(entries[entries.length - 1].time + Math.round(averageGap) * 86_400_000),
      confirmed: false,
    });
  }
  return candidates.sort((a, b) => b.occurrences - a.occurrences || a.label.localeCompare(b.label));
}
