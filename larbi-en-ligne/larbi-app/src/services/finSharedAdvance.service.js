// A shared expense paid with the payer's own money (P9-15, client's answer G of
// 2026-11-02): the ACCOUNT is debited of the whole amount, the BUDGET bears only
// the payer's definitive share, and what the others owe is an « avance
// collective » — a receivable (AC-09) the payer recovers.
//
// Client's example: A pays 9 000 DA of groceries for A, B and C in equal parts.
// A's account: -9 000. A's personal expense: 3 000. Advance to recover: 6 000.
// When B pays back 3 000, A's account rises by 3 000 but that is NOT an income:
// the receivable goes from 6 000 to 3 000.
//
// It is the « J'ai prêté » mechanism of P8-13: an expense for the share plus a
// TRANSFER of the rest to a receivable account, and a reimbursement is a
// transfer back. No spending calculation has to change.
//
// The row that did it (FinSharedExpense) remembers what it made, so that a
// cancelled or deleted expense can take all of it back, and nothing else.

import { accountType } from '../constants/finAccounts.js';
import { HttpError } from '../utils/httpError.js';
import { TRANSFER_ENTITY } from './finAccount.service.js';
import { recordChange } from './finChange.service.js';
import { randomUUID } from 'node:crypto';

const RECEIVABLE_TYPE = 'AC-09';

/** What the payer owes themselves of an expense: their own share, 0 when they do not take part. */
export function payerShareOf(shares, payerId) {
  return shares.find((share) => share.memberId === payerId)?.share ?? 0;
}

// Both sides of a transfer, written inside the caller's transaction.
async function moveMoney(tx, userId, { fromAccountId, toAccountId, value, currency, occurredAt, note }) {
  const transferId = randomUUID();
  const side = (kind, accountId) => ({ userId, kind, accountId, transferId, value, currency, occurredAt, note: note ?? null, planned: false, source: 'manual', status: 'real' });
  await tx.finTransaction.create({ data: side('transfer_out', fromAccountId) });
  await tx.finTransaction.create({ data: side('transfer_in', toAccountId) });
  await recordChange(tx, { userId, entity: TRANSFER_ENTITY, entityId: transferId, action: 'create', after: { from: fromAccountId, to: toAccountId, value, currency, advance: true } });
  return transferId;
}

async function softDeleteTransfer(tx, userId, transferId, reason) {
  await tx.finTransaction.updateMany({ where: { userId, transferId }, data: { deletedAt: new Date() } });
  await recordChange(tx, { userId, entity: TRANSFER_ENTITY, entityId: transferId, action: 'delete', field: 'deletedAt', after: true, reason });
}

/** The receivable account this person already uses for the advances of this space, if any. */
export async function advanceAccountOf(tx, userId, spaceId) {
  const previous = await tx.finSharedExpense.findFirst({
    where: { spaceId, advanceTransferId: { not: null }, payer: { userId } },
    orderBy: { createdAt: 'desc' },
    select: { advanceTransferId: true },
  });
  if (!previous) return null;
  const side = await tx.finTransaction.findFirst({ where: { userId, transferId: previous.advanceTransferId, kind: 'transfer_in' }, select: { account: { select: { id: true, deletedAt: true, archivedAt: true } } } });
  const account = side?.account;
  return account && !account.deletedAt && !account.archivedAt ? account.id : null;
}

// What is still to recover on a receivable account.
async function receivableBalance(tx, userId, accountId) {
  const groups = await tx.finTransaction.groupBy({
    by: ['kind'],
    where: { userId, accountId, deletedAt: null, planned: false, kind: { in: ['transfer_in', 'transfer_out'] } },
    _sum: { value: true },
  });
  const sum = (kind) => groups.find((group) => group.kind === kind)?._sum.value ?? 0;
  return sum('transfer_in') - sum('transfer_out');
}

async function receivableFor(tx, userId, space, currency, occurredAt) {
  const existing = await advanceAccountOf(tx, userId, space.id);
  if (existing) return existing;
  const type = accountType(RECEIVABLE_TYPE);
  const account = await tx.finAccount.create({
    data: {
      userId,
      label: `Avance — ${space.label}`.slice(0, 80),
      type: RECEIVABLE_TYPE,
      currency,
      openingDate: occurredAt,
      includeInTotal: type.includeInTotal,
      includeInNetWorth: type.includeInNetWorth,
      source: 'manual',
      status: 'declared',
    },
    select: { id: true },
  });
  await recordChange(tx, { userId, entity: 'account', entityId: account.id, action: 'create', after: { type: RECEIVABLE_TYPE, fromSharedSpace: true } });
  return account.id;
}

/** Refuses, before anything is written, an existing transaction that cannot carry the advance. */
export function assertAdvanceable(transaction, { value, payerShare }) {
  const rest = value - payerShare;
  if (rest <= 0) return;
  if (payerShare === 0) throw new HttpError(422, 'You take no part in this expense: nothing of it is yours to link', { reason: 'payerNotParticipant' });
  if (!transaction.accountId) throw new HttpError(422, 'The transaction has no account to take the advance from', { reason: 'noAccount' });
  if (transaction.value !== value) throw new HttpError(422, 'The transaction is not of the amount of the expense', { reason: 'amountDiffers', expected: value });
}

