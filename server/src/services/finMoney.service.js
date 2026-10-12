// "Mon argent" (P6-04): recurring resources and dated movements — the writes,
// the history and the duplicate check. The synthesis itself is in
// finSynthesis.service.js, because every figure there must go through the
// versioned engine and that is a different concern from storing a row.
//
// Everything here is scoped to ONE account. `userId` is part of every filter,
// never only of the object's identity: a row that is not yours is "not found".

import { FREQUENCIES } from '../constants/finance.js';
import { DUPLICATE_WINDOW_HOURS, TRANSACTIONS_MAX_PAGE_SIZE, TRANSACTIONS_PAGE_SIZE } from '../constants/finMoney.js';
import { HttpError } from '../utils/httpError.js';
import { recordChange, recordCorrection } from './finChange.service.js';
import { removeStored } from './storage.service.js';

export const INCOME_ENTITY = 'income';
export const TRANSACTION_ENTITY = 'transaction';

const INCOME_SELECT = {
  id: true,
  label: true,
  categoryId: true,
  value: true,
  currency: true,
  frequency: true,
  startDate: true,
  endDate: true,
  scope: true,
  source: true,
  status: true,
  confidence: true,
  consentUses: true,
  version: true,
  archivedAt: true,
};

const TRANSACTION_SELECT = {
  id: true,
  kind: true,
  value: true,
  currency: true,
  occurredAt: true,
  categoryId: true,
  subcategory: true,
  paymentMethod: true,
  note: true,
  shared: true,
  planned: true,
  receipt: { select: { id: true, originalName: true, kind: true } },
  scope: true,
  source: true,
  status: true,
  confidence: true,
  consentUses: true,
  version: true,
  archivedAt: true,
};

// A category the caller may actually point at: one of the client's standard
// rows, or one of their own. Someone else's category is "not found" — pointing
// a transaction at it would otherwise leak that it exists.
async function usableCategory(prisma, userId, categoryId) {
  if (categoryId === null || categoryId === undefined) return null;
  const row = await prisma.finCategory.findFirst({
    where: { id: categoryId, deletedAt: null, OR: [{ userId: null }, { userId }] },
    select: { id: true, archivedAt: true },
  });
  if (!row) throw new HttpError(422, 'Unknown category', { reason: 'unknownCategory' });
  // An archived category is still usable on an EXISTING row (history stays
  // readable), but it is not offered any more, so it cannot be chosen anew.
  if (row.archivedAt) throw new HttpError(422, 'Archived category', { reason: 'archivedCategory' });
  return row.id;
}

// Erases the stored receipts of ONE account, files included.
//
// The ROWS go on their own when the account goes (ON DELETE CASCADE from the
// movement), but a file on disk has no foreign key: it has to be removed
// explicitly, exactly like deleting an article does. Call this BEFORE deleting
// the account — afterwards there is nothing left to find the files by.
//
// This exists so the account-deletion feature has one honest place to call: the
// privacy text promises a complete and immediate deletion (P6-01 point 9), and
// a receipt left on disk would be the most sensitive thing to survive it.
export async function eraseAccountReceipts(prisma, userId) {
  const files = await prisma.media.findMany({
    where: { finTransaction: { userId } },
    select: { id: true, storageKey: true },
  });
  if (files.length === 0) return [];
  await prisma.media.deleteMany({ where: { id: { in: files.map((file) => file.id) } } });
  await removeStored(files.map((file) => file.storageKey));
  return files.map((file) => file.storageKey);
}

// ---- resources -------------------------------------------------------------

export function listIncomes(prisma, userId, { includeArchived = false } = {}) {
  return prisma.finIncome.findMany({
    where: { userId, deletedAt: null, ...(includeArchived ? {} : { archivedAt: null }) },
    select: INCOME_SELECT,
    orderBy: { startDate: 'desc' },
  });
}

