// Shared expenses and settlements (P6-14): the writes and the reads. The split,
// the balances and the settlement plan are in finSharedView.service.js.
//
// Everything is scoped to ONE space, and membership of that space is checked by
// P6-13's own helpers — a space the caller is not in answers 404, never 403, so
// "not yours" and "does not exist" stay indistinguishable.
//
// One coupling to P6-13 deserves naming: the income-proportional split needs
// the participants' incomes, and the client's condition on F042 is « avec
// consentement ». That consent already exists and has a name — the `incomes`
// level of the space's permission matrix — so this file asks the matrix rather
// than inventing a second notion of consent.

import { COLLECTIVE_CATEGORY_KEYS } from '../constants/finCollectiveCategories.js';
import { EXPENSE_MIN_ROLE, INCOME_SPLIT_REQUIRES_SHARING, SETTLEMENTS_PAGE_SIZE, SHARED_EXPENSES_PAGE_SIZE } from '../constants/finShared.js';
import { roleAtLeast, sharesAtLeast } from '../constants/finSpace.js';
import { HttpError } from '../utils/httpError.js';
import { usableAccount } from './finAccount.service.js';
import { removeStored } from './storage.service.js';
import { alertBudgetLevel, notifySpace } from './finSpaceAlerts.service.js';
import { spaceBudgetsView } from './finSpaceBudget.service.js';
import { recordChange } from './finChange.service.js';
import { assertOpen, normaliseSharing, ownMembership, requireRole } from './finSpace.service.js';
import { monthlyAmount } from './finance/formulas.js';
import { detectRecurrences } from './finance/algorithms.js';
import { computeShares } from './finSharedView.service.js';

export const SHARED_EXPENSE_ENTITY = 'sharedExpense';
export const SETTLEMENT_ENTITY = 'settlement';

const EXPENSE_SELECT = {
  id: true,
  spaceId: true,
  payerId: true,
  label: true,
  value: true,
  currency: true,
  occurredAt: true,
  splitMode: true,
  categoryId: true,
  note: true,
  recordedById: true,
  status: true,
  lifecycle: true,
  cancelledAt: true,
  usageUnit: true,
  collectiveCategory: true,
  subCategory: true,
  receipt: { select: { id: true, originalName: true, kind: true } },
  personalTransactionId: true,
  version: true,
  shares: { select: { id: true, memberId: true, share: true, weight: true } },
};

const SETTLEMENT_SELECT = {
  id: true,
  spaceId: true,
  fromId: true,
  toId: true,
  value: true,
  currency: true,
  settledAt: true,
  note: true,
  recordedById: true,
  status: true,
};

// The live members of a space, with what each one shares — the shape both the
// split and the balances need.
export function liveMembers(prisma, spaceId, { includeLeft = false } = {}) {
  return prisma.finSpaceMember.findMany({
    where: { spaceId, ...(includeLeft ? {} : { leftAt: null }) },
    select: { id: true, userId: true, role: true, sharing: true, displayName: true, leftAt: true, user: { select: { name: true } } },
    orderBy: { joinedAt: 'asc' },
  });
}

/**
 * The incomes of the participants, IF they have consented to share them here.
 *
 * A participant who keeps their income private is reported BY NAME — so the
 * person can go and ask them — rather than silently dropped or replaced by an
 * equal share. A split that is not the one asked for is a wrong figure
 * presented as the right one.
 */
export async function incomesForSplit(prisma, members, currency) {
  const withheld = [];
  const incomes = new Map();

  for (const member of members) {
    const level = normaliseSharing(member.sharing).incomes;
    if (!sharesAtLeast(level, INCOME_SPLIT_REQUIRES_SHARING)) {
      withheld.push({ memberId: member.id, name: member.displayName ?? member.user?.name ?? null });
      continue;
    }
    // eslint-disable-next-line no-await-in-loop -- one small query per participant
    const rows = await prisma.finIncome.findMany({
      where: { userId: member.userId, deletedAt: null, archivedAt: null, currency },
      select: { value: true, frequency: true },
    });
    // Normalised to the month (F001): a yearly grant counted whole would weigh
    // twelve times too much in a proportional split.
    let total = 0;
    for (const row of rows) {
      const monthly = monthlyAmount(row.value, row.frequency);
      if (monthly !== null) total += monthly;
    }
    incomes.set(member.id, total);
  }

  if (withheld.length > 0) {
    throw new HttpError(422, 'Some participants have not shared their income in this space', { reason: 'incomeConsentMissing', members: withheld });
  }
  return incomes;
}

