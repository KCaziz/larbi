import { prisma } from '../config/prisma.js';
import {
  accountBalanceHistory,
  accountFlow,
  accountsWithBalances,
  createAccount,
  createTransfer,
  deleteAccount,
  deleteTransfer,
  setAccountArchived,
  assertMayOpenAccount,
  SYSTEM_ACCOUNT_TYPES,
  updateAccount,
} from '../services/finAccount.service.js';
import { budgetsOfAccount } from '../services/finBudget.service.js';

// Accounts and transfers (P8-03). Every read and write goes through the
// service with the session's own id: an account is only ever this person's.

export async function getAccounts(req, res) {
  res.json(await accountsWithBalances(prisma, req.user.id, { includeArchived: req.query.includeArchived ?? false }));
}

export async function getAccountHistory(req, res) {
  res.json(await accountBalanceHistory(prisma, req.user.id, req.params.id, { months: req.query.months ?? 6, days: req.query.jours ?? null }));
}

// Recette R10-09: in and out of one account, transfers included.
export async function getAccountFlow(req, res) {
  const flow = await accountFlow(prisma, req.user.id, req.params.id, { from: req.query.from ?? null, to: req.query.to ?? null });
  // R16: the budgets this account pays, and the envelope each of its expenses is counted in.
  const account = await prisma.finAccount.findFirst({ where: { id: req.params.id, userId: req.user.id }, select: { id: true, currency: true, includeInTotal: true } });
  const { budgets, rapprochement } = await budgetsOfAccount(prisma, req.user.id, account);
  res.json({ ...flow, budgets, derniers: flow.derniers.map((row) => ({ ...row, rapprochement: rapprochement[row.id] ?? null })) });
}

export async function postAccount(req, res) {
  await assertMayOpenAccount(prisma, req.user);
  res.status(201).json({ account: await createAccount(prisma, req.user.id, req.body) });
}

export async function patchAccount(req, res) {
  res.json({ account: await updateAccount(prisma, req.user.id, req.params.id, req.body) });
}

// Recette R10-08: delete for good (archiving keeps the account).
export async function removeAccount(req, res) {
  res.json(await deleteAccount(prisma, req.user.id, req.params.id, { reason: req.body.reason }));
}

export async function putAccountArchived(req, res) {
  // P12-03: bringing an archived account back is opening it again.
  if (req.body.archived === false) {
    const account = await prisma.finAccount.findFirst({ where: { id: req.params.id, userId: req.user.id, deletedAt: null }, select: { id: true, source: true, type: true, archivedAt: true } });
    if (account?.archivedAt && account.source === 'manual' && !SYSTEM_ACCOUNT_TYPES.includes(account.type)) await assertMayOpenAccount(prisma, req.user, { exceptId: account.id });
  }
  res.json({ account: await setAccountArchived(prisma, req.user.id, req.params.id, req.body.archived, { reason: req.body.reason }) });
}

export async function postTransfer(req, res) {
  res.status(201).json({ transfer: await createTransfer(prisma, req.user.id, req.body) });
}

export async function removeTransfer(req, res) {
  res.json(await deleteTransfer(prisma, req.user.id, req.params.transferId, { reason: req.body?.reason }));
}
