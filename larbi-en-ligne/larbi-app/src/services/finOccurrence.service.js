// The occurrences of a recurrence (P8-11, tab 08B): when each one falls, what
// the person said about it, and the movement it became. A planned or expected
// event never touches the real before it is confirmed — except for a
// recurrence the person set to « créer automatiquement comme réalisé ».
import { HttpError } from '../utils/httpError.js';
import { ensureCashAccount, usableAccount } from './finAccount.service.js';
import { dayKey, occurrencesOf } from './finCalendarView.service.js';
import { recordChange } from './finChange.service.js';

// The weekend in Algeria, where FINCLUDIA is designed for: Friday and Saturday
// (UTC day numbers 5 and 6). PB-F021's « règle jour » shifts a usual day that
// falls on it.
export const WEEKEND_DAYS = [5, 6];
const DAY = 24 * 3600 * 1000;

/**
 * PB-F021 — the date an occurrence really falls on: the usual date, moved to
 * the previous working day (the default, question C4), the next one, or left
 * as it is.
 */
export function shiftForWeekend(date, rule = 'previous') {
  if (rule === 'none') return date;
  let shifted = date;
  for (let guard = 0; guard < 7 && WEEKEND_DAYS.includes(shifted.getUTCDay()); guard += 1) {
    shifted = new Date(shifted.getTime() + (rule === 'next' ? DAY : -DAY));
  }
  return shifted;
}

/**
 * Every occurrence of one recurrence over [from, to] with what was said about
 * it: the due date (the usual date), the day it falls (weekend rule applied,
 * or the day it was postponed to), and its outcome — `null` while still
 * expected.
 */
export function occurrencesWithOutcome(recurrence, outcomes, from, to) {
  const byDue = new Map(outcomes.filter((row) => row.recurrenceId === recurrence.id).map((row) => [dayKey(row.dueDate), row]));
  const list = occurrencesOf(recurrence, from, to).map((due) => {
    const outcome = byDue.get(dayKey(due)) ?? null;
    const falls = outcome?.outcome === 'postponed' && outcome.postponedTo ? outcome.postponedTo : shiftForWeekend(due, recurrence.weekendRule);
    return { dueDate: due, date: falls, outcome: outcome?.outcome ?? null, transactionId: outcome?.transactionId ?? null };
  });
  // An occurrence postponed INTO this window from before it still has to show.
  for (const row of outcomes) {
    if (row.recurrenceId !== recurrence.id || row.outcome !== 'postponed' || !row.postponedTo) continue;
    if (row.postponedTo < from || row.postponedTo > to || list.some((item) => dayKey(item.dueDate) === dayKey(row.dueDate))) continue;
    list.push({ dueDate: row.dueDate, date: row.postponedTo, outcome: 'postponed', transactionId: null });
  }
  return list;
}

async function ownRecurrence(prisma, userId, id) {
  const row = await prisma.finRecurrence.findFirst({ where: { id, userId, deletedAt: null } });
  if (!row) throw new HttpError(404, 'Recurrence not found');
  return row;
}

// The movement one occurrence becomes, written with its outcome in ONE
// transaction. The unique (recurrence, due date) is what makes a salary
// impossible to credit twice (QA-P05): a second confirmation is refused.
async function realise(tx, userId, recurrence, { dueDate, value, occurredAt, source }) {
  const accountId = recurrence.accountId ?? (await ensureCashAccount(tx, userId, recurrence.currency));
  const transaction = await tx.finTransaction.create({
    data: {
      userId,
      kind: recurrence.kind,
      accountId,
      value,
      currency: recurrence.currency,
      occurredAt,
      categoryId: recurrence.categoryId ?? null,
      note: recurrence.label,
      source,
      sourceRef: `recurrence:${recurrence.id}:${dayKey(dueDate)}`,
      status: 'real',
    },
    select: { id: true },
  });
  await tx.finOccurrence.create({
    data: { userId, recurrenceId: recurrence.id, dueDate, outcome: 'confirmed', transactionId: transaction.id, source, status: 'real' },
  });
  return transaction.id;
}