// ---- shared expenses -------------------------------------------------------

export async function listSharedExpenses(prisma, userId, spaceId, { page = 1, pageSize = SHARED_EXPENSES_PAGE_SIZE } = {}) {
  // Membership first: an expense of a space the caller is not in must not even
  // be countable.
  await ownMembership(prisma, userId, spaceId);
  const size = Math.min(pageSize, SHARED_EXPENSES_PAGE_SIZE);
  const [rows, total] = await Promise.all([
    prisma.finSharedExpense.findMany({
      where: { spaceId, deletedAt: null },
      select: EXPENSE_SELECT,
      orderBy: [{ occurredAt: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * size,
      take: size,
    }),
    prisma.finSharedExpense.count({ where: { spaceId, deletedAt: null } }),
  ]);
  return { expenses: rows, page, pageSize: size, total, pages: Math.max(1, Math.ceil(total / size)) };
}

/**
 * Records a shared expense and its shares, in one transaction.
 *
 * The payer may be somebody other than the caller — a flatmate may enter the
 * rent somebody else paid — and the payer may be absent from the participants
 * entirely (« payeur pouvant ne pas participer »).
 */
export async function createSharedExpense(prisma, userId, spaceId, body) {
  // A viewer reads the space and records nothing.
  const me = await requireRole(prisma, userId, spaceId, EXPENSE_MIN_ROLE);
  const space = me.space;
  if (body.currency && body.currency !== space.currency) {
    throw new HttpError(422, 'A shared expense is in the currency of its space', { reason: 'currencyMismatch', expected: space.currency });
  }
  // A planned expense is the one that may be dated ahead (P9-04).
  if (!body.planned && body.occurredAt.getTime() > Date.now()) {
    throw new HttpError(422, 'A shared expense cannot be dated in the future', { reason: 'futureDate' });
  }

  const members = await liveMembers(prisma, spaceId);
  const byId = new Map(members.map((member) => [member.id, member]));
  if (!byId.has(body.payerId)) throw new HttpError(422, 'The payer is not a member of this space', { reason: 'unknownPayer' });

  const participants = body.participants.map((participant) => ({ ...participant }));
  for (const participant of participants) {
    if (!byId.has(participant.memberId)) {
      throw new HttpError(422, 'A participant is not a member of this space', { reason: 'unknownParticipant', memberId: participant.memberId });
    }
  }
  if (new Set(participants.map((participant) => participant.memberId)).size !== participants.length) {
    throw new HttpError(422, 'A participant is listed twice', { reason: 'duplicateParticipant' });
  }

  // The income split asks P6-13's matrix for consent, and only for the
  // participants — not for the whole space.
  let incomes = null;
  if (body.splitMode === 'income_proportional') {
    incomes = await incomesForSplit(
      prisma,
      participants.map((participant) => byId.get(participant.memberId)),
      space.currency,
    );
  }

  const shares = computeShares({ mode: body.splitMode, amount: body.value, participants, incomes });
  // The client's first rule, asserted after the fact as well as inside each
  // mode: whatever path got us here, the shares add up to the amount.
  const sum = shares.reduce((total, share) => total + share.share, 0);
  if (sum !== body.value) {
    throw new HttpError(422, 'The shares do not add up to the amount', { reason: 'sharesMismatch', total: sum, amount: body.value });
  }

  if (body.collectiveCategory && !COLLECTIVE_CATEGORY_KEYS.includes(body.collectiveCategory)) {
    throw new HttpError(422, 'Unknown collective category', { reason: 'unknownCategory' });
  }
  const categoryId = await usableCategory(prisma, userId, body.categoryId ?? null);

  // P9-08: money from the payer's own pocket. Checked before anything is written.
  const link = body.personalLink ?? null;
  if (link) {
    if (body.payerId !== me.id) throw new HttpError(422, 'Only the payer can link their own personal money', { reason: 'notYourPayment' });
    if (body.planned) throw new HttpError(422, 'A planned expense has not been paid yet', { reason: 'plannedNotLinkable' });
    if (link.accountId) await usableAccount(prisma, userId, link.accountId, space.currency);
    else await linkableTransaction(prisma, userId, link.transactionId, space.currency);
  }

  const recorded = await prisma.$transaction(async (tx) => {
    let personalTransactionId = link?.transactionId ?? null;
    if (link?.accountId) {
      // A new personal expense, on the chosen account: what left the payer's money.
      const made = await tx.finTransaction.create({
        data: {
          userId,
          kind: 'expense',
          accountId: link.accountId,
          value: body.value,
          currency: space.currency,
          occurredAt: body.occurredAt,
          categoryId,
          note: body.label,
          shared: true,
          planned: false,
          scope: 'personal',
          consentUses: [],
          source: 'manual',
          status: 'real',
        },
        select: { id: true },
      });
      await recordChange(tx, { userId, entity: 'transaction', entityId: made.id, action: 'create', after: { kind: 'expense', value: body.value, currency: space.currency, fromSharedExpense: true } });
      personalTransactionId = made.id;
    }
    const expense = await tx.finSharedExpense.create({
      data: {
        spaceId,
        payerId: body.payerId,
        label: body.label,
        value: body.value,
        currency: space.currency,
        occurredAt: body.occurredAt,
        splitMode: body.splitMode,
        lifecycle: body.planned ? 'planned' : 'done',
        usageUnit: body.splitMode === 'usage' ? body.usageUnit : null,
        collectiveCategory: body.collectiveCategory ?? null,
        subCategory: body.subCategory ?? null,
        personalTransactionId,
        categoryId,
        note: body.note ?? null,
        recordedById: me.id,
        source: 'manual',
        // A shared expense somebody records is a fact they are stating: real,
        // not a plan. The fictional mode has no place in a space.
        status: 'real',
        shares: { create: shares.map((share) => ({ memberId: share.memberId, share: share.share, weight: share.weight })) },
      },
      select: EXPENSE_SELECT,
    });
    await recordChange(tx, {
      userId,
      entity: SHARED_EXPENSE_ENTITY,
      entityId: expense.id,
      action: 'create',
      after: { spaceId, label: expense.label, value: expense.value, currency: expense.currency, splitMode: expense.splitMode },
    });
    return expense;
  });

  // P9-09: the others are told, and an envelope that has just crossed 80 % or
  // 100 % is said to everybody. A planned expense is not news yet.
  if (!body.planned) {
    await notifySpace(prisma, spaceId, userId, { type: 'space_expense', params: { label: recorded.label }, link: `/partage/${spaceId}/depenses`, referenceId: recorded.id });
    await alertBudgetLevel(prisma, spaceId, { collectiveCategory: recorded.collectiveCategory, occurredAt: recorded.occurredAt }, spaceBudgetsView, userId);
  }
  return recorded;
}

// A category this account may point at: the client's reference or its own.
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

/**
 * Deletes a shared expense, logically.
 *
 * Who may: the person who recorded it, the payer, or an admin of the space. Not
 * any member — an expense somebody else entered is a statement about THEIR
 * money too, and removing it silently changes what everybody owes.
 */
export async function deleteSharedExpense(prisma, userId, spaceId, id, { reason } = {}) {
  const me = assertOpen(await ownMembership(prisma, userId, spaceId));
  const expense = await prisma.finSharedExpense.findFirst({ where: { id, spaceId, deletedAt: null }, select: EXPENSE_SELECT });
  if (!expense) throw new HttpError(404, 'Shared expense not found');

  const mine = expense.recordedById === me.id || expense.payerId === me.id;
  if (!mine && !roleAtLeast(me.role, 'admin')) {
    throw new HttpError(403, 'Only the payer, whoever recorded it, or an admin may remove this expense', { reason: 'notYours' });
  }

  // The receipt goes with the expense it documents (row and file).
  const receipt = await prisma.media.findUnique({ where: { sharedExpenseId: id }, select: { id: true, storageKey: true } });
  await prisma.$transaction(async (tx) => {
    if (receipt) await tx.media.delete({ where: { id: receipt.id } });
    await tx.finSharedExpense.update({ where: { id }, data: { deletedAt: new Date() } });
    await recordChange(tx, {
      userId,
      entity: SHARED_EXPENSE_ENTITY,
      entityId: id,
      action: 'delete',
      field: 'deletedAt',
      after: true,
      reason: reason ?? null,
    });
  });
  if (receipt) await removeStored([receipt.storageKey]);
  return { id };
}

// A personal expense that can be designated as the source of a collective one:
// the caller's own, an expense, in the space's currency, not already the source
// of another (COL-F13: the uniqueness is also enforced by the database).
async function linkableTransaction(prisma, userId, transactionId, currency) {
  const row = await prisma.finTransaction.findFirst({
    where: { id: transactionId, userId, deletedAt: null },
    select: { id: true, kind: true, currency: true, planned: true, sharedExpense: { select: { id: true } } },
  });
  if (!row) throw new HttpError(404, 'Transaction not found');
  if (row.kind !== 'expense' || row.planned) throw new HttpError(422, 'Only a realised personal expense can be linked', { reason: 'notAnExpense' });
  if (row.currency !== currency) throw new HttpError(422, 'The transaction is not in the currency of the space', { reason: 'currencyMismatch', expected: currency });
  if (row.sharedExpense) throw new HttpError(409, 'This personal expense is already linked to a collective one', { reason: 'alreadyLinked' });
}

/**
 * Designates an already-entered personal expense as the source of a collective
 * one (P9-08). Only the payer, only if nothing is linked yet: the amount is
 * never counted twice.
 */
export async function linkPersonalTransaction(prisma, userId, spaceId, id, { transactionId }) {
  const me = assertOpen(await ownMembership(prisma, userId, spaceId));
  const expense = await prisma.finSharedExpense.findFirst({ where: { id, spaceId, deletedAt: null }, select: EXPENSE_SELECT });
  if (!expense) throw new HttpError(404, 'Shared expense not found');
  if (expense.payerId !== me.id) throw new HttpError(403, 'Only the payer can link their personal money', { reason: 'notYourPayment' });
  if (expense.personalTransactionId) throw new HttpError(409, 'This expense is already linked to a personal transaction', { reason: 'alreadyLinked' });
  await linkableTransaction(prisma, userId, transactionId, expense.currency);
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finSharedExpense.update({ where: { id }, data: { personalTransactionId: transactionId, version: { increment: 1 } }, select: EXPENSE_SELECT });
    await recordChange(tx, { userId, entity: SHARED_EXPENSE_ENTITY, entityId: id, action: 'correct', field: 'personalTransactionId', before: null, after: transactionId });
    return updated;
  });
}

