// « Premiers pas » (P8-23, tab 02_Premier_Demarrage, PB-PR-03): eight steps,
// each optional except the first, each done in any order and resumed later.
// « Saisie libre et progressive » — nothing here is a gate: a step is DONE when
// the data it asks for exists, SKIPPED when the person set it aside, and what
// is not filled in stays « non calculé », never 0.
import { HttpError } from '../utils/httpError.js';
import { createIncome } from './finMoney.service.js';
import { createRecurrence } from './finCalendar.service.js';

export const FIRST_STEPS = ['P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'];

export async function firstStepsState(prisma, userId) {
  const [user, incomes, salary, accounts, movements, budgets, goals, debts] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { finPublic: true, finOnboardedAt: true, finFirstSteps: true, finCurrency: true } }),
    prisma.finIncome.count({ where: { userId, deletedAt: null, archivedAt: null } }),
    prisma.finRecurrence.findFirst({
      where: { userId, deletedAt: null, archivedAt: null, kind: 'income' },
      orderBy: { createdAt: 'asc' },
      select: { id: true, label: true, value: true, currency: true, frequency: true, nextDate: true, accountId: true, creationMode: true, weekendRule: true },
    }),
    // The « Espèces » account the system creates on its own does not count as
    // the person having created their accounts.
    prisma.finAccount.count({ where: { userId, deletedAt: null, source: 'manual' } }),
    prisma.finTransaction.count({ where: { userId, deletedAt: null, status: 'real', kind: { in: ['income', 'expense'] } } }),
    prisma.finBudget.count({ where: { userId, deletedAt: null, archivedAt: null } }),
    prisma.finGoal.count({ where: { userId, deletedAt: null, archivedAt: null } }),
    prisma.finDebt.count({ where: { userId, deletedAt: null, archivedAt: null } }),
  ]);
  const skipped = user.finFirstSteps ?? {};
  const done = {
    P0: Boolean(user.finPublic),
    P1: incomes > 0,
    // P2 is confirmed once the salary has a date, an account or a chosen mode
    // that the person looked at: the recurrence exists and carries an account.
    P2: Boolean(salary && salary.accountId),
    P3: accounts > 0,
    P4: movements > 0,
    P5: budgets > 0,
    P6: goals > 0,
    P7: debts > 0,
  };
  const steps = FIRST_STEPS.map((key) => ({ key, done: done[key], skipped: !done[key] && skipped[key] === true, required: key === 'P0' }));
  return {
    steps,
    // What is left, in order: the next thing to offer.
    next: steps.find((step) => !step.done && !step.skipped)?.key ?? null,
    salary,
    currency: user.finCurrency,
  };
}

export async function setStepSkipped(prisma, userId, step, skipped) {
  if (!FIRST_STEPS.includes(step)) throw new HttpError(422, 'Unknown step', { reason: 'unknownStep' });
  // The first step is the only one that is not optional (tab 02).
  if (step === 'P0' && skipped) throw new HttpError(422, 'The first step cannot be skipped', { reason: 'required' });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { finFirstSteps: true } });
  const next = { ...(user.finFirstSteps ?? {}) };
  if (skipped) next[step] = true;
  else delete next[step];
  await prisma.user.update({ where: { id: userId }, data: { finFirstSteps: next } });
  return { step, skipped };
}

/**
 * P1 (+ P2's defaults): the first income, entered ONCE and read twice — as the
 * expected resource the budget's « reste à allouer » is built on (PB-F009), and
 * as the recurrence the calendar asks about on the day (the salary is only
 * credited after confirmation, QA-P05). P2 then corrects its day, weekend
 * rule, account and mode through the recurrence's own screen.
 */
export async function createFirstIncome(prisma, userId, body) {
  const income = await createIncome(prisma, userId, {
    label: body.label,
    categoryId: body.categoryId ?? null,
    value: body.value,
    currency: body.currency,
    frequency: body.frequency,
    // The resource is active from today: it is what the person says they
    // live on, whatever day the next payment falls (the recurrence carries
    // that date).
    startDate: body.nextDate < new Date() ? body.nextDate : new Date(),
  });
  const recurrence = await createRecurrence(prisma, userId, {
    label: body.label,
    categoryId: body.categoryId ?? null,
    kind: 'income',
    value: body.value,
    currency: body.currency,
    frequency: body.frequency,
    nextDate: body.nextDate,
    accountId: body.accountId ?? null,
    // « À confirmer » is the recommended mode for income; the person may ask
    // for the credit to be recorded on its own.
    creationMode: body.autoCredit ? 'auto_real' : 'confirm',
    weekendRule: body.weekendRule ?? 'previous',
  });
  return { income, recurrence };
}
