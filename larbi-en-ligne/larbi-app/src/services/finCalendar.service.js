// Calendar, recurrences and provisions (P6-07): the writes and the reads. The
// computation is in finCalendarView.service.js — storing a row and explaining a
// figure are two different concerns.
//
// Everything here is scoped to ONE account. `userId` is part of every filter,
// never only of the object's identity: a row that is not yours is "not found".

import { usableAccount } from './finAccount.service.js';
import { DETECTION_DEFAULTS, DETECTION_WINDOW_DAYS } from '../constants/finCalendar.js';
import { FREQUENCIES } from '../constants/finance.js';
import { TRANSACTION_KINDS } from '../constants/finMoney.js';
import { HttpError } from '../utils/httpError.js';
import { detectRecurrences } from './finance/algorithms.js';
import { recordChange, recordCorrection } from './finChange.service.js';

export const RECURRENCE_ENTITY = 'recurrence';
export const PROVISION_ENTITY = 'provision';

const DAY = 24 * 3600 * 1000;

const RECURRENCE_SELECT = {
  id: true,
  label: true,
  categoryId: true,
  kind: true,
  value: true,
  currency: true,
  frequency: true,
  nextDate: true,
  endDate: true,
  reminderDays: true,
  detected: true,
  accountId: true,
  creationMode: true,
  weekendRule: true,
  note: true,
  scope: true,
  source: true,
  sourceRef: true,
  status: true,
  confidence: true,
  consentUses: true,
  version: true,
  archivedAt: true,
};

const PROVISION_SELECT = {
  id: true,
  label: true,
  categoryId: true,
  value: true,
  currency: true,
  provisioned: true,
  targetDate: true,
  reminderDays: true,
  note: true,
  scope: true,
  source: true,
  status: true,
  confidence: true,
  consentUses: true,
  version: true,
  archivedAt: true,
};

// A category the caller may point at: one of the client's standard rows or one
// of their own. Someone else's is "not found" — pointing at it would otherwise
// leak that it exists.
async function usableCategory(prisma, userId, categoryId) {
  if (categoryId === null || categoryId === undefined) return null;
  const row = await prisma.finCategory.findFirst({
    where: { id: categoryId, deletedAt: null, OR: [{ userId: null }, { userId }] },
    select: { id: true, archivedAt: true },
  });
  if (!row) throw new HttpError(422, 'Unknown category', { reason: 'unknownCategory' });
  if (row.archivedAt) throw new HttpError(422, 'Archived category', { reason: 'archivedCategory' });
  return row.id;
}

// ---- recurrences -----------------------------------------------------------

export function listRecurrences(prisma, userId, { includeArchived = false } = {}) {
  return prisma.finRecurrence.findMany({
    where: { userId, deletedAt: null, ...(includeArchived ? {} : { archivedAt: null }) },
    select: RECURRENCE_SELECT,
    orderBy: { nextDate: 'asc' },
  });
}

export async function createRecurrence(prisma, userId, body) {
  if (!FREQUENCIES.includes(body.frequency)) throw new HttpError(422, 'Unknown frequency', { reason: 'unknownFrequency' });
  if (!TRANSACTION_KINDS.includes(body.kind)) throw new HttpError(422, 'Unknown kind', { reason: 'unknownKind' });
  const categoryId = await usableCategory(prisma, userId, body.categoryId ?? null);
  // The account the occurrences go on (tab 08B): this person's, open, same
  // currency. None chosen: the « Espèces » account when one is realised.
  if (body.accountId) await usableAccount(prisma, userId, body.accountId, body.currency);

  return prisma.$transaction(async (tx) => {
    const row = await tx.finRecurrence.create({
      data: {
        userId,
        label: body.label,
        categoryId,
        kind: body.kind,
        value: body.value,
        currency: body.currency,
        frequency: body.frequency,
        nextDate: body.nextDate,
        endDate: body.endDate ?? null,
        reminderDays: body.reminderDays ?? [7, 1],
        accountId: body.accountId ?? null,
        // « À confirmer » is the client's recommendation for income, and the
        // safe default for everything: nothing real happens without the person.
        creationMode: body.creationMode ?? 'confirm',
        weekendRule: body.weekendRule ?? 'previous',
        // `detected` is only ever set by confirming a detection, never by the
        // caller: it says where the row came from, and a client that could
        // claim it would make that trace worthless.
        detected: body.detected === true,
        note: body.note ?? null,
        scope: body.scope ?? 'personal',
        consentUses: body.consentUses ?? [],
        source: 'manual',
        sourceRef: body.sourceRef ?? null,
        // A recurrence is what the person says recurs: declared, not realised.
        // Its occurrences become real movements one by one, when confirmed.
        status: body.status ?? 'declared',
      },
      select: RECURRENCE_SELECT,
    });
    await recordChange(tx, {
      userId,
      entity: RECURRENCE_ENTITY,
      entityId: row.id,
      action: 'create',
      after: { label: row.label, value: row.value, currency: row.currency, frequency: row.frequency, nextDate: row.nextDate },
    });
    return row;
  });
}