/** Cuts the link; both rows stay, each on its own side. */
export async function unlinkPersonalTransaction(prisma, userId, spaceId, id) {
  const me = assertOpen(await ownMembership(prisma, userId, spaceId));
  const expense = await prisma.finSharedExpense.findFirst({ where: { id, spaceId, deletedAt: null }, select: EXPENSE_SELECT });
  if (!expense) throw new HttpError(404, 'Shared expense not found');
  if (expense.payerId !== me.id) throw new HttpError(403, 'Only the payer can change this link', { reason: 'notYourPayment' });
  if (!expense.personalTransactionId) throw new HttpError(409, 'This expense is not linked', { reason: 'notLinked' });
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finSharedExpense.update({ where: { id }, data: { personalTransactionId: null, version: { increment: 1 } }, select: EXPENSE_SELECT });
    await recordChange(tx, { userId, entity: SHARED_EXPENSE_ENTITY, entityId: id, action: 'correct', field: 'personalTransactionId', before: expense.personalTransactionId, after: null });
    return updated;
  });
}

// ---- the receipt of a shared expense (P9-14) ------------------------------
//
// Private storage, like every file here: readable by the members of THIS space
// only, never by a URL, and gone with the expense. Whoever may delete an expense
// (its payer, whoever recorded it, an admin) may attach or remove its receipt.

