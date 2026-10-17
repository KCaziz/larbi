import { prisma } from '../config/prisma.js';
import { EXPORT_COLUMNS, PAYMENT_METHODS, TRANSACTION_KINDS, TRANSACTION_SORTS } from '../constants/finMoney.js';
import { FREQUENCIES } from '../constants/finance.js';
import { listChanges } from '../services/finChange.service.js';
import {
  INCOME_ENTITY,
  TRANSACTION_ENTITY,
  allTransactionsFor,
  createIncome,
  createTransaction,
  deleteIncome,
  deleteTransaction,
  getTransaction,
  listIncomes,
  listTransactions,
  setIncomeArchived,
  updateIncome,
  updateTransaction,
} from '../services/finMoney.service.js';
import { describeFormula } from '../services/finance/describe.js';
import { buildSynthesis, currentMonth, loadSynthesisData } from '../services/finSynthesis.service.js';
import { sendStoredMedia } from '../services/mediaResponse.js';
import { discardTemp, ingestUpload, removeStored } from '../services/storage.service.js';
import { HttpError } from '../utils/httpError.js';

// "Mon argent" (P6-04). Session required everywhere, and every read and write
// is scoped to the caller's own rows: there is no administration side to
// somebody's money.

export function getMoneyReferences(req, res) {
  res.json({
    kinds: TRANSACTION_KINDS,
    paymentMethods: PAYMENT_METHODS,
    frequencies: FREQUENCIES,
    sorts: TRANSACTION_SORTS,
    exportColumns: EXPORT_COLUMNS,
    // The formulas the synthesis answers with, in the client's own wording, so
    // the "Pourquoi ?" panel explains them without a second source of truth.
    formulas: ['F002', 'F003', 'F004'].map(describeFormula),
  });
}

// ---- resources -------------------------------------------------------------

export async function getIncomes(req, res) {
  const incomes = await listIncomes(prisma, req.user.id, { includeArchived: req.query.includeArchived === 'true' });
  res.json({ incomes });
}

export async function postIncome(req, res) {
  res.status(201).json({ income: await createIncome(prisma, req.user.id, req.body) });
}

export async function patchIncome(req, res) {
  res.json({ income: await updateIncome(prisma, req.user.id, req.params.id, req.body) });
}

export async function putIncomeArchived(req, res) {
  const { archived, reason } = req.body;
  res.json({ income: await setIncomeArchived(prisma, req.user.id, req.params.id, archived, { reason }) });
}

export async function removeIncome(req, res) {
  res.json(await deleteIncome(prisma, req.user.id, req.params.id, { reason: req.body?.reason }));
}

// ---- transactions ----------------------------------------------------------

export async function getTransactions(req, res) {
  res.json(await listTransactions(prisma, req.user.id, req.query));
}

export async function postTransaction(req, res) {
  const { transaction, duplicates } = await createTransaction(prisma, req.user.id, req.body);
  // The suspected duplicate travels with the created row: the client asks for
  // it to be SIGNALLED. Blocking would refuse two identical real movements.
  res.status(201).json({ transaction, duplicates });
}

export async function patchTransaction(req, res) {
  res.json({ transaction: await updateTransaction(prisma, req.user.id, req.params.id, req.body) });
}

export async function removeTransaction(req, res) {
  res.json(await deleteTransaction(prisma, req.user.id, req.params.id, { reason: req.body?.reason }));
}

export async function getTransactionHistory(req, res) {
  // Ownership first: the trail of a row that is not the caller's is a 404, like
  // every other verb on it.
  await getTransaction(prisma, req.user.id, req.params.id);
  const changes = await listChanges(prisma, { userId: req.user.id, entity: TRANSACTION_ENTITY, entityId: req.params.id });
  res.json({ changes });
}

export async function getIncomeHistory(req, res) {
  const income = await prisma.finIncome.findFirst({ where: { id: req.params.id, userId: req.user.id }, select: { id: true } });
  if (!income) throw new HttpError(404, 'Resource not found');
  const changes = await listChanges(prisma, { userId: req.user.id, entity: INCOME_ENTITY, entityId: req.params.id });
  res.json({ changes });
}

// ---- export ----------------------------------------------------------------