export async function createIncome(prisma, userId, body) {
  if (!FREQUENCIES.includes(body.frequency)) throw new HttpError(422, 'Unknown frequency', { reason: 'unknownFrequency' });
  const categoryId = await usableCategory(prisma, userId, body.categoryId ?? null);

  return prisma.$transaction(async (tx) => {
    const row = await tx.finIncome.create({
      data: {
        userId,
        label: body.label,
        categoryId,
        value: body.value,
        currency: body.currency,
        frequency: body.frequency,
        startDate: body.startDate,
        endDate: body.endDate ?? null,
        scope: body.scope ?? 'personal',
        consentUses: body.consentUses ?? [],
        // Typed by a person: entered by hand, and declared rather than proven.
        source: 'manual',
        status: body.status ?? 'declared',
      },
      select: INCOME_SELECT,
    });
    await recordChange(tx, {
      userId,
      entity: INCOME_ENTITY,
      entityId: row.id,
      action: 'create',
      after: { label: row.label, value: row.value, currency: row.currency, frequency: row.frequency },
    });
    return row;
  });
}

async function ownIncome(prisma, userId, id) {
  const row = await prisma.finIncome.findFirst({ where: { id, userId, deletedAt: null }, select: { ...INCOME_SELECT, userId: true } });
  if (!row) throw new HttpError(404, 'Resource not found');
  return row;
}

export async function updateIncome(prisma, userId, id, body) {
  const before = await ownIncome(prisma, userId, id);
  const { reason, ...fields } = body;
  if (fields.frequency !== undefined && !FREQUENCIES.includes(fields.frequency)) {
    throw new HttpError(422, 'Unknown frequency', { reason: 'unknownFrequency' });
  }
  if (fields.categoryId !== undefined) fields.categoryId = await usableCategory(prisma, userId, fields.categoryId);

  return prisma.$transaction(async (tx) => {
    const after = await tx.finIncome.update({ where: { id }, data: { ...fields, version: { increment: 1 } }, select: INCOME_SELECT });
    await recordCorrection(tx, { userId, entity: INCOME_ENTITY, entityId: id, before, after, reason: reason ?? null });
    return after;
  });
}

