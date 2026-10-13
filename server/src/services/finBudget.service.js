// Budgets and envelopes (P6-05): the writes, the period rules and the reads the
// screen needs. The computation itself is in finBudgetView.service.js, and the
// proposed distribution in finBudgetProposal.service.js — storing a row and
// explaining a figure are two different concerns.
//
// Everything here is scoped to ONE account. `userId` is part of every filter,
// never only of the object's identity: a budget that is not yours is "not
// found".

import { BUDGET_RECURRENCES, DEFAULT_ALERT_THRESHOLDS, ENVELOPE_KINDS } from '../constants/finBudget.js';
import { HttpError } from '../utils/httpError.js';
import { recordChange, recordCorrection } from './finChange.service.js';
import { isBudgetableFamily } from './finBudgetProposal.service.js';

export const BUDGET_ENTITY = 'budget';
export const ENVELOPE_ENTITY = 'envelope';

const BUDGET_SELECT = {
  id: true,
  label: true,
  periodStart: true,
  periodEnd: true,
  currency: true,
  recurrence: true,
  alertThresholds: true,
  note: true,
  scope: true,
  source: true,
  status: true,
  confidence: true,
  consentUses: true,
  version: true,
  archivedAt: true,
};

const ENVELOPE_SELECT = {
  id: true,
  budgetId: true,
  categoryId: true,
  kind: true,
  value: true,
  currency: true,
  cap: true,
  recurring: true,
  note: true,
  scope: true,
  source: true,
  status: true,
  confidence: true,
  consentUses: true,
  version: true,
  archivedAt: true,
};

// ---- periods ---------------------------------------------------------------

/**
 * Refuses a period that overlaps another live budget of the same account —
 * the client's « chevauchement de périodes refusé ».
 *
 * A deleted or ARCHIVED budget does not block: archiving is how someone
 * withdraws a budget they no longer use, and it would be absurd for a withdrawn
 * period to forbid planning the same month again.
 *
 * This cannot be a SQL CHECK: it reads `userId`, a FOREIGN KEY column, which
 * MariaDB refuses inside a CHECK (same reason as the media and category rules).
 */
export async function assertNoOverlap(prisma, userId, { periodStart, periodEnd, exceptId = null }) {
  const clash = await prisma.finBudget.findFirst({
    where: {
      userId,
      deletedAt: null,
      archivedAt: null,
      ...(exceptId ? { id: { not: exceptId } } : {}),
      // Two intervals overlap when each starts before the other ends.
      periodStart: { lte: periodEnd },
      periodEnd: { gte: periodStart },
    },
    select: { id: true, label: true, periodStart: true, periodEnd: true },
  });
  if (clash) {
    throw new HttpError(422, 'Overlapping budget period', { reason: 'overlappingPeriod', budgetId: clash.id, label: clash.label });
  }
}

// The last day of the month `months` after `date`'s own month.
const lastDayOfShiftedMonth = (date, months) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months + 1, 0));

// `date` shifted by whole months, with the DAY CLAMPED to the target month.
//
// Date.UTC overflows on its own — 31 January plus one month gives 3 March — so
// the day has to be clamped, or a monthly budget would walk out of the calendar
// a little further every period.
function addMonths(date, months) {
  const lastDay = lastDayOfShiftedMonth(date, months).getUTCDate();
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, Math.min(date.getUTCDate(), lastDay)));
}

// The period that follows `[start, end]` for a given recurrence. `none` has no
// next period by definition, and says so instead of guessing one.
export function nextPeriod(recurrence, start, end) {
  const step = { monthly: 1, quarterly: 3, yearly: 12 }[recurrence];
  if (!step) return null;
  // A period that ended on the last day of its month keeps ending on the last
  // day: 31 January is followed by 28 February, not by "28 February and three
  // days", and not by 31 March either.
  const endedOnLastDay = end.getUTCDate() === lastDayOfShiftedMonth(end, 0).getUTCDate();
  return {
    periodStart: addMonths(start, step),
    periodEnd: endedOnLastDay ? lastDayOfShiftedMonth(end, step) : addMonths(end, step),
  };
}

// ---- categories ------------------------------------------------------------