async function expenseForReceipt(prisma, userId, spaceId, id, { write }) {
  const me = write ? assertOpen(await ownMembership(prisma, userId, spaceId)) : await ownMembership(prisma, userId, spaceId);
  const expense = await prisma.finSharedExpense.findFirst({ where: { id, spaceId, deletedAt: null }, select: { id: true, payerId: true, recordedById: true } });
  if (!expense) throw new HttpError(404, 'Shared expense not found');
  if (write && !(expense.recordedById === me.id || expense.payerId === me.id) && !roleAtLeast(me.role, 'admin')) {
    throw new HttpError(403, 'Only the payer, whoever recorded it, or an admin may change the receipt', { reason: 'notYours' });
  }
  return expense;
}

export async function attachSharedReceipt(prisma, userId, spaceId, id, stored) {
  const expense = await expenseForReceipt(prisma, userId, spaceId, id, { write: true });
  // The replaced receipt's row goes first (the key is unique), its file after.
  const previous = await prisma.media.findUnique({ where: { sharedExpenseId: expense.id }, select: { id: true, storageKey: true } });
  const media = await prisma.$transaction(async (tx) => {
    if (previous) await tx.media.delete({ where: { id: previous.id } });
    const created = await tx.media.create({ data: { ...stored, uploadedById: userId, sharedExpenseId: expense.id } });
    await recordChange(tx, { userId, entity: SHARED_EXPENSE_ENTITY, entityId: expense.id, action: 'correct', field: 'receipt', before: previous ? 'present' : null, after: 'present' });
    return created;
  });
  if (previous) await removeStored([previous.storageKey]);
  return { id: media.id, originalName: media.originalName, kind: media.kind, sizeBytes: media.sizeBytes };
}