async function ownRecurrence(prisma, userId, id) {
  const row = await prisma.finRecurrence.findFirst({ where: { id, userId, deletedAt: null }, select: { ...RECURRENCE_SELECT, userId: true } });
  if (!row) throw new HttpError(404, 'Recurrence not found');
  return row;
}

export async function updateRecurrence(prisma, userId, id, body) {
  const before = await ownRecurrence(prisma, userId, id);
  const { reason, ...fields } = body;
  if (fields.frequency !== undefined && !FREQUENCIES.includes(fields.frequency)) {
    throw new HttpError(422, 'Unknown frequency', { reason: 'unknownFrequency' });
  }
  if (fields.categoryId !== undefined) fields.categoryId = await usableCategory(prisma, userId, fields.categoryId);
  if (fields.accountId) await usableAccount(prisma, userId, fields.accountId, fields.currency ?? before.currency);
  const nextDate = fields.nextDate ?? before.nextDate;
  const endDate = fields.endDate === undefined ? before.endDate : fields.endDate;
  if (endDate && endDate < nextDate) throw new HttpError(422, 'A recurrence never ends before its next date', { reason: 'dates' });

  return prisma.$transaction(async (tx) => {
    const after = await tx.finRecurrence.update({ where: { id }, data: { ...fields, version: { increment: 1 } }, select: RECURRENCE_SELECT });
    await recordCorrection(tx, { userId, entity: RECURRENCE_ENTITY, entityId: id, before, after, reason: reason ?? null });
    return after;
  });
}