/**
 * The payer's own money, written inside the caller's transaction. Returns what
 * to store on the shared expense.
 *
 * - `link.accountId`: a new personal expense for the payer's share (none when
 *   they take no part) and the rest moved to their receivable account;
 * - `transaction`: an existing personal expense, cut down to the payer's share
 *   when others owe a part of it (its former amount is kept to give it back).
 */
export async function recordPersonalPayment(tx, { userId, space, expense, payerShare, categoryId, accountId = null, transaction = null }) {
  const rest = expense.value - payerShare;
  const base = { personalTransactionId: transaction?.id ?? null, advanceTransferId: null, advanceOriginalValue: null, personalCreated: false };

  if (accountId) {
    base.personalCreated = true;
    if (payerShare > 0) {
      const made = await tx.finTransaction.create({
        data: {
          userId,
          kind: 'expense',
          accountId,
          value: payerShare,
          currency: space.currency,
          occurredAt: expense.occurredAt,
          categoryId,
          note: expense.label,
          shared: true,
          planned: false,
          scope: 'personal',
          consentUses: [],
          source: 'manual',
          status: 'real',
        },
        select: { id: true },
      });
      await recordChange(tx, { userId, entity: 'transaction', entityId: made.id, action: 'create', after: { kind: 'expense', value: payerShare, currency: space.currency, fromSharedExpense: true } });
      base.personalTransactionId = made.id;
    }
    if (rest > 0) {
      const receivable = await receivableFor(tx, userId, space, space.currency, expense.occurredAt);
      base.advanceTransferId = await moveMoney(tx, userId, { fromAccountId: accountId, toAccountId: receivable, value: rest, currency: space.currency, occurredAt: expense.occurredAt, note: expense.label });
    }
    return base;
  }

  if (rest > 0) {
    const receivable = await receivableFor(tx, userId, space, space.currency, expense.occurredAt);
    base.advanceTransferId = await moveMoney(tx, userId, { fromAccountId: transaction.accountId, toAccountId: receivable, value: rest, currency: space.currency, occurredAt: expense.occurredAt, note: expense.label });
    base.advanceOriginalValue = transaction.value;
    await tx.finTransaction.update({ where: { id: transaction.id }, data: { value: payerShare } });
    await recordChange(tx, { userId, entity: 'transaction', entityId: transaction.id, action: 'correct', field: 'value', before: transaction.value, after: payerShare, reason: 'dépense commune : seule ma part pèse sur mon budget' });
  }
  return base;
}

/**
 * Takes back what the payer's own money did for this expense, and only that.
 * A legacy link (made before P9-15, nothing remembered) is left as it is.
 * Refused if the advance has already been reimbursed in part: the receivable
 * would go negative, so the reimbursements are removed first.
 */
export async function revertPersonalPayment(tx, { expense, payerUserId, reason }) {
  const touched = expense.advanceTransferId || expense.advanceOriginalValue !== null || expense.personalCreated;
  if (!touched) return false;

  if (expense.advanceTransferId) {
    const into = await tx.finTransaction.findFirst({ where: { userId: payerUserId, transferId: expense.advanceTransferId, kind: 'transfer_in', deletedAt: null }, select: { accountId: true, value: true } });
    if (into) {
      const balance = await receivableBalance(tx, payerUserId, into.accountId);
      if (balance < into.value) throw new HttpError(409, 'Part of this advance was already reimbursed: remove those settlements first', { reason: 'advanceReimbursed' });
    }
    await softDeleteTransfer(tx, payerUserId, expense.advanceTransferId, reason);
  }
  if (expense.personalCreated && expense.personalTransactionId) {
    await tx.finTransaction.update({ where: { id: expense.personalTransactionId }, data: { deletedAt: new Date() } });
    await recordChange(tx, { userId: payerUserId, entity: 'transaction', entityId: expense.personalTransactionId, action: 'delete', field: 'deletedAt', after: true, reason });
  } else if (expense.advanceOriginalValue !== null && expense.personalTransactionId) {
    await tx.finTransaction.update({ where: { id: expense.personalTransactionId }, data: { value: expense.advanceOriginalValue } });
    await recordChange(tx, { userId: payerUserId, entity: 'transaction', entityId: expense.personalTransactionId, action: 'correct', field: 'value', before: null, after: expense.advanceOriginalValue, reason });
  }
  await tx.finSharedExpense.update({ where: { id: expense.id }, data: { personalTransactionId: null, advanceTransferId: null, advanceOriginalValue: null, personalCreated: false } });
  return true;
}

/**
 * The receiver of a settlement says where the money arrived: the receivable
 * goes down by the same amount, the account goes up, and it is NOT an income.
 * Returns null when there is no advance to bring down (the settlement stays
 * declarative, as it always was). Capped at what is still to recover.
 */
export async function receiveAdvance(tx, { userId, spaceId, accountId, value, currency, settledAt, note }) {
  const receivable = await advanceAccountOf(tx, userId, spaceId);
  if (!receivable) return null;
  const applied = Math.min(value, await receivableBalance(tx, userId, receivable));
  if (applied <= 0) return null;
  const transferId = await moveMoney(tx, userId, { fromAccountId: receivable, toAccountId: accountId, value: applied, currency, occurredAt: settledAt, note });
  return { transferId, applied };
}

/** Takes back the transfer a settlement made, on the account of whoever received it. */
export async function revertReceivedAdvance(tx, { userId, transferId, reason }) {
  if (transferId) await softDeleteTransfer(tx, userId, transferId, reason);
}