// A category this account may point an ENVELOPE at: one of the client's
// standard rows or one of its own, not archived, and not an income family — one
// does not budget an expense against one's salary.
async function envelopeCategory(prisma, userId, categoryId) {
  if (categoryId === null || categoryId === undefined) {
    throw new HttpError(422, 'An envelope needs a category', { reason: 'categoryRequired' });
  }
  const row = await prisma.finCategory.findFirst({
    where: { id: categoryId, deletedAt: null, OR: [{ userId: null }, { userId }] },
    select: { id: true, family: true, archivedAt: true },
  });
  if (!row) throw new HttpError(422, 'Unknown category', { reason: 'unknownCategory' });
  if (row.archivedAt) throw new HttpError(422, 'Archived category', { reason: 'archivedCategory' });
  if (!isBudgetableFamily(row.family)) {
    throw new HttpError(422, 'This family cannot be budgeted', { reason: 'notBudgetable', family: row.family });
  }
  return row.id;
}

// Two envelopes on the same category inside one budget would split the same
// money in two and make every rate wrong.
async function assertCategoryFree(prisma, budgetId, categoryId, exceptId = null) {
  const clash = await prisma.finEnvelope.findFirst({
    where: { budgetId, categoryId, deletedAt: null, ...(exceptId ? { id: { not: exceptId } } : {}) },
    select: { id: true },
  });
  if (clash) throw new HttpError(422, 'This category already has an envelope', { reason: 'duplicateEnvelope', envelopeId: clash.id });
}

// ---- budgets ---------------------------------------------------------------

export function listBudgets(prisma, userId, { includeArchived = false } = {}) {
  return prisma.finBudget.findMany({
    where: { userId, deletedAt: null, ...(includeArchived ? {} : { archivedAt: null }) },
    select: { ...BUDGET_SELECT, _count: { select: { envelopes: true } } },
    orderBy: { periodStart: 'desc' },
  });
}

export async function ownBudget(prisma, userId, id) {
  const row = await prisma.finBudget.findFirst({ where: { id, userId, deletedAt: null }, select: { ...BUDGET_SELECT, userId: true } });
  if (!row) throw new HttpError(404, 'Budget not found');
  return row;
}

export function listEnvelopes(prisma, userId, budgetId) {
  return prisma.finEnvelope.findMany({
    where: { budgetId, userId, deletedAt: null, archivedAt: null },
    select: ENVELOPE_SELECT,
    orderBy: [{ kind: 'asc' }, { value: 'desc' }],
  });
}

/**
 * Creates a budget, optionally with its first envelopes in the same call —
 * which is what screens JA03 / JA04 are: one allocation plan, not a budget and
 * then a list of writes.
 */
