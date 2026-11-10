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
  updateAccount,
} from '../services/finAccount.service.js';

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
  res.json(await accountFlow(prisma, req.user.id, req.params.id, { from: req.query.from ?? null, to: req.query.to ?? null }));
}

export async function postAccount(req, res) {
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
  res.json({ account: await setAccountArchived(prisma, req.user.id, req.params.id, req.body.archived, { reason: req.body.reason }) });
}

export async function postTransfer(req, res) {
  res.status(201).json({ transfer: await createTransfer(prisma, req.user.id, req.body) });
}

export async function removeTransfer(req, res) {
  res.json(await deleteTransfer(prisma, req.user.id, req.params.transferId, { reason: req.body?.reason }));
}
