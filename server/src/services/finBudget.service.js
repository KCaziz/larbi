// Budgets and envelopes (P6-05): the writes, the period rules and the reads the
// screen needs. The computation itself is in finBudgetView.service.js, and the
// proposed distribution in finBudgetProposal.service.js — storing a row and
// explaining a figure are two different concerns.
//
// Everything here is scoped to ONE account. `userId` is part of every filter,
// never only of the object's identity: a budget that is not yours is "not
// found".

import { REFERENCE_CATEGORIES } from '../constants/finCategoryReference.js';
import { assignToEnvelopes, buildBudgetView } from './finBudgetView.service.js';
import { BUDGET_RECURRENCES, DEFAULT_ALERT_THRESHOLDS, ENVELOPE_KINDS } from '../constants/finBudget.js';
import { HttpError } from '../utils/httpError.js';
import { recordChange, recordCorrection } from './finChange.service.js';
import { isBudgetableFamily } from './finBudgetProposal.service.js';
import { throughEndOfDay } from '../utils/dayEnd.js';
import { accountsWithBalances, ensureCashAccount, usableAccount } from './finAccount.service.js';
import { loadCalendarData } from './finCalendar.service.js';
import { collectEvents } from './finCalendarView.service.js';
import { occurrencesWithOutcome } from './finOccurrence.service.js';

export const BUDGET_ENTITY = 'budget';
export const ENVELOPE_ENTITY = 'envelope';