export async function createBudget(prisma, userId, body) {
  if (!BUDGET_RECURRENCES.includes(body.recurrence ?? 'monthly')) {
    throw new HttpError(422, 'Unknown recurrence', { reason: 'unknownRecurrence' });
  }
  await assertNoOverlap(prisma, userId, { periodStart: body.periodStart, periodEnd: body.periodEnd });

  const envelopes = [];
  for (const envelope of body.envelopes ?? []) {
    if (!ENVELOPE_KINDS.includes(envelope.kind)) throw new HttpError(422, 'Unknown envelope kind', { reason: 'unknownKind' });
    const categoryId = await envelopeCategory(prisma, userId, envelope.categoryId);
    if (envelopes.some((other) => other.categoryId === categoryId)) {
      throw new HttpError(422, 'This category already has an envelope', { reason: 'duplicateEnvelope' });
    }
    envelopes.push({ ...envelope, categoryId });
  }

  return prisma.$transaction(async (tx) => {
    const budget = await tx.finBudget.create({
      data: {
        userId,
        label: body.label,
        periodStart: body.periodStart,
        periodEnd: body.periodEnd,
        currency: body.currency,
        recurrence: body.recurrence ?? 'monthly',
        alertThresholds: body.alertThresholds ?? DEFAULT_ALERT_THRESHOLDS,
        note: body.note ?? null,
        scope: body.scope ?? 'personal',
        consentUses: body.consentUses ?? [],
        source: 'manual',
        // A budget is a plan: it is declared, not realised. `fictional` is the
        // teaching mode of P6-03 and must be asked for explicitly.
        status: body.status ?? 'declared',
      },
      select: BUDGET_SELECT,
    });
    await recordChange(tx, {
      userId,
      entity: BUDGET_ENTITY,
      entityId: budget.id,
      action: 'create',
      after: { label: budget.label, periodStart: budget.periodStart, periodEnd: budget.periodEnd, currency: budget.currency },
    });

    for (const envelope of envelopes) {
      const row = await tx.finEnvelope.create({
        data: {
          userId,
          budgetId: budget.id,
          categoryId: envelope.categoryId,
          kind: envelope.kind,
          value: envelope.value,
          // The envelope's currency is the budget's, always: an envelope in
          // another currency could not be added to the total it belongs to.
          currency: budget.currency,
          cap: envelope.cap ?? null,
          recurring: envelope.recurring ?? true,
          note: envelope.note ?? null,
          scope: budget.scope,
          consentUses: budget.consentUses,
          source: envelope.source ?? 'manual',
          sourceRef: envelope.sourceRef ?? null,
          status: budget.status,
        },
        select: ENVELOPE_SELECT,
      });
      await recordChange(tx, {
        userId,
        entity: ENVELOPE_ENTITY,
        entityId: row.id,
        action: 'create',
        after: { budgetId: budget.id, categoryId: row.categoryId, kind: row.kind, value: row.value },
      });
    }

    return budget;
  });
}

export async function updateBudget(prisma, userId, id, body) {
  const before = await ownBudget(prisma, userId, id);
  const { reason, ...fields } = body;
  if (fields.recurrence !== undefined && !BUDGET_RECURRENCES.includes(fields.recurrence)) {
    throw new HttpError(422, 'Unknown recurrence', { reason: 'unknownRecurrence' });
  }
  const periodStart = fields.periodStart ?? before.periodStart;
  const periodEnd = fields.periodEnd ?? before.periodEnd;
  if (periodEnd <= periodStart) throw new HttpError(422, 'A period ends after it starts', { reason: 'period' });
  if (fields.periodStart !== undefined || fields.periodEnd !== undefined) {
    await assertNoOverlap(prisma, userId, { periodStart, periodEnd, exceptId: id });
  }

  return prisma.$transaction(async (tx) => {
    const after = await tx.finBudget.update({ where: { id }, data: { ...fields, version: { increment: 1 } }, select: BUDGET_SELECT });
    // The currency of a budget is the currency of its envelopes: changing one
    // without the others would leave amounts that cannot be added together.
    if (fields.currency && fields.currency !== before.currency) {
      await tx.finEnvelope.updateMany({ where: { budgetId: id, deletedAt: null }, data: { currency: fields.currency } });
    }
    await recordCorrection(tx, { userId, entity: BUDGET_ENTITY, entityId: id, before, after, reason: reason ?? null });
    return after;
  });
}

export async function setBudgetArchived(prisma, userId, id, archived, { reason } = {}) {
  const before = await ownBudget(prisma, userId, id);
  // Restoring a budget puts its period back in the way of the others, so the
  // overlap rule applies again — otherwise archive/restore would be a way round
  // it.
  if (!archived && before.archivedAt) {
    await assertNoOverlap(prisma, userId, { periodStart: before.periodStart, periodEnd: before.periodEnd, exceptId: id });
  }
  const archivedAt = archived ? new Date() : null;
  return prisma.$transaction(async (tx) => {
    const after = await tx.finBudget.update({ where: { id }, data: { archivedAt }, select: BUDGET_SELECT });
    await recordChange(tx, {
      userId,
      entity: BUDGET_ENTITY,
      entityId: id,
      action: archived ? 'archive' : 'restore',
      field: 'archivedAt',
      before: before.archivedAt,
      after: archivedAt,
      reason: reason ?? null,
    });
    return after;
  });
}

