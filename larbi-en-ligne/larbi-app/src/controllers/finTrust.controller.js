import { prisma } from '../config/prisma.js';
import { clearSessionCookie } from '../services/token.service.js';
import {
  buildCompleteness,
  buildDataInventory,
  connectedDevices,
  deleteAccount,
  exportAccountData,
  listConsents,
  withdrawSpaceSharing,
} from '../services/finTrust.service.js';
import { assertCurrentPassword } from '../utils/reauth.js';
import { HttpError } from '../utils/httpError.js';

// Trust and data centre (P6-19), screen C25.

export async function getInventory(req, res) {
  res.json({ tables: await buildDataInventory(prisma, req.user.id) });
}

export async function getCompleteness(req, res) {
  res.json(await buildCompleteness(prisma, req.user.id));
}

export async function getConsents(req, res) {
  res.json(await listConsents(prisma, req.user.id));
}

export async function postWithdrawSharing(req, res) {
  await assertCurrentPassword(req);
  const member = await withdrawSpaceSharing(prisma, req.user.id, req.body.spaceId, req.body.kind);
  res.json({ membre: member });
}

export async function getDevices(req, res) {
  res.json(connectedDevices());
}

export async function postExport(req, res) {
  await assertCurrentPassword(req);
  res.json(await exportAccountData(prisma, req.user.id));
}

export async function postDeleteAccount(req, res) {
  await assertCurrentPassword(req);
  if (req.body.email !== req.user.email) throw new HttpError(422, 'E-mail does not match this account', { reason: 'emailMismatch' });
  await deleteAccount(prisma, req.user.id);
  clearSessionCookie(res);
  res.json({ deleted: true });
}