export async function setIncomeArchived(prisma, userId, id, archived, { reason } = {}) {
  const before = await ownIncome(prisma, userId, id);
  const archivedAt = archived ? new Date() : null;
  return prisma.$transaction(async (tx) => {
    const after = await tx.finIncome.update({ where: { id }, data: { archivedAt }, select: INCOME_SELECT });
    await recordChange(tx, {
      userId,
      entity: INCOME_ENTITY,
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

// Logical deletion, like every financial row (P6-02): a total computed last
// month must keep knowing what it was made of.
export async function deleteIncome(prisma, userId, id, { reason } = {}) {
  await ownIncome(prisma, userId, id);
  await prisma.$transaction(async (tx) => {
    await tx.finIncome.update({ where: { id }, data: { deletedAt: new Date() } });
    await recordChange(tx, { userId, entity: INCOME_ENTITY, entityId: id, action: 'delete', field: 'deletedAt', after: true, reason: reason ?? null });
  });
  return { id };
}

// ---- transactions ----------------------------------------------------------

// A movement dated in the future is only legitimate as a PLANNED EXPENSE
// (client's rule, screen C08). Checked here because "now" is only known here.
function assertDate(kind, occurredAt, planned) {
  if (occurredAt.getTime() <= Date.now()) return;
  if (!planned || kind !== 'expense') {
    throw new HttpError(422, 'A future date is only allowed for a planned expense', { reason: 'futureDate' });
  }
}

// Movements this account already has that look like the one being entered:
// same type, same amount, same currency, same category, within the window.
// SIGNALLED, never refused — two identical coffees in one morning are real.
export async function findDuplicates(prisma, userId, { kind, value, currency, categoryId, occurredAt, exceptId = null }) {
  const window = DUPLICATE_WINDOW_HOURS * 3600 * 1000;
  return prisma.finTransaction.findMany({
    where: {
      userId,
      deletedAt: null,
      kind,
      value,
      currency,
      categoryId: categoryId ?? null,
      occurredAt: { gte: new Date(occurredAt.getTime() - window), lte: new Date(occurredAt.getTime() + window) },
      ...(exceptId ? { id: { not: exceptId } } : {}),
    },
    select: { id: true, occurredAt: true, note: true },
    take: 5,
  });
}

export async function createTransaction(prisma, userId, body) {
  const categoryId = await usableCategory(prisma, userId, body.categoryId ?? null);
  assertDate(body.kind, body.occurredAt, body.planned ?? false);

  const duplicates = await findDuplicates(prisma, userId, {
    kind: body.kind,
    value: body.value,
    currency: body.currency,
    categoryId,
    occurredAt: body.occurredAt,
  });

  const row = await prisma.$transaction(async (tx) => {
    const created = await tx.finTransaction.create({
      data: {
        userId,
        kind: body.kind,
        value: body.value,
        currency: body.currency,
        occurredAt: body.occurredAt,
        categoryId,
        subcategory: body.subcategory ?? null,
        paymentMethod: body.paymentMethod ?? null,
        note: body.note ?? null,
        shared: body.shared ?? false,
        planned: body.planned ?? false,
        scope: body.scope ?? 'personal',
        consentUses: body.consentUses ?? [],
        source: 'manual',
        // A planned expense has not happened: it is declared, not real. The
        // caller may also say the row is fictional (teaching mode, P6-03).
        status: body.status ?? (body.planned ? 'declared' : 'real'),
      },
      select: TRANSACTION_SELECT,
    });
    await recordChange(tx, {
      userId,
      entity: TRANSACTION_ENTITY,
      entityId: created.id,
      action: 'create',
      after: { kind: created.kind, value: created.value, currency: created.currency, occurredAt: created.occurredAt },
    });
    return created;
  });

  // The warning travels WITH the created row: the client asks for a suspected
  // duplicate to be signalled, not for the entry to be blocked.
  return { transaction: row, duplicates };
}

async function ownTransaction(prisma, userId, id) {
  const row = await prisma.finTransaction.findFirst({ where: { id, userId, deletedAt: null }, select: { ...TRANSACTION_SELECT, userId: true } });
  if (!row) throw new HttpError(404, 'Transaction not found');
  return row;
}

export const getTransaction = (prisma, userId, id) => ownTransaction(prisma, userId, id);

export async function updateTransaction(prisma, userId, id, body) {
  const before = await ownTransaction(prisma, userId, id);
  const { reason, ...fields } = body;
  if (fields.categoryId !== undefined) fields.categoryId = await usableCategory(prisma, userId, fields.categoryId);
  assertDate(fields.kind ?? before.kind, fields.occurredAt ?? before.occurredAt, fields.planned ?? before.planned);

  return prisma.$transaction(async (tx) => {
    const after = await tx.finTransaction.update({ where: { id }, data: { ...fields, version: { increment: 1 } }, select: TRANSACTION_SELECT });
    await recordCorrection(tx, { userId, entity: TRANSACTION_ENTITY, entityId: id, before, after, reason: reason ?? null });
    return after;
  });
}

export async function deleteTransaction(prisma, userId, id, { reason } = {}) {
  await ownTransaction(prisma, userId, id);
  await prisma.$transaction(async (tx) => {
    await tx.finTransaction.update({ where: { id }, data: { deletedAt: new Date() } });
    await recordChange(tx, { userId, entity: TRANSACTION_ENTITY, entityId: id, action: 'delete', field: 'deletedAt', after: true, reason: reason ?? null });
  });
  return { id };
}

// ---- history ---------------------------------------------------------------

// Translates the filters of screen C08 into one `where`. Kept apart so the list
// and the export cannot drift into filtering differently — an export that does
// not match what is on screen is worse than no export.
export function historyWhere(userId, query = {}) {
  const where = { userId, deletedAt: null };
  if (query.kind) where.kind = query.kind;
  if (query.status) where.status = query.status;
  if (query.source) where.source = query.source;
  if (query.scope) where.scope = query.scope;
  if (query.shared !== undefined) where.shared = query.shared;
  if (query.planned !== undefined) where.planned = query.planned;
  // "Transactions non catégorisées à part": asked for explicitly, never mixed
  // in silently with a category filter.
  if (query.uncategorised) where.categoryId = null;
  else if (query.categoryId) where.categoryId = query.categoryId;
  if (query.from || query.to) {
    where.occurredAt = {};
    if (query.from) where.occurredAt.gte = query.from;
    if (query.to) where.occurredAt.lte = query.to;
  }
  if (query.minAmount !== undefined || query.maxAmount !== undefined) {
    where.value = {};
    if (query.minAmount !== undefined) where.value.gte = query.minAmount;
    if (query.maxAmount !== undefined) where.value.lte = query.maxAmount;
  }
  // Free-text search over what a person actually typed: the note and the
  // sub-category. Not over the amount — a number is what the min/max filter is
  // for, and matching "100" inside "1100" would be a surprise.
  if (query.text) {
    where.OR = [{ note: { contains: query.text } }, { subcategory: { contains: query.text } }];
  }
  return where;
}

const ORDER = {
  date_desc: [{ occurredAt: 'desc' }, { createdAt: 'desc' }],
  date_asc: [{ occurredAt: 'asc' }, { createdAt: 'asc' }],
  amount_desc: [{ value: 'desc' }, { occurredAt: 'desc' }],
  amount_asc: [{ value: 'asc' }, { occurredAt: 'desc' }],
};

// The history, plus the totals OF THE FILTERED SET (the client asks for
// "totaux filtrés": a total that ignored the filters would describe a list
// nobody is looking at).
//
// Real and fictional are totalled separately and never added (phase rule), and
// a mixed-currency selection answers `null` instead of inventing a rate.
export async function listTransactions(prisma, userId, query = {}) {
  const where = historyWhere(userId, query);
  const size = Math.min(query.pageSize ?? TRANSACTIONS_PAGE_SIZE, TRANSACTIONS_MAX_PAGE_SIZE);
  const page = query.page ?? 1;

  const [rows, total, groups] = await Promise.all([
    prisma.finTransaction.findMany({
      where,
      select: TRANSACTION_SELECT,
      orderBy: ORDER[query.sort ?? 'date_desc'],
      skip: (page - 1) * size,
      take: size,
    }),
    prisma.finTransaction.count({ where }),
    // Grouped in SQL: the totals describe the whole filtered set, not just the
    // page on screen.
    prisma.finTransaction.groupBy({
      by: ['kind', 'currency', 'status', 'planned'],
      where,
      _sum: { value: true },
      _count: { _all: true },
    }),
  ]);

  return { transactions: rows, page, pageSize: size, total, pages: Math.max(1, Math.ceil(total / size)), totals: foldTotals(groups) };
}

// Folds the SQL groups into the totals a screen may show. THREE buckets, never
// one: what actually happened, what is only planned, and what is fictional. The
// client's own screens distinguish « prévu / réel », and the phase rule forbids
// adding real and fictional — so a single total would be wrong twice over.
//
// A set holding more than one currency totals `null`: the engine never converts
// without a dated rate, and neither does a total.
export function foldTotals(groups) {
  const currencies = [...new Set(groups.map((g) => g.currency))];
  const mixed = currencies.length > 1;
  const bucketOf = (g) => (g.status === 'fictional' ? 'fictional' : g.planned ? 'planned' : 'real');
  const sum = (bucket, kind) =>
    groups.filter((g) => bucketOf(g) === bucket && g.kind === kind).reduce((acc, g) => acc + (g._sum.value ?? 0), 0);
  const count = (bucket) => groups.filter((g) => bucketOf(g) === bucket).reduce((acc, g) => acc + g._count._all, 0);
  // Mixed currencies: the bucket still exists (so a screen knows there is
  // something there), its totals are simply not computable.
  const pair = (bucket) => (mixed ? { income: null, expense: null } : { income: sum(bucket, 'income'), expense: sum(bucket, 'expense') });

  return {
    currency: mixed ? null : (currencies[0] ?? null),
    mixedCurrencies: mixed,
    real: pair('real'),
    // null rather than a block of zeros: nothing planned is not "zero planned".
    planned: count('planned') === 0 ? null : pair('planned'),
    fictional: count('fictional') === 0 ? null : pair('fictional'),
    counts: { real: count('real'), planned: count('planned'), fictional: count('fictional') },
  };
}

// Every matching row, for the export. No page: an export that stops at 50 lines
// is a trap. Bounded by the filters the caller chose, and by one account.
export function allTransactionsFor(prisma, userId, query = {}) {
  return prisma.finTransaction.findMany({
    where: historyWhere(userId, query),
    select: { ...TRANSACTION_SELECT, category: { select: { label: true } } },
    orderBy: ORDER[query.sort ?? 'date_desc'],
  });
}