// Logical deletion, like every financial row (P6-02). Its envelopes go with it,
// also logically: a figure computed last month must keep knowing what it was
// made of.
export async function deleteBudget(prisma, userId, id, { reason } = {}) {
  await ownBudget(prisma, userId, id);
  const now = new Date();
  await prisma.$transaction(async (tx) => {
    const envelopes = await tx.finEnvelope.findMany({ where: { budgetId: id, deletedAt: null }, select: { id: true } });
    await tx.finEnvelope.updateMany({ where: { budgetId: id, deletedAt: null }, data: { deletedAt: now } });
    for (const envelope of envelopes) {
      await recordChange(tx, {
        userId,
        entity: ENVELOPE_ENTITY,
        entityId: envelope.id,
        action: 'delete',
        field: 'deletedAt',
        after: true,
        reason: 'budget supprimé',
      });
    }
    await tx.finBudget.update({ where: { id }, data: { deletedAt: now } });
    await recordChange(tx, { userId, entity: BUDGET_ENTITY, entityId: id, action: 'delete', field: 'deletedAt', after: true, reason: reason ?? null });
  });
  return { id };
}

/**
 * The same budget, for the next period — the client's « récurrence ».
 *
 * Only the envelopes marked `recurring` are carried over: a one-off envelope (a
 * trip, school fees) must not silently reappear next month. The amounts are
 * copied, never recomputed: this is the person's plan, not a new proposal.
 */
export async function duplicateBudget(prisma, userId, id, { label } = {}) {
  const budget = await ownBudget(prisma, userId, id);
  const period = nextPeriod(budget.recurrence, budget.periodStart, budget.periodEnd);
  if (!period) throw new HttpError(422, 'This budget has no next period', { reason: 'noRecurrence' });
  await assertNoOverlap(prisma, userId, period);

  const envelopes = await prisma.finEnvelope.findMany({
    where: { budgetId: id, userId, deletedAt: null, archivedAt: null, recurring: true },
    select: { categoryId: true, kind: true, value: true, cap: true, note: true },
  });

  return createBudget(prisma, userId, {
    label: label ?? budget.label,
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    currency: budget.currency,
    recurrence: budget.recurrence,
    alertThresholds: budget.alertThresholds,
    scope: budget.scope,
    consentUses: budget.consentUses,
    status: budget.status,
    // An envelope with no category left (its category was erased with an
    // account) cannot be carried over: there is nothing to budget against.
    envelopes: envelopes
      .filter((envelope) => envelope.categoryId)
      .map((envelope) => ({ ...envelope, recurring: true, sourceRef: `budget:${id}` })),
  });
}

// ---- envelopes -------------------------------------------------------------

export async function createEnvelope(prisma, userId, budgetId, body) {
  const budget = await ownBudget(prisma, userId, budgetId);
  if (!ENVELOPE_KINDS.includes(body.kind)) throw new HttpError(422, 'Unknown envelope kind', { reason: 'unknownKind' });
  const categoryId = await envelopeCategory(prisma, userId, body.categoryId);
  await assertCategoryFree(prisma, budgetId, categoryId);

  return prisma.$transaction(async (tx) => {
    const row = await tx.finEnvelope.create({
      data: {
        userId,
        budgetId,
        categoryId,
        kind: body.kind,
        value: body.value,
        currency: budget.currency,
        cap: body.cap ?? null,
        recurring: body.recurring ?? true,
        note: body.note ?? null,
        scope: budget.scope,
        consentUses: budget.consentUses,
        source: 'manual',
        status: budget.status,
      },
      select: ENVELOPE_SELECT,
    });
    await recordChange(tx, {
      userId,
      entity: ENVELOPE_ENTITY,
      entityId: row.id,
      action: 'create',
      after: { budgetId, categoryId: row.categoryId, kind: row.kind, value: row.value },
    });
    return row;
  });
}

async function ownEnvelope(prisma, userId, budgetId, id) {
  const row = await prisma.finEnvelope.findFirst({
    where: { id, budgetId, userId, deletedAt: null },
    select: { ...ENVELOPE_SELECT, userId: true },
  });
  if (!row) throw new HttpError(404, 'Envelope not found');
  return row;
}

