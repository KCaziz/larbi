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

import { EXPENSE_MIN_ROLE, INCOME_SPLIT_REQUIRES_SHARING, SETTLEMENTS_PAGE_SIZE, SHARED_EXPENSES_PAGE_SIZE } from '../constants/finShared.js';
import { roleAtLeast, sharesAtLeast } from '../constants/finSpace.js';
import { HttpError } from '../utils/httpError.js';
import { recordChange } from './finChange.service.js';
import { normaliseSharing, ownMembership, requireRole } from './finSpace.service.js';
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
  if (body.occurredAt.getTime() > Date.now()) {
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

  const categoryId = await usableCategory(prisma, userId, body.categoryId ?? null);

  return prisma.$transaction(async (tx) => {
    const expense = await tx.finSharedExpense.create({
      data: {
        spaceId,
        payerId: body.payerId,
        label: body.label,
        value: body.value,
        currency: space.currency,
        occurredAt: body.occurredAt,
        splitMode: body.splitMode,
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
  const me = await ownMembership(prisma, userId, spaceId);
  const expense = await prisma.finSharedExpense.findFirst({ where: { id, spaceId, deletedAt: null }, select: EXPENSE_SELECT });
  if (!expense) throw new HttpError(404, 'Shared expense not found');

  const mine = expense.recordedById === me.id || expense.payerId === me.id;
  if (!mine && !roleAtLeast(me.role, 'admin')) {
    throw new HttpError(403, 'Only the payer, whoever recorded it, or an admin may remove this expense', { reason: 'notYours' });
  }

  await prisma.$transaction(async (tx) => {
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
  return { id };
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

  return prisma.$transaction(async (tx) => {
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
}

export async function deleteSettlement(prisma, userId, spaceId, id, { reason } = {}) {
  const me = await ownMembership(prisma, userId, spaceId);
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
      where: { spaceId, deletedAt: null },
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
    where: { spaceId, deletedAt: null, label: body.label },
    select: { occurredAt: true },
  });
  if (existing.some((row) => monthKey(row.occurredAt) === monthKey(body.occurredAt))) {
    throw new HttpError(422, 'This period already has a shared expense for this bill', { reason: 'duplicateRecurrence' });
  }
  return createSharedExpense(prisma, userId, spaceId, body);
}