const BUDGET_SELECT = {
  id: true,
  label: true,
  color: true,
  periodStart: true,
  periodEnd: true,
  currency: true,
  recurrence: true,
  accountId: true,
  countBalance: true,
  alertThresholds: true,
  carryOver: true,
  carryOverspend: true,
  methodMapping: true,
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
  categoryGroup: true,
  accountId: true,
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
 * Several budgets may share a period, or overlap (recette R11-10, the client's
 * decision of 2026-11-11 — it reverses R9-04 and R11-08): a household budget and
 * a holiday budget for the same month, say. Nothing is refused for its dates.
 */

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
  // R13-02: a weekly budget moves by seven days, whatever the days of its period are.
  if (recurrence === 'weekly') {
    const week = 7 * 24 * 3600 * 1000;
    return { periodStart: new Date(start.getTime() + week), periodEnd: new Date(end.getTime() + week) };
  }
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

// The client category groups an envelope may cover (P8-09): the expense
// groups of the universal reference (P8-08).
const EXPENSE_GROUPS = new Set(REFERENCE_CATEGORIES.filter((c) => c.family !== 'income' && c.group).map((c) => c.group));

/**
 * What an envelope covers: ONE sub-category, or ONE client category group
 * (« Logement »…), never both — and never nothing.
 */
async function envelopeTarget(prisma, userId, { categoryId, categoryGroup }) {
  const hasCategory = categoryId !== null && categoryId !== undefined;
  const hasGroup = categoryGroup !== null && categoryGroup !== undefined;
  if (hasCategory === hasGroup) throw new HttpError(422, 'An envelope covers a category or a group', { reason: 'categoryRequired' });
  if (hasGroup) {
    if (!EXPENSE_GROUPS.has(categoryGroup)) throw new HttpError(422, 'Unknown category group', { reason: 'unknownGroup' });
    return { categoryId: null, categoryGroup };
  }
  return { categoryId: await envelopeCategory(prisma, userId, categoryId), categoryGroup: null };
}

async function assertTargetFree(prisma, budgetId, target, exceptId = null) {
  if (target.categoryGroup) {
    const clash = await prisma.finEnvelope.findFirst({
      where: { budgetId, categoryGroup: target.categoryGroup, deletedAt: null, ...(exceptId ? { id: { not: exceptId } } : {}) },
      select: { id: true },
    });
    if (clash) throw new HttpError(422, 'This group already has an envelope', { reason: 'duplicateEnvelope', envelopeId: clash.id });
    return;
  }
  await assertCategoryFree(prisma, budgetId, target.categoryId, exceptId);
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
// The account a budget or an envelope is spent from (R13-01): one of the
// person's own, open, in the budget's currency, or « cash » — their « Espèces »
// account, opened if there is none yet, so that cash spending can have its own
// budget like any account (R14, 2026-11-15). undefined = unchanged, null = none.
async function spendAccount(prisma, userId, accountId, currency) {
  if (accountId === undefined || accountId === null) return accountId;
  if (accountId === 'cash') return ensureCashAccount(prisma, userId, currency);
  return (await usableAccount(prisma, userId, accountId, currency)).id;
}

export async function createBudget(prisma, userId, body) {
  if (!BUDGET_RECURRENCES.includes(body.recurrence ?? 'monthly')) {
    throw new HttpError(422, 'Unknown recurrence', { reason: 'unknownRecurrence' });
  }
  // R13-01: the account the budget is spent from — one of the person's own, open, in the budget's currency; none = every account of the total.
  body.accountId = await spendAccount(prisma, userId, body.accountId, body.currency);
  const envelopes = [];
  for (const envelope of body.envelopes ?? []) {
    if (!ENVELOPE_KINDS.includes(envelope.kind)) throw new HttpError(422, 'Unknown envelope kind', { reason: 'unknownKind' });
    const target = await envelopeTarget(prisma, userId, envelope);
    envelope.accountId = await spendAccount(prisma, userId, envelope.accountId, body.currency);
    if (envelopes.some((other) => (target.categoryId && other.categoryId === target.categoryId) || (target.categoryGroup && other.categoryGroup === target.categoryGroup))) {
      throw new HttpError(422, 'This category already has an envelope', { reason: 'duplicateEnvelope' });
    }
    envelopes.push({ ...envelope, ...target });
  }

  return prisma.$transaction(async (tx) => {
    const budget = await tx.finBudget.create({
      data: {
        userId,
        label: body.label,
        color: body.color ?? null,
        periodStart: body.periodStart,
        periodEnd: body.periodEnd,
        currency: body.currency,
        recurrence: body.recurrence ?? 'monthly',
        accountId: body.accountId ?? null,
        countBalance: body.countBalance ?? true,
        alertThresholds: body.alertThresholds ?? DEFAULT_ALERT_THRESHOLDS,
        carryOver: body.carryOver ?? false,
        carryOverspend: body.carryOverspend ?? false,
        methodMapping: body.methodMapping ?? {},
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
          categoryGroup: envelope.categoryGroup,
          accountId: envelope.accountId ?? null,
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
  fields.accountId = await spendAccount(prisma, userId, fields.accountId, fields.currency ?? before.currency);

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

  const envelopes = await prisma.finEnvelope.findMany({
    where: { budgetId: id, userId, deletedAt: null, archivedAt: null, recurring: true },
    select: { categoryId: true, accountId: true, kind: true, value: true, cap: true, note: true },
  });

  return createBudget(prisma, userId, {
    label: label ?? budget.label,
    color: budget.color ?? null,
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    currency: budget.currency,
    recurrence: budget.recurrence,
    accountId: budget.accountId ?? null,
    countBalance: budget.countBalance,
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
  const target = await envelopeTarget(prisma, userId, body);
  await assertTargetFree(prisma, budgetId, target);
  body.accountId = await spendAccount(prisma, userId, body.accountId, budget.currency);

  return prisma.$transaction(async (tx) => {
    const row = await tx.finEnvelope.create({
      data: {
        userId,
        budgetId,
        ...target,
        accountId: body.accountId ?? null,
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
  fields.accountId = await spendAccount(prisma, userId, fields.accountId, before.currency);
  if (fields.categoryId !== undefined || fields.categoryGroup !== undefined) {
    const target = await envelopeTarget(prisma, userId, { categoryId: fields.categoryId ?? null, categoryGroup: fields.categoryGroup ?? null });
    await assertTargetFree(prisma, budgetId, target, id);
    Object.assign(fields, target);
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

// Recette R12-04: an envelope on a MAIN category (« Alimentation », proposed
// from past spending tagged with it) covers its whole group, as an envelope on
// the group does — otherwise « Alimentation & boissons » would be spent outside
// it. `coversGroup` says so to the computation; a sub-category envelope still
// takes its own expenses first (« le plus spécifique »).
async function withMainCategoryGroups(prisma, envelopes) {
  const ids = [...new Set(envelopes.map((envelope) => envelope.categoryId).filter(Boolean))];
  if (ids.length === 0) return envelopes;
  const categories = await prisma.finCategory.findMany({ where: { id: { in: ids }, group: { not: null } }, select: { id: true, key: true, group: true } });
  if (categories.length === 0) return envelopes;
  const byId = new Map(categories.map((category) => [category.id, category]));
  return envelopes.map((envelope) => {
    const category = byId.get(envelope.categoryId);
    if (!category) return envelope;
    // `inGroup` (R16): the group of the envelope's category, so an expense on another
    // category of that group can reach it when it is the group's only envelope.
    return { ...envelope, inGroup: category.group, ...(category.key?.startsWith('main.') ? { coversGroup: category.group } : {}) };
  });
}

// The balance, in the budget's currency, the account(s) it is spent from held the
// instant before its period began (R13-03): the chosen account, else every
// asset account counted in the total balance. `null` when there is no such
// account — nothing to count, which is not a balance of zero.
async function balanceAtStart(prisma, userId, budget) {
  const { accounts } = await accountsWithBalances(prisma, userId, { now: new Date(budget.periodStart.getTime() - 1) });
  const inScope = accounts.filter(
    (account) =>
      !account.archivedAt &&
      !account.liability &&
      account.currency === budget.currency &&
      (budget.accountId ? account.id === budget.accountId : account.includeInTotal) &&
      // An account opened after the period is over brought nothing to it.
      (!account.openingDate || account.openingDate <= budget.periodEnd),
  );
  if (inScope.length === 0) return null;
  return inScope.reduce((sum, account) => sum + (account.solde.resultat ?? 0), 0);
}

// Everything one budget's view needs, in one place so the page and the home
// screen (P6-06) cannot read it two different ways.
export async function loadBudgetData(prisma, userId, budget) {
  const envelopeRows = await listEnvelopes(prisma, userId, budget.id);
  // The accounts the budget and its envelopes are spent from (R13-01).
  const spendAccountIds = [...new Set([budget.accountId, ...envelopeRows.map((envelope) => envelope.accountId)].filter(Boolean))];
  const [movementRows, incomes, goals, provisions] = await Promise.all([
    prisma.finTransaction.findMany({
      // Recette R9-06: an account kept apart from the total is not spent from the budget.
      // Recette R12-04: the last day of the period is spent from it too.
      // Recette R13-01: and the account the budget — or one of its envelopes — is spent from, whether or not it is in the total.
      where: {
        userId,
        deletedAt: null,
        OR: [{ accountId: null }, { account: { includeInTotal: true } }, ...(spendAccountIds.length > 0 ? [{ accountId: { in: spendAccountIds } }] : [])],
        occurredAt: { gte: budget.periodStart, lte: throughEndOfDay(budget.periodEnd) },
      },
      select: {
        id: true,
        accountId: true,
        account: { select: { includeInTotal: true } },
        kind: true,
        value: true,
        currency: true,
        categoryId: true,
        planned: true,
        status: true,
        occurredAt: true,
        category: { select: { family: true, group: true, essential: true } },
      },
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
    // The real goals' planned monthly contributions: what PB-F009 counts as
    // allocated outside the budget. A fictional goal plays with money that
    // was never planned, so it is left out.
    prisma.finGoal.findMany({
      where: { userId, deletedAt: null, archivedAt: null, status: { not: 'fictional' } },
      select: { currency: true, monthlyContribution: true },
    }),
    // The provisions still running at the start of the period: their monthly
    // amount is allocated outside the budget too (PB-F009, answer C2).
    prisma.finProvision.findMany({
      where: { userId, deletedAt: null, archivedAt: null, status: { not: 'fictional' }, targetDate: { gte: budget.periodStart } },
      select: { id: true, label: true, categoryId: true, value: true, provisioned: true, currency: true, targetDate: true },
    }),
  ]);
  const carries = budget.carryOver || budget.carryOverspend;
  const envelopes = await withMainCategoryGroups(prisma, envelopeRows);
  // R13-03: what the budget's account(s) held when the period began.
  const startBalance = await balanceAtStart(prisma, userId, budget);
  // `inTotal`: whether the account the movement is on is counted in the total balance (R13-01).
  const movements = movementRows.map(({ account, ...row }) => ({ ...row, inTotal: account ? account.includeInTotal : true }));
  // R17-01: the declared income of the period NOT received yet — the same « encore
  // attendu » as the Accueil (R10-05). With what has been received, it makes the
  // budget's resources: a salary counts once, expected then received, never twice.
  const to = throughEndOfDay(budget.periodEnd);
  const periodData = await loadCalendarData(prisma, userId, { from: budget.periodStart, to });
  const expectedIncome = collectEvents({ ...periodData, from: budget.periodStart, to, currency: budget.currency, occurrencesOf: occurrencesWithOutcome })
    .filter((event) => event.kind === 'recurrence' && event.inflow && event.currency === budget.currency && (!budget.accountId || !event.accountId || event.accountId === budget.accountId))
    .reduce((sum, event) => sum + event.value, 0);
  return { envelopes, movements, startBalance, incomes, goals, provisions, expectedIncome, carry: carries ? await carryFromPrevious(prisma, userId, budget) : null };
}

/**
 * « Report du reste » (PB-F008's « ajustements de report »), by what each
 * envelope of the previous budget covered. The client's answer C1
 * (2026-10-28): report = max(0 ; reste) when `carryOver` is set; the
 * OVERSPEND is carried (negative) only when the person chose `carryOverspend`
 * — otherwise it stays visible in its own month and nowhere else. One period
 * back only: a remainder carried from further back is already inside the
 * previous budget's own figures.
 */
async function carryFromPrevious(prisma, userId, budget) {
  const previous = await prisma.finBudget.findFirst({
    where: { userId, deletedAt: null, currency: budget.currency, periodEnd: { lt: budget.periodStart } },
    select: BUDGET_SELECT,
    orderBy: { periodEnd: 'desc' },
  });
  if (!previous) return null;
  const data = await loadBudgetData(prisma, userId, { ...previous, carryOver: false, carryOverspend: false });
  const view = buildBudgetView({ budget: previous, ...data, now: previous.periodEnd });
  const carry = {};
  for (const line of view.enveloppes) {
    const left = line.ecart.resultat;
    if (left === null) continue;
    const kept = (left > 0 && budget.carryOver) || (left < 0 && budget.carryOverspend);
    if (kept) carry[line.categoryGroup ? `group:${line.categoryGroup}` : `category:${line.categoryId}`] = left;
  }
  return { fromBudget: previous.id, amounts: carry };
}

// Every live budget whose period contains `at` (R11-10: there may be several).
/**
 * Recette R16 (2026-11-17): « les budgets liés à ce compte ne s'affichent même
 * pas et les dépenses rattachées aux budgets ne sont pas rapprochées ». The
 * current budgets that follow ONE account — tied to it, with an envelope tied
 * to it, or on the total balance when the account is in it — each with its
 * envelopes (planned, spent, rate), and for each expense of the account which
 * envelope it is counted in (`rapprochement`: movement id → { budgetId,
 * envelopeId | null, statut: 'envelope' | 'outside' | 'otherAccount' }).
 */
export async function budgetsOfAccount(prisma, userId, account, now = new Date()) {
  const rows = await currentBudgets(prisma, userId, now);
  const budgets = [];
  const rapprochement = {};
  for (const budget of rows) {
    if (budget.currency !== account.currency) continue;
    const data = await loadBudgetData(prisma, userId, budget);
    const tied = budget.accountId === account.id || data.envelopes.some((envelope) => envelope.accountId === account.id);
    const onTotal = !budget.accountId && account.includeInTotal;
    if (!tied && !onTotal) continue;
    const view = buildBudgetView({ budget, ...data, now });
    const ids = view.enveloppes.map((line) => line.categoryId).filter(Boolean);
    const labels = new Map((await prisma.finCategory.findMany({ where: { id: { in: ids } }, select: { id: true, label: true } })).map((row) => [row.id, row.label]));
    // The envelopes this account pays: its own, or the budget's when they follow it.
    const lines = view.enveloppes.filter((line) => {
      const from = line.accountId ?? budget.accountId ?? null;
      return from === account.id || (from === null && account.includeInTotal);
    });
    budgets.push({
      id: budget.id,
      label: budget.label,
      accountId: budget.accountId ?? null,
      totalPrevu: view.totalPrevu,
      totalReel: view.totalReel,
      enveloppes: lines.map((line) => ({ id: line.id, label: line.categoryGroup ?? labels.get(line.categoryId) ?? null, prevu: line.prevu, reel: line.reel, taux: line.tauxConsommation, alerte: line.alerte.niveau })),
    });
    const { byMovement } = assignToEnvelopes(
      data.movements.filter((row) => row.currency === budget.currency && row.accountId === account.id),
      data.envelopes,
      { accountId: budget.accountId ?? null },
    );
    for (const [movementId, target] of byMovement) {
      // A movement counted in an envelope of one budget is not overwritten by another budget's « outside ».
      if (rapprochement[movementId]?.statut === 'envelope') continue;
      const envelope = target === 'outside' || target === 'otherAccount' ? null : lines.find((line) => line.id === target) ?? view.enveloppes.find((line) => line.id === target);
      rapprochement[movementId] = {
        budgetId: budget.id,
        budget: budget.label,
        envelopeId: envelope?.id ?? null,
        enveloppe: envelope ? envelope.categoryGroup ?? labels.get(envelope.categoryId) ?? null : null,
        statut: envelope ? 'envelope' : target,
      };
    }
  }
  return { budgets, rapprochement };
}

export function currentBudgets(prisma, userId, at = new Date()) {
  const today = new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate()));
  return prisma.finBudget.findMany({
    where: { userId, deletedAt: null, archivedAt: null, periodStart: { lte: at }, periodEnd: { gte: today } },
    select: BUDGET_SELECT,
    orderBy: { periodStart: 'desc' },
  });
}

// The budget whose period contains `at` — what "my budget" means on a home
// screen: with several, the one started last. `null` when none does, which is
// a normal state, not an error.
export function currentBudget(prisma, userId, at = new Date()) {
  // A period ends on a DATE (stored at midnight): on its last day, at any hour,
  // the budget is still the current one.
  const today = new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate()));
  return prisma.finBudget.findFirst({
    where: { userId, deletedAt: null, archivedAt: null, periodStart: { lte: at }, periodEnd: { gte: today } },
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