export async function updateEnvelope(prisma, userId, budgetId, id, body) {
  const before = await ownEnvelope(prisma, userId, budgetId, id);
  const { reason, ...fields } = body;
  if (fields.kind !== undefined && !ENVELOPE_KINDS.includes(fields.kind)) throw new HttpError(422, 'Unknown envelope kind', { reason: 'unknownKind' });
  if (fields.categoryId !== undefined) {
    fields.categoryId = await envelopeCategory(prisma, userId, fields.categoryId);
    await assertCategoryFree(prisma, budgetId, fields.categoryId, id);
  }
  // The ceiling is a ceiling: below the planned amount it would contradict it.
  const value = fields.value ?? before.value;
  const cap = fields.cap === undefined ? before.cap : fields.cap;
  if (cap !== null && cap < value) throw new HttpError(422, 'A cap is not below the planned amount', { reason: 'capBelowValue' });

  return prisma.$transaction(async (tx) => {
    const after = await tx.finEnvelope.update({ where: { id }, data: { ...fields, version: { increment: 1 } }, select: ENVELOPE_SELECT });
    await recordCorrection(tx, { userId, entity: ENVELOPE_ENTITY, entityId: id, before, after, reason: reason ?? null });
    return after;
  });
}

export async function deleteEnvelope(prisma, userId, budgetId, id, { reason } = {}) {
  await ownEnvelope(prisma, userId, budgetId, id);
  await prisma.$transaction(async (tx) => {
    await tx.finEnvelope.update({ where: { id }, data: { deletedAt: new Date() } });
    await recordChange(tx, { userId, entity: ENVELOPE_ENTITY, entityId: id, action: 'delete', field: 'deletedAt', after: true, reason: reason ?? null });
  });
  return { id };
}

// ---- reads for the screen --------------------------------------------------

// Everything one budget's view needs, in one place so the page and the home
// screen (P6-06) cannot read it two different ways.
export async function loadBudgetData(prisma, userId, budget) {
  const [envelopes, movements, incomes] = await Promise.all([
    listEnvelopes(prisma, userId, budget.id),
    prisma.finTransaction.findMany({
      where: { userId, deletedAt: null, occurredAt: { gte: budget.periodStart, lte: budget.periodEnd } },
      select: { id: true, kind: true, value: true, currency: true, categoryId: true, planned: true, status: true, occurredAt: true },
    }),
    prisma.finIncome.findMany({
      where: {
        userId,
        deletedAt: null,
        archivedAt: null,
        startDate: { lte: budget.periodEnd },
        OR: [{ endDate: null }, { endDate: { gte: budget.periodStart } }],
      },
      select: { id: true, label: true, value: true, currency: true, frequency: true, status: true },
    }),
  ]);
  return { envelopes, movements, incomes };
}

// The budget whose period contains `at` — what "my budget" means on a home
// screen. `null` when none does, which is a normal state, not an error.
export function currentBudget(prisma, userId, at = new Date()) {
  return prisma.finBudget.findFirst({
    where: { userId, deletedAt: null, archivedAt: null, periodStart: { lte: at }, periodEnd: { gte: at } },
    select: BUDGET_SELECT,
    orderBy: { periodStart: 'desc' },
  });
}

// Real, realised expenses per category over a window, for the proposed
// distribution. Grouped in SQL, filtered to one currency by the caller.
export async function historyByCategory(prisma, userId, { from, to, currency }) {
  const groups = await prisma.finTransaction.groupBy({
    by: ['categoryId'],
    where: { userId, deletedAt: null, kind: 'expense', planned: false, status: 'real', currency, occurredAt: { gte: from, lte: to } },
    _sum: { value: true },
  });
  const ids = groups.map((group) => group.categoryId).filter(Boolean);
  const categories = await prisma.finCategory.findMany({ where: { id: { in: ids } }, select: { id: true, family: true, label: true } });
  const byId = new Map(categories.map((row) => [row.id, row]));
  return groups
    .filter((group) => group.categoryId && byId.has(group.categoryId))
    .map((group) => ({
      categoryId: group.categoryId,
      family: byId.get(group.categoryId).family,
      label: byId.get(group.categoryId).label,
      total: group._sum.value ?? 0,
    }));
}