export async function setRecurrenceArchived(prisma, userId, id, archived, { reason } = {}) {
  const before = await ownRecurrence(prisma, userId, id);
  const archivedAt = archived ? new Date() : null;
  return prisma.$transaction(async (tx) => {
    const after = await tx.finRecurrence.update({ where: { id }, data: { archivedAt }, select: RECURRENCE_SELECT });
    await recordChange(tx, {
      userId,
      entity: RECURRENCE_ENTITY,
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

// Logical deletion, like every financial row (P6-02).
//
// Note what this is NOT: stopping to track a subscription is not cancelling it.
// The client is explicit — « jamais de résiliation automatique » — and nothing
// in FINCLUDIA ever contacts a provider. Deleting the row only means the
// calendar stops expecting it.
export async function deleteRecurrence(prisma, userId, id, { reason } = {}) {
  await ownRecurrence(prisma, userId, id);
  await prisma.$transaction(async (tx) => {
    await tx.finRecurrence.update({ where: { id }, data: { deletedAt: new Date() } });
    await recordChange(tx, { userId, entity: RECURRENCE_ENTITY, entityId: id, action: 'delete', field: 'deletedAt', after: true, reason: reason ?? null });
  });
  return { id };
}

// ---- detection (ALG-04) ----------------------------------------------------

/**
 * Recurrences the person's own history suggests — CANDIDATES, nothing more.
 *
 * The client requires detection to be « proposée puis confirmée » : this reads,
 * never writes, and `confirmed` is false on every line ALG-04 returns. What is
 * already tracked is filtered out, so the same subscription is not proposed
 * again every time the page is opened.
 */
export async function detectCandidates(prisma, userId, { currency, options = {}, now = new Date() } = {}) {
  const from = new Date(now.getTime() - DETECTION_WINDOW_DAYS * DAY);
  const rows = await prisma.finTransaction.findMany({
    where: {
      userId,
      deletedAt: null,
      planned: false,
      status: 'real',
      currency,
      occurredAt: { gte: from, lte: now },
      // A pattern needs something to match on: ALG-04 groups by label, and the
      // label of a movement is the note the person typed.
      note: { not: null },
    },
    select: { note: true, value: true, occurredAt: true, categoryId: true, kind: true },
  });

  const candidates =
    detectRecurrences(
      rows.map((row) => ({ label: row.note, amount: row.value, date: row.occurredAt })),
      { ...DETECTION_DEFAULTS, ...options },
    ) ?? [];

  // Already tracked: compared on the normalised label, which is what ALG-04
  // groups by.
  const tracked = new Set(
    (await listRecurrences(prisma, userId)).map((row) =>
      String(row.label)
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .trim(),
    ),
  );

  // The category and the direction of the movements behind each candidate, so
  // confirming one does not ask the person to retype what we already know.
  const byLabel = new Map();
  for (const row of rows) {
    const key = String(row.note)
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .trim();
    if (!byLabel.has(key)) byLabel.set(key, row);
  }

  return candidates
    .filter((candidate) => !tracked.has(candidate.label))
    .map((candidate) => ({
      ...candidate,
      currency,
      categoryId: byLabel.get(candidate.label)?.categoryId ?? null,
      kind: byLabel.get(candidate.label)?.kind ?? 'expense',
      // The frequency ALG-04's average interval is closest to, as a SUGGESTION
      // the person changes if it is wrong. The algorithm measures days; the
      // rest of FINCLUDIA works in the client's frequency list.
      frequency: frequencyForInterval(candidate.averageIntervalDays),
      parametres: { ...DETECTION_DEFAULTS, ...options },
    }));
}

// The client's frequency whose interval is nearest. A suggestion, never a
// conclusion: the person confirms it, and an interval nothing is close to gets
// no frequency rather than the least wrong one.
export function frequencyForInterval(days) {
  const table = [
    ['hebdomadaire', 7],
    ['mensuel', 30],
    ['trimestriel', 91],
    ['semestriel', 182],
    ['annuel', 365],
  ];
  let best = null;
  for (const [frequency, reference] of table) {
    // Within a quarter of the interval: 30 days is monthly, 45 is neither
    // monthly nor quarterly and says so.
    if (Math.abs(days - reference) <= reference * 0.25) {
      const distance = Math.abs(days - reference);
      if (!best || distance < best.distance) best = { frequency, distance };
    }
  }
  return best?.frequency ?? null;
}

/**
 * Confirms one candidate: THIS is what creates a recurrence.
 *
 * Nothing is created from a detection without this call, which is the client's
 * rule in one place rather than a convention several callers have to remember.
 */
export function confirmCandidate(prisma, userId, body) {
  return createRecurrence(prisma, userId, { ...body, detected: true, sourceRef: 'detection:ALG-04' });
}

// ---- provisions ------------------------------------------------------------

export function listProvisions(prisma, userId, { includeArchived = false } = {}) {
  return prisma.finProvision.findMany({
    where: { userId, deletedAt: null, ...(includeArchived ? {} : { archivedAt: null }) },
    select: PROVISION_SELECT,
    orderBy: { targetDate: 'asc' },
  });
}

export async function createProvision(prisma, userId, body) {
  const categoryId = await usableCategory(prisma, userId, body.categoryId ?? null);
  if ((body.provisioned ?? 0) > body.value) {
    throw new HttpError(422, 'More has been set aside than the expense itself', { reason: 'provisionedAboveValue' });
  }

  return prisma.$transaction(async (tx) => {
    const row = await tx.finProvision.create({
      data: {
        userId,
        label: body.label,
        categoryId,
        value: body.value,
        currency: body.currency,
        provisioned: body.provisioned ?? 0,
        targetDate: body.targetDate,
        reminderDays: body.reminderDays ?? [7, 1],
        note: body.note ?? null,
        scope: body.scope ?? 'personal',
        consentUses: body.consentUses ?? [],
        source: 'manual',
        // A provision is money set aside for a dated expense: declared. It
        // NEVER becomes a realised expense on its own (the client's rule) — the
        // expense is a movement, recorded when it is actually paid.
        status: body.status ?? 'declared',
      },
      select: PROVISION_SELECT,
    });
    await recordChange(tx, {
      userId,
      entity: PROVISION_ENTITY,
      entityId: row.id,
      action: 'create',
      after: { label: row.label, value: row.value, currency: row.currency, targetDate: row.targetDate },
    });
    return row;
  });
}

async function ownProvision(prisma, userId, id) {
  const row = await prisma.finProvision.findFirst({ where: { id, userId, deletedAt: null }, select: { ...PROVISION_SELECT, userId: true } });
  if (!row) throw new HttpError(404, 'Provision not found');
  return row;
}

export async function updateProvision(prisma, userId, id, body) {
  const before = await ownProvision(prisma, userId, id);
  const { reason, ...fields } = body;
  if (fields.categoryId !== undefined) fields.categoryId = await usableCategory(prisma, userId, fields.categoryId);
  const value = fields.value ?? before.value;
  const provisioned = fields.provisioned ?? before.provisioned;
  if (provisioned > value) throw new HttpError(422, 'More has been set aside than the expense itself', { reason: 'provisionedAboveValue' });

  return prisma.$transaction(async (tx) => {
    const after = await tx.finProvision.update({ where: { id }, data: { ...fields, version: { increment: 1 } }, select: PROVISION_SELECT });
    await recordCorrection(tx, { userId, entity: PROVISION_ENTITY, entityId: id, before, after, reason: reason ?? null });
    return after;
  });
}

export async function deleteProvision(prisma, userId, id, { reason } = {}) {
  await ownProvision(prisma, userId, id);
  await prisma.$transaction(async (tx) => {
    await tx.finProvision.update({ where: { id }, data: { deletedAt: new Date() } });
    await recordChange(tx, { userId, entity: PROVISION_ENTITY, entityId: id, action: 'delete', field: 'deletedAt', after: true, reason: reason ?? null });
  });
  return { id };
}

// ---- planned movements -----------------------------------------------------

/**
 * « Marquer payé » — the confirmation that turns a plan into a fact.
 *
 * The planned movement is not duplicated: the SAME row stops being planned and
 * becomes real, on the date it actually happened. That is what makes double
 * counting impossible — there was never a second row to count.
 *
 * The correction is journalled like any other, so the history says the movement
 * was planned before it was real.
 */
export async function markPlannedPaid(prisma, userId, id, { occurredAt, value, reason } = {}) {
  const before = await prisma.finTransaction.findFirst({
    where: { id, userId, deletedAt: null },
    select: { id: true, kind: true, value: true, currency: true, occurredAt: true, planned: true, status: true, categoryId: true, note: true },
  });
  if (!before) throw new HttpError(404, 'Transaction not found');
  if (!before.planned) throw new HttpError(422, 'This movement is not a planned one', { reason: 'notPlanned' });

  const paidAt = occurredAt ?? new Date();
  if (paidAt.getTime() > Date.now()) {
    throw new HttpError(422, 'A movement cannot be confirmed as paid in the future', { reason: 'futureDate' });
  }

  return prisma.$transaction(async (tx) => {
    const after = await tx.finTransaction.update({
      where: { id },
      data: {
        planned: false,
        status: 'real',
        occurredAt: paidAt,
        // The amount actually paid may differ from the amount planned, and the
        // real one is the one that counts.
        ...(value === undefined ? {} : { value }),
        version: { increment: 1 },
      },
      select: { id: true, kind: true, value: true, currency: true, occurredAt: true, planned: true, status: true, categoryId: true, note: true },
    });
    await recordCorrection(tx, { userId, entity: 'transaction', entityId: id, before, after, reason: reason ?? 'marqué payé' });
    return after;
  });
}

/**
 * The plan of the month, copied from the month before (screen SA03).
 *
 * Only the PLANNED movements are copied, shifted by one month: a realised
 * movement is a fact about the past and copying it would invent a payment. The
 * day is clamped to the target month, like everywhere else in Phase 6.
 *
 * Returns the created rows. Nothing is overwritten: a movement already planned
 * for the target month is left alone and reported as skipped, so running this
 * twice does not double the plan.
 */
export async function copyPlanFromPreviousMonth(prisma, userId, { month, currency }) {
  const start = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1));
  const end = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 1) - 1);
  const previousStart = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() - 1, 1));
  const previousEnd = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1) - 1);

  const [source, existing] = await Promise.all([
    prisma.finTransaction.findMany({
      where: { userId, deletedAt: null, planned: true, currency, occurredAt: { gte: previousStart, lte: previousEnd } },
      select: { kind: true, value: true, currency: true, occurredAt: true, categoryId: true, subcategory: true, paymentMethod: true, note: true, scope: true },
    }),
    prisma.finTransaction.findMany({
      where: { userId, deletedAt: null, planned: true, currency, occurredAt: { gte: start, lte: end } },
      select: { value: true, categoryId: true, note: true },
    }),
  ]);

  const already = new Set(existing.map((row) => `${row.categoryId ?? ''}:${row.value}:${row.note ?? ''}`));
  const created = [];
  let skipped = 0;

  for (const row of source) {
    const key = `${row.categoryId ?? ''}:${row.value}:${row.note ?? ''}`;
    if (already.has(key)) {
      skipped += 1;
      continue;
    }
    const lastDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)).getUTCDate();
    const occurredAt = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), Math.min(row.occurredAt.getUTCDate(), lastDay), 12, 0, 0),
    );
    // eslint-disable-next-line no-await-in-loop -- one journal row per copy, in its own transaction
    const copy = await prisma.$transaction(async (tx) => {
      const made = await tx.finTransaction.create({
        data: {
          userId,
          kind: row.kind,
          value: row.value,
          currency: row.currency,
          occurredAt,
          categoryId: row.categoryId,
          subcategory: row.subcategory,
          paymentMethod: row.paymentMethod,
          note: row.note,
          scope: row.scope,
          planned: true,
          source: 'manual',
          sourceRef: 'plan:mois-precedent',
          // Planned, therefore declared — not real. The whole point of the
          // client's rule is that copying a plan creates no fact.
          status: 'declared',
        },
        select: { id: true, kind: true, value: true, currency: true, occurredAt: true, categoryId: true, note: true, planned: true, status: true },
      });
      await recordChange(tx, {
        userId,
        entity: 'transaction',
        entityId: made.id,
        action: 'create',
        after: { kind: made.kind, value: made.value, currency: made.currency, occurredAt: made.occurredAt },
        reason: 'copié du mois précédent',
      });
      return made;
    });
    created.push(copy);
    already.add(key);
  }

  return { created, skipped, periode: { debut: start, fin: end }, source: { debut: previousStart, fin: previousEnd } };
}