export async function sharedReceiptFile(prisma, userId, spaceId, id) {
  const expense = await expenseForReceipt(prisma, userId, spaceId, id, { write: false });
  const media = await prisma.media.findUnique({ where: { sharedExpenseId: expense.id }, select: { storageKey: true, mimeType: true, originalName: true, kind: true } });
  if (!media) throw new HttpError(404, 'No receipt');
  return media;
}

export async function removeSharedReceipt(prisma, userId, spaceId, id) {
  const expense = await expenseForReceipt(prisma, userId, spaceId, id, { write: true });
  const media = await prisma.media.findUnique({ where: { sharedExpenseId: expense.id }, select: { id: true, storageKey: true } });
  if (!media) throw new HttpError(404, 'No receipt');
  await prisma.$transaction(async (tx) => {
    await tx.media.delete({ where: { id: media.id } });
    await recordChange(tx, { userId, entity: SHARED_EXPENSE_ENTITY, entityId: expense.id, action: 'correct', field: 'receipt', before: 'present', after: null });
  });
  await removeStored([media.storageKey]);
  return { id };
}

/** The sub-categories this space already used, to suggest rather than to impose. */
export async function sharedSubCategories(prisma, userId, spaceId) {
  await ownMembership(prisma, userId, spaceId);
  const rows = await prisma.finSharedExpense.findMany({ where: { spaceId, deletedAt: null, subCategory: { not: null } }, distinct: ['subCategory'], select: { subCategory: true }, orderBy: { subCategory: 'asc' }, take: 100 });
  return rows.map((row) => row.subCategory);
}

/**
 * Cancels a shared expense (QC-08): it stops counting, the balances are
 * recomputed from what is left, and the row stays with its trace.
 *
 * Same people as deleting: whoever recorded it, its payer, or an admin. A
 * cancelled expense cannot be cancelled again, and it cannot come back — a
 * mistaken cancellation is fixed by recording the expense anew.
 */
export async function cancelSharedExpense(prisma, userId, spaceId, id, { reason } = {}) {
  const me = assertOpen(await ownMembership(prisma, userId, spaceId));
  const expense = await prisma.finSharedExpense.findFirst({ where: { id, spaceId, deletedAt: null }, select: EXPENSE_SELECT });
  if (!expense) throw new HttpError(404, 'Shared expense not found');
  if (expense.lifecycle === 'cancelled') throw new HttpError(409, 'This expense is already cancelled', { reason: 'alreadyCancelled' });
  if (!(expense.recordedById === me.id || expense.payerId === me.id) && !roleAtLeast(me.role, 'admin')) {
    throw new HttpError(403, 'Only the payer, whoever recorded it, or an admin may cancel this expense', { reason: 'notYours' });
  }
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finSharedExpense.update({
      where: { id },
      data: { lifecycle: 'cancelled', cancelledAt: new Date(), version: { increment: 1 } },
      select: EXPENSE_SELECT,
    });
    await recordChange(tx, {
      userId,
      entity: SHARED_EXPENSE_ENTITY,
      entityId: id,
      action: 'correct',
      field: 'lifecycle',
      before: expense.lifecycle,
      after: 'cancelled',
      reason: reason ?? null,
    });
    return updated;
  });
}

