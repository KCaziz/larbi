import { prisma } from '../config/prisma.js';
import { clearSessionCookie } from '../services/token.service.js';
import {
  buildCompleteness,
  buildDataInventory,
  deleteAccount,
  exportAccountData,
  listConsents,
  withdrawSpaceSharing,
} from '../services/finTrust.service.js';
import { listSessions, revokeOtherSessions, revokeSession } from '../services/session.service.js';
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
  const sessions = await listSessions(prisma, req.user.id);
  res.json({
    disponible: true,
    appareils: sessions.map((session) => ({ ...session, courant: session.id === req.sessionId })),
    // A session opened before this existed has no row: it still works and is
    // not listed. Said, so the list is never read as complete when it is not.
    sessionCourantSuivie: Boolean(req.sessionId),
  });
}

// « Déconnecter un appareil » is a sensitive action: the password is asked
// again, so that a stolen open session cannot sign the owner out of theirs.
export async function postDisconnectDevice(req, res) {
  await assertCurrentPassword(req);
  if ((await revokeSession(prisma, req.user.id, req.params.id)) === 0) throw new HttpError(404, 'Device not found');
  res.json({ deconnecte: true });
}

export async function postDisconnectOthers(req, res) {
  await assertCurrentPassword(req);
  res.json({ deconnectes: await revokeOtherSessions(prisma, req.user.id, req.sessionId ?? null) });
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
