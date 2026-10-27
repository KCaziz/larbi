import { prisma } from '../config/prisma.js';
import {
  accountBalanceHistory,
  accountsWithBalances,
  createAccount,
  createTransfer,
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
  res.json(await accountBalanceHistory(prisma, req.user.id, req.params.id, { months: req.query.months ?? 6 }));
}

export async function postAccount(req, res) {
  res.status(201).json({ account: await createAccount(prisma, req.user.id, req.body) });
}

export async function patchAccount(req, res) {
  res.json({ account: await updateAccount(prisma, req.user.id, req.params.id, req.body) });
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