// One CSV cell. Quoted always, and a value that starts like a formula is
// prefixed with a quote: a spreadsheet would otherwise EXECUTE `=...` from a
// note somebody typed. The person's own data must not become a payload.
function csvCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function exportTransactions(req, res) {
  const rows = await allTransactionsFor(prisma, req.user.id, req.query);
  const lines = [EXPORT_COLUMNS.map(csvCell).join(',')];
  for (const row of rows) {
    lines.push(
      [
        row.occurredAt.toISOString().slice(0, 10),
        row.kind,
        // Centimes, as stored: an export that rounded would not add up to the
        // totals shown on screen.
        row.value,
        row.currency,
        row.category?.label ?? '',
        row.subcategory ?? '',
        row.paymentMethod ?? '',
        row.status,
        row.source,
        row.shared ? 'oui' : 'non',
        row.planned ? 'oui' : 'non',
        row.note ?? '',
      ]
        .map(csvCell)
        .join(','),
    );
  }
  // A BOM so Excel reads the accents; CRLF, which is what the CSV convention
  // asks for.
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', 'attachment; filename="mon-argent.csv"');
  res.set('Cache-Control', 'private, no-store');
  res.send(`﻿${lines.join('\r\n')}\r\n`);
}

// ---- receipts --------------------------------------------------------------
// Private storage (P2-06), never a public URL: a receipt is served only to the
// account that owns the transaction, and only through this route.

export async function postReceipt(req, res) {
  let transaction;
  try {
    transaction = await getTransaction(prisma, req.user.id, req.params.id);
  } catch (err) {
    // The temporary upload is dropped before anything else: a refused request
    // must not leave a file behind.
    await discardTemp(req.file);
    throw err;
  }

  const stored = await ingestUpload(req.file, ['image', 'document']);
  // A replaced receipt: its row and its file both go, but only AFTER the new
  // one is in place — a failed replacement must not leave the movement without
  // the receipt it had.
  const previous = await prisma.media.findUnique({ where: { finTransactionId: transaction.id }, select: { id: true, storageKey: true } });
  const media = await prisma.$transaction(async (tx) => {
    // The old row goes first: `finTransactionId` is unique, so two receipts
    // cannot point at the same movement even for an instant.
    if (previous) await tx.media.delete({ where: { id: previous.id } });
    return tx.media.create({ data: { ...stored, uploadedById: req.user.id, finTransactionId: transaction.id } });
  });
  if (previous) await removeStored([previous.storageKey]);
  res.status(201).json({ receipt: { id: media.id, originalName: media.originalName, kind: media.kind, sizeBytes: media.sizeBytes } });
}

export async function getReceipt(req, res) {
  const transaction = await prisma.finTransaction.findFirst({
    where: { id: req.params.id, userId: req.user.id, deletedAt: null },
    select: { receipt: { select: { storageKey: true, mimeType: true, originalName: true, kind: true } } },
  });
  if (!transaction?.receipt) throw new HttpError(404, 'No receipt');
  sendStoredMedia(res, transaction.receipt);
  return undefined;
}

export async function removeReceipt(req, res) {
  const transaction = await getTransaction(prisma, req.user.id, req.params.id);
  const media = await prisma.media.findUnique({ where: { finTransactionId: transaction.id }, select: { id: true, storageKey: true } });
  if (!media) throw new HttpError(404, 'No receipt');
  await prisma.media.delete({ where: { id: media.id } });
  await removeStored([media.storageKey]);
  res.json({ id: req.params.id });
}

// ---- synthesis -------------------------------------------------------------

export async function getSynthesis(req, res) {
  const period = req.query.from ? { start: req.query.from, end: req.query.to } : currentMonth();
  const { incomes, movements, previous } = await loadSynthesisData(prisma, req.user.id, period);

  const synthesis = buildSynthesis({ incomes, movements, previous, fallbackCurrency: req.user.finCurrency, period });

  // The breakdown carries category ids; the labels are joined here so the
  // interface never has to guess what a category is called.
  const ids = synthesis.repartition.map((row) => row.categoryId).filter(Boolean);
  const labels = new Map(
    (await prisma.finCategory.findMany({ where: { id: { in: ids } }, select: { id: true, label: true } })).map((row) => [row.id, row.label]),
  );
  synthesis.repartition = synthesis.repartition.map((row) => ({ ...row, label: row.categoryId ? (labels.get(row.categoryId) ?? null) : null }));

  res.json({ periode: { debut: period.start, fin: period.end }, synthese: synthesis });
}
