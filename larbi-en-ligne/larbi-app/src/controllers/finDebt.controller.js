import { prisma } from '../config/prisma.js';
import { MAX_DEBTS } from '../constants/finDebt.js';
import { listChanges } from '../services/finChange.service.js';
import {
  DEBT_BUDGET_CATEGORY_KEYS,
  budgetDebtInstalment,
  DEBT_ENTITY,
  buildDebtSynthesis,
  buildPayoffComparison,
  createDebt,
  deleteDebt,
  listDebtPayments,
  listDebts,
  ownDebt,
  recordDebtPayment,
  setDebtArchived,
  updateDebt,
  createSimpleLoan,
} from '../services/finDebt.service.js';
import { monthlyAmount, totalIncome } from '../services/finance/formulas.js';
import { describeFormula } from '../services/finance/describe.js';
import { HttpError } from '../utils/httpError.js';

// Debts (P6-10), screens C13-C14. Session required everywhere; every read and
// write is scoped to the caller's own rows.

export async function getDebtReferences(req, res) {
  // The categories an instalment is planned under in the budget (P8-24).
  const budgetCategories = await prisma.finCategory.findMany({ where: { userId: null, deletedAt: null, key: { in: DEBT_BUDGET_CATEGORY_KEYS } }, select: { id: true, label: true, icon: true }, orderBy: { label: 'asc' } });
  res.json({ formulas: ['F017', 'F018', 'F019', 'ALG-01'].map(describeFormula), budgetCategories });
}

// This account's net monthly income, normalised to the month (F001), the same
// way the budget view reads its resources — so F018 compares like with like.
async function netMonthlyIncome(prisma, userId, currency) {
  const incomes = await prisma.finIncome.findMany({
    where: { userId, deletedAt: null, archivedAt: null, currency, status: { not: 'fictional' } },
    select: { value: true, frequency: true },
  });
  if (incomes.length === 0) return null;
  const entries = incomes.map((income) => monthlyAmount(income.value, income.frequency)).filter((v) => v !== null).map((amount) => ({ amount, currency }));
  return entries.length === 0 ? null : totalIncome(entries, { currency });
}

export async function getDebts(req, res) {
  const currency = req.query.currency ?? req.user.finCurrency;
  const listed = await listDebts(prisma, req.user.id, { includeArchived: req.query.includeArchived === 'true' });
  // What has been repaid on each debt (recette R8-06): the screen draws the
  // starting amount — what is left plus what was repaid — and what is left,
  // so a repayment visibly shrinks the debt instead of the rest becoming 100 %.
  const repaid = await prisma.finDebtPayment.groupBy({
    by: ['debtId'],
    where: { userId: req.user.id, deletedAt: null, debtId: { in: listed.map((debt) => debt.id) } },
    _sum: { amount: true },
  });
  const repaidOf = new Map(repaid.map((row) => [row.debtId, row._sum.amount ?? 0]));
  const debts = listed.map((debt) => ({ ...debt, repaid: repaidOf.get(debt.id) ?? 0 }));
  const income = await netMonthlyIncome(prisma, req.user.id, currency);
  res.json({ debts, synthese: buildDebtSynthesis(debts, { netMonthlyIncome: income, currency }) });
}

export async function postDebt(req, res) {
  const count = await prisma.finDebt.count({ where: { userId: req.user.id, deletedAt: null } });
  if (count >= MAX_DEBTS) throw new HttpError(422, 'Too many debts', { reason: 'tooManyDebts' });
  res.status(201).json({ debt: await createDebt(prisma, req.user.id, req.body) });
}

export async function getDebt(req, res) {
  const debt = await ownDebt(prisma, req.user.id, req.params.id);
  const payments = await listDebtPayments(prisma, req.user.id, debt.id);
  res.json({ debt, paiements: payments });
}

export async function patchDebt(req, res) {
  res.json({ debt: await updateDebt(prisma, req.user.id, req.params.id, req.body) });
}

export async function putDebtArchived(req, res) {
  const { archived, reason } = req.body;
  res.json({ debt: await setDebtArchived(prisma, req.user.id, req.params.id, archived, { reason }) });
}

export async function removeDebt(req, res) {
  res.json(await deleteDebt(prisma, req.user.id, req.params.id, { reason: req.body?.reason }));
}

export async function postSimpleLoan(req, res) {
  const count = await prisma.finDebt.count({ where: { userId: req.user.id, deletedAt: null } });
  if (count >= MAX_DEBTS) throw new HttpError(422, 'Too many debts', { reason: 'tooManyDebts' });
  res.status(201).json({ debt: await createSimpleLoan(prisma, req.user.id, req.body) });
}

export async function postDebtBudget(req, res) {
  res.status(201).json(await budgetDebtInstalment(prisma, req.user.id, req.params.id, { categoryId: req.body.categoryId }));
}

export async function postDebtPayment(req, res) {
  res.status(201).json(await recordDebtPayment(prisma, req.user.id, req.params.id, req.body));
}

export async function getDebtHistory(req, res) {
  await ownDebt(prisma, req.user.id, req.params.id);
  const changes = await listChanges(prisma, { userId: req.user.id, entity: DEBT_ENTITY, entityId: req.params.id });
  res.json({ changes });
}

export async function getPayoffComparison(req, res) {
  const currency = req.query.currency ?? req.user.finCurrency;
  const debts = await listDebts(prisma, req.user.id, {});
  res.json(buildPayoffComparison(debts, { extraPayment: req.query.extraPayment ?? 0, currency }));
}