/** A planned expense that has happened: it starts counting in the balances. */
export async function confirmPlannedExpense(prisma, userId, spaceId, id) {
  const me = await requireRole(prisma, userId, spaceId, EXPENSE_MIN_ROLE);
  const expense = await prisma.finSharedExpense.findFirst({ where: { id, spaceId, deletedAt: null }, select: EXPENSE_SELECT });
  if (!expense) throw new HttpError(404, 'Shared expense not found');
  if (expense.lifecycle !== 'planned') throw new HttpError(409, 'Only a planned expense can be confirmed', { reason: 'notPlanned' });
  if (expense.occurredAt.getTime() > Date.now()) throw new HttpError(422, 'A planned expense is confirmed once its date has come', { reason: 'notYet' });
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finSharedExpense.update({ where: { id }, data: { lifecycle: 'done', version: { increment: 1 } }, select: EXPENSE_SELECT });
    await recordChange(tx, { userId, entity: SHARED_EXPENSE_ENTITY, entityId: id, action: 'correct', field: 'lifecycle', before: 'planned', after: 'done', reason: null });
    return updated;
  });
}

// ---- settlements -----------------------------------------------------------

export async function listSettlements(prisma, userId, spaceId, { page = 1, pageSize = SETTLEMENTS_PAGE_SIZE } = {}) {
  await ownMembership(prisma, userId, spaceId);
  const size = Math.min(pageSize, SETTLEMENTS_PAGE_SIZE);
  const [rows, total] = await Promise.all([
    prisma.finSettlement.findMany({
      where: { spaceId, deletedAt: null },
      select: SETTLEMENT_SELECT,
      orderBy: [{ settledAt: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * size,
      take: size,
    }),
    prisma.finSettlement.count({ where: { spaceId, deletedAt: null } }),
  ]);
  return { settlements: rows, page, pageSize: size, total, pages: Math.max(1, Math.ceil(total / size)) };
}

/**
 * Records a settlement one member declares having made to another.
 *
 * DECLARATIVE: nothing in FINCLUDIA moves money. Either side may record it —
 * the one who paid or the one who was paid — and the row says who did, because
 * a settlement nobody can attribute is a settlement nobody can dispute.
 */
export async function createSettlement(prisma, userId, spaceId, body) {
  const me = await requireRole(prisma, userId, spaceId, EXPENSE_MIN_ROLE);
  const space = me.space;
  if (body.currency && body.currency !== space.currency) {
    throw new HttpError(422, 'A settlement is in the currency of its space', { reason: 'currencyMismatch', expected: space.currency });
  }
  if (body.settledAt.getTime() > Date.now()) {
    throw new HttpError(422, 'A settlement cannot be dated in the future', { reason: 'futureDate' });
  }
  // Not a CHECK: both columns are foreign keys, and MariaDB refuses those in a
  // CHECK (error 1901). So the rule lives here, and in the consistency control.
  if (body.fromId === body.toId) {
    throw new HttpError(422, 'A settlement needs two different members', { reason: 'sameMember' });
  }

  const members = await liveMembers(prisma, spaceId, { includeLeft: true });
  const byId = new Map(members.map((member) => [member.id, member]));
  for (const side of [body.fromId, body.toId]) {
    if (!byId.has(side)) throw new HttpError(422, 'A party is not a member of this space', { reason: 'unknownMember', memberId: side });
  }
  // Either side may record it, and an admin may record one between two others
  // (somebody has to be able to fix a forgotten entry).
  const involved = body.fromId === me.id || body.toId === me.id;
  if (!involved && !roleAtLeast(me.role, 'admin')) {
    throw new HttpError(403, 'Only a party to the settlement, or an admin, may record it', { reason: 'notYours' });
  }

  const recorded = await prisma.$transaction(async (tx) => {
    const settlement = await tx.finSettlement.create({
      data: {
        spaceId,
        fromId: body.fromId,
        toId: body.toId,
        value: body.value,
        currency: space.currency,
        settledAt: body.settledAt,
        note: body.note ?? null,
        recordedById: me.id,
        source: 'manual',
        // What somebody says they paid: declared, never "real" in the sense of
        // a movement FINCLUDIA witnessed, because it witnessed nothing.
        status: 'declared',
      },
      select: SETTLEMENT_SELECT,
    });
    await recordChange(tx, {
      userId,
      entity: SETTLEMENT_ENTITY,
      entityId: settlement.id,
      action: 'create',
      after: { spaceId, from: settlement.fromId, to: settlement.toId, value: settlement.value, currency: settlement.currency },
    });
    return settlement;
  });

  // P9-09: the other side of the settlement is told, nobody else.
  const parties = await prisma.finSpaceMember.findMany({ where: { id: { in: [body.fromId, body.toId] } }, select: { userId: true } });
  await notifySpace(prisma, spaceId, userId, {
    type: 'space_settlement',
    params: { label: null },
    link: `/partage/${spaceId}/depenses`,
    referenceId: recorded.id,
    onlyUserIds: parties.map((party) => party.userId).filter((id) => id !== userId),
  });
  return recorded;
}

export async function deleteSettlement(prisma, userId, spaceId, id, { reason } = {}) {
  const me = assertOpen(await ownMembership(prisma, userId, spaceId));
  const settlement = await prisma.finSettlement.findFirst({ where: { id, spaceId, deletedAt: null }, select: SETTLEMENT_SELECT });
  if (!settlement) throw new HttpError(404, 'Settlement not found');

  const involved = settlement.fromId === me.id || settlement.toId === me.id;
  if (!involved && !roleAtLeast(me.role, 'admin')) {
    throw new HttpError(403, 'Only a party to the settlement, or an admin, may remove it', { reason: 'notYours' });
  }

  await prisma.$transaction(async (tx) => {
    await tx.finSettlement.update({ where: { id }, data: { deletedAt: new Date() } });
    await recordChange(tx, { userId, entity: SETTLEMENT_ENTITY, entityId: id, action: 'delete', field: 'deletedAt', after: true, reason: reason ?? null });
  });
  return { id };
}

// ---- reads for the screen --------------------------------------------------

// Everything the balances of a space need, in one place so the balance screen
// and the settlement plan cannot read it two different ways.
export async function loadSharedData(prisma, spaceId) {
  const [members, expenses, settlements] = await Promise.all([
    // Members who have LEFT are included: the space's figures were computed
    // with them in it, and dropping them would make the balances stop adding
    // up to zero.
    liveMembers(prisma, spaceId, { includeLeft: true }),
    prisma.finSharedExpense.findMany({
      // Only a realised expense counts: a planned one has not happened, a
      // cancelled one is kept for its trace and counts for nothing (QC-08).
      where: { spaceId, deletedAt: null, lifecycle: 'done' },
      select: { id: true, payerId: true, value: true, currency: true, shares: { select: { memberId: true, share: true } } },
    }),
    prisma.finSettlement.findMany({
      where: { spaceId, deletedAt: null },
      select: { id: true, fromId: true, toId: true, value: true, currency: true },
    }),
  ]);
  return { members, expenses, settlements };
}

// ---- recurring common bills (P6-15) ----------------------------------------
//
// « Factures et abonnements communs » (colocation): the client's own rule is
// « un paiement confirmé crée la dépense partagée sans doublon ». ALG-04
// (P6-07) only ever proposes a candidate; nothing here creates anything on
// its own, and confirming the SAME period twice is refused rather than
// silently creating a second rent for the same month.

const monthKey = (date) => `${date.getUTCFullYear()}-${date.getUTCMonth()}`;

export async function detectSharedRecurrences(prisma, userId, spaceId) {
  await ownMembership(prisma, userId, spaceId);
  const rows = await prisma.finSharedExpense.findMany({
    where: { spaceId, deletedAt: null },
    select: { label: true, value: true, occurredAt: true },
    orderBy: { occurredAt: 'asc' },
  });
  const candidates = detectRecurrences(rows.map((row) => ({ label: row.label, amount: row.value, date: row.occurredAt })));
  return candidates ?? [];
}

/**
 * Confirms one period of a detected recurring bill as a real shared expense.
 *
 * Deduplication is by (space, normalised label, calendar month): the client's
 * own case is a rent or a subscription confirmed once per period, never
 * twice for the same month, whichever member happens to confirm it.
 */
export async function confirmSharedRecurrence(prisma, userId, spaceId, body) {
  const existing = await prisma.finSharedExpense.findMany({
    where: { spaceId, deletedAt: null, lifecycle: { not: 'cancelled' }, label: body.label },
    select: { occurredAt: true },
  });
  if (existing.some((row) => monthKey(row.occurredAt) === monthKey(body.occurredAt))) {
    throw new HttpError(422, 'This period already has a shared expense for this bill', { reason: 'duplicateRecurrence' });
  }
  return createSharedExpense(prisma, userId, spaceId, body);
}