// ---- reads for the calendar ------------------------------------------------

// Everything the calendar of [from, to] needs, in one place so the page and the
// home screen (P6-06) cannot read it two different ways.
export async function loadCalendarData(prisma, userId, { from, to }) {
  const [planned, recurrences, provisions, realised] = await Promise.all([
    prisma.finTransaction.findMany({
      where: { userId, deletedAt: null, planned: true, occurredAt: { gte: from, lte: to } },
      select: { id: true, kind: true, value: true, currency: true, occurredAt: true, categoryId: true, note: true, status: true },
    }),
    prisma.finRecurrence.findMany({
      where: { userId, deletedAt: null, archivedAt: null, OR: [{ endDate: null }, { endDate: { gte: from } }] },
      select: {
        id: true,
        label: true,
        kind: true,
        value: true,
        currency: true,
        frequency: true,
        nextDate: true,
        endDate: true,
        categoryId: true,
        accountId: true,
        creationMode: true,
        weekendRule: true,
        // The reminders read it (P8-11): without it, no recurrence was ever
        // reminded of (found by QA-P05, 2026-10-28).
        reminderDays: true,
      },
    }),
    prisma.finProvision.findMany({
      where: { userId, deletedAt: null, archivedAt: null, targetDate: { gte: from, lte: to } },
      select: { id: true, label: true, value: true, provisioned: true, currency: true, targetDate: true, categoryId: true },
    }),
    prisma.finTransaction.findMany({
      where: { userId, deletedAt: null, planned: false, occurredAt: { gte: from, lte: to } },
      select: { id: true, kind: true, value: true, currency: true, planned: true, status: true },
    }),
  ]);
  // P8-11: what was said about each occurrence (a month either side, for the
  // postponed ones), and the « Échéances » of debts and goals.
  const margin = 31 * 24 * 3600 * 1000;
  const [outcomes, debts, goals] = await Promise.all([
    prisma.finOccurrence.findMany({
      where: { userId, OR: [{ dueDate: { gte: new Date(from.getTime() - margin), lte: new Date(to.getTime() + margin) } }, { postponedTo: { gte: from, lte: to } }] },
      select: { recurrenceId: true, dueDate: true, outcome: true, postponedTo: true, transactionId: true },
    }),
    prisma.finDebt.findMany({
      where: { userId, deletedAt: null, archivedAt: null, dueDate: { gte: from, lte: to } },
      select: { id: true, label: true, dueDate: true, monthlyInstalment: true, currency: true },
    }),
    prisma.finGoal.findMany({
      where: { userId, deletedAt: null, archivedAt: null, targetDate: { gte: from, lte: to } },
      select: { id: true, label: true, targetDate: true, target: true, currency: true },
    }),
  ]);
  return { planned, recurrences, provisions, realised, outcomes, debts, goals };
}