/**
 * What the person says the day an occurrence falls (tab 02, step P2):
 * « Confirmer » (as expected), « Modifier » (another amount or day), « Pas
 * reçu », « Reporter ».
 */
export async function recordOccurrence(prisma, userId, body) {
  const recurrence = await ownRecurrence(prisma, userId, body.recurrenceId);
  if (recurrence.accountId) await usableAccount(prisma, userId, recurrence.accountId, recurrence.currency);
  const dueDate = new Date(`${dayKey(body.dueDate)}T00:00:00.000Z`);
  const existing = await prisma.finOccurrence.findUnique({ where: { recurrenceId_dueDate: { recurrenceId: recurrence.id, dueDate } } });
  if (existing && existing.outcome !== 'postponed') throw new HttpError(409, 'Occurrence already settled', { reason: 'alreadySettled' });

  return prisma.$transaction(async (tx) => {
    if (existing) await tx.finOccurrence.delete({ where: { id: existing.id } });
    let transactionId = null;
    if (body.action === 'confirm' || body.action === 'modify') {
      const occurredAt = body.action === 'modify' && body.occurredAt ? body.occurredAt : shiftForWeekend(dueDate, recurrence.weekendRule);
      if (occurredAt.getTime() > Date.now()) throw new HttpError(422, 'Not yet happened', { reason: 'futureDate' });
      transactionId = await realise(tx, userId, recurrence, { dueDate, value: body.action === 'modify' && body.value ? body.value : recurrence.value, occurredAt, source: 'manual' });
    } else if (body.action === 'missed') {
      await tx.finOccurrence.create({ data: { userId, recurrenceId: recurrence.id, dueDate, outcome: 'missed', source: 'manual', status: 'declared' } });
    } else {
      if (!body.postponedTo) throw new HttpError(422, 'A new date is needed', { reason: 'postponedTo' });
      await tx.finOccurrence.create({ data: { userId, recurrenceId: recurrence.id, dueDate, outcome: 'postponed', postponedTo: body.postponedTo, source: 'manual', status: 'declared' } });
    }
    await recordChange(tx, { userId, entity: 'recurrence', entityId: recurrence.id, action: 'correct', field: 'occurrence', after: { dueDate: dayKey(dueDate), action: body.action } });
    return { recurrenceId: recurrence.id, dueDate: dayKey(dueDate), action: body.action, transactionId };
  });
}

/**
 * « Créer automatiquement comme réalisé »: the occurrences already due of the
 * recurrences set that way become real movements, once each. Looked at over
 * the last 62 days only, so a forgotten old recurrence does not flood the
 * history in one go.
 */
export async function settleAutomatic(prisma, userId, now = new Date()) {
  const from = new Date(now.getTime() - 62 * DAY);
  const recurrences = await prisma.finRecurrence.findMany({
    where: { userId, deletedAt: null, archivedAt: null, creationMode: 'auto_real', status: { not: 'fictional' } },
  });
  if (recurrences.length === 0) return 0;
  const outcomes = await prisma.finOccurrence.findMany({ where: { userId, recurrenceId: { in: recurrences.map((row) => row.id) }, dueDate: { gte: new Date(from.getTime() - 31 * DAY) } } });
  let created = 0;
  for (const recurrence of recurrences) {
    for (const occurrence of occurrencesWithOutcome(recurrence, outcomes, from, now)) {
      if (occurrence.outcome || occurrence.date > now) continue;
      try {
        await prisma.$transaction((tx) => realise(tx, userId, recurrence, { dueDate: occurrence.dueDate, value: recurrence.value, occurredAt: occurrence.date, source: 'computed' }));
        created += 1;
      } catch (err) {
        // Two screens loading at once: the unique (recurrence, due date) lets
        // only one of them write, and the other has nothing to do.
        if (err.code !== 'P2002') throw err;
      }
    }
  }
  return created;
}
