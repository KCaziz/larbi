// The occurrences of a recurrence (P8-11, tab 08B): when each one falls, what
// the person said about it, and the movement it became. A planned or expected
// event never touches the real before it is confirmed — except for a
// recurrence the person set to « créer automatiquement comme réalisé ».
import { HttpError } from '../utils/httpError.js';
import { ensureCashAccount, usableAccount } from './finAccount.service.js';
import { isLiability } from '../constants/finAccounts.js';
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

// How far from the expected date a movement still counts as « that payment » (R13-06).
export const RECURRENCE_MATCH_DAYS = 10;

/**
 * The payments the person declared that a movement they are entering could be
 * (R13-06, « le détecteur d'une même opération »): same kind, currency and
 * amount, same category, and an occurrence still EXPECTED within ten days of
 * the movement's date. Asked BEFORE the movement is saved: if it is that
 * payment, it is recorded once, as the payment, not once more beside it.
 * A recurrence with no category is matched on the amount alone.
 */
export async function findRecurrenceMatches(prisma, userId, { kind, value, currency, categoryId, occurredAt }) {
  const candidates = await prisma.finRecurrence.findMany({
    where: { userId, deletedAt: null, archivedAt: null, kind, currency, value, OR: [{ categoryId: categoryId ?? null }, { categoryId: null }] },
  });
  if (candidates.length === 0) return [];
  const from = new Date(occurredAt.getTime() - RECURRENCE_MATCH_DAYS * DAY);
  const to = new Date(occurredAt.getTime() + RECURRENCE_MATCH_DAYS * DAY);
  const outcomes = await prisma.finOccurrence.findMany({ where: { userId, recurrenceId: { in: candidates.map((row) => row.id) } } });
  const matches = [];
  for (const recurrence of candidates) {
    for (const item of occurrencesWithOutcome(recurrence, outcomes, from, to)) {
      if (item.outcome === null) matches.push({ recurrenceId: recurrence.id, label: recurrence.label, dueDate: dayKey(item.dueDate), date: item.date });
    }
  }
  return matches.sort((a, b) => Math.abs(new Date(a.date) - occurredAt) - Math.abs(new Date(b.date) - occurredAt)).slice(0, 3);
}

/**
 * Says that a movement just written IS an occurrence of a recurrence (R13-06),
 * inside the caller's transaction: the occurrence is settled with the movement
 * as its result, so the payment exists once and the calendar stops expecting
 * it. Refused if the occurrence is not one of the recurrence's, or was already
 * settled (the unique (recurrence, due date) keeps a payment from being
 * counted twice).
 */
export async function linkMovementToOccurrence(tx, userId, { recurrenceId, dueDate }, transactionId) {
  const recurrence = await tx.finRecurrence.findFirst({ where: { id: recurrenceId, userId, deletedAt: null } });
  if (!recurrence) throw new HttpError(404, 'Recurrence not found');
  const due = new Date(`${dayKey(dueDate)}T00:00:00.000Z`);
  if (!occurrencesOf(recurrence, due, due).some((date) => dayKey(date) === dayKey(due))) {
    throw new HttpError(422, 'This is not an occurrence of that recurrence', { reason: 'notAnOccurrence' });
  }
  const existing = await tx.finOccurrence.findUnique({ where: { recurrenceId_dueDate: { recurrenceId, dueDate: due } } });
  if (existing) throw new HttpError(409, 'Occurrence already settled', { reason: 'alreadySettled' });
  await tx.finOccurrence.create({ data: { userId, recurrenceId, dueDate: due, outcome: 'confirmed', transactionId, source: 'manual', status: 'real' } });
  await recordChange(tx, { userId, entity: 'recurrence', entityId: recurrenceId, action: 'correct', field: 'occurrence', after: { dueDate: dayKey(due), action: 'linked', transactionId } });
}

async function ownRecurrence(prisma, userId, id) {
  const row = await prisma.finRecurrence.findFirst({ where: { id, userId, deletedAt: null } });
  if (!row) throw new HttpError(404, 'Recurrence not found');
  return row;
}

// The movement one occurrence becomes, written with its outcome in ONE
// transaction. The unique (recurrence, due date) is what makes a salary
// impossible to credit twice (QA-P05): a second confirmation is refused.
async function realise(tx, userId, recurrence, { dueDate, value, occurredAt, source, outcome = 'confirmed' }) {
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
    data: { userId, recurrenceId: recurrence.id, dueDate, outcome, transactionId: transaction.id, source, status: 'real' },
  });
  return { transactionId: transaction.id, accountId };
}

// How a movement of each kind moves the balance of an asset account.
const SIGNS = { income: 1, expense: -1 };

// Recette R12-03: a movement that was already inside the starting balance is
// taken back out of it, so recording it leaves the balance as it was. A debt
// account (card, loan) reads the other way round (PB-F027).
async function takeOutOfOpeningBalance(tx, userId, accountId, flow) {
  const account = await tx.finAccount.findFirst({ where: { id: accountId, userId }, select: { id: true, type: true, openingBalance: true } });
  if (!account || !flow) return;
  const before = account.openingBalance;
  const after = isLiability(account.type) ? before + flow : before - flow;
  await tx.finAccount.update({ where: { id: account.id }, data: { openingBalance: after, version: { increment: 1 } } });
  await recordChange(tx, { userId, entity: 'account', entityId: account.id, action: 'correct', field: 'openingBalance', before, after, reason: 'already in the starting balance' });
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
      ({ transactionId } = await realise(tx, userId, recurrence, { dueDate, value: body.action === 'modify' && body.value ? body.value : recurrence.value, occurredAt, source: 'manual' }));
    } else if (body.action === 'included') {
      // « Déjà compté dans le solde de départ » (R11-12, recette R12-03). It
      // used to be settled with nothing written: the balance was right, but
      // the salary was counted in no month (« le revenu n'est jamais pris en
      // compte »). Now it is a real movement of its month, AND the starting
      // balance is brought back to what it was before it — the client's own
      // way: start from the starting balance, add the incomes, recompute. The
      // balance shown does not move; the money is never counted twice.
      if (dueDate.getTime() > Date.now()) throw new HttpError(422, 'Not yet happened', { reason: 'futureDate' });
      const shifted = shiftForWeekend(dueDate, recurrence.weekendRule);
      const occurredAt = shifted.getTime() > Date.now() ? dueDate : shifted;
      let accountId;
      ({ transactionId, accountId } = await realise(tx, userId, recurrence, { dueDate, value: recurrence.value, occurredAt, source: 'manual', outcome: 'included' }));
      await takeOutOfOpeningBalance(tx, userId, accountId, SIGNS[recurrence.kind] * recurrence.value);
    } else if (body.action === 'missed') {
      // « Pas reçu »: settled, nothing credited.
      await tx.finOccurrence.create({ data: { userId, recurrenceId: recurrence.id, dueDate, outcome: body.action, source: 'manual', status: 'declared' } });
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
