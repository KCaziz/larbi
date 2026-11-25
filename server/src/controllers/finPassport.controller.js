import { prisma } from '../config/prisma.js';
import { HttpError } from '../utils/httpError.js';
import { resolveOrganization } from '../services/finOrganization.service.js';
import {
  batchCsv,
  createBatch,
  discardPassport,
  financerSpaces,
  financingCandidates,
  listBatches,
  listPassports,
  moveBatch,
  openShare,
  preparePassport,
  publishPassport,
  revokePassport,
  revokeShare,
  setDispute,
  sharesForSpace,
  shareWith,
} from '../services/finPassport.service.js';

// P13-05, lot F bis: the financial passport (FAC-010) and the receivables to
// finance (FAC-011). Read by the finance readers; prepared, published and shared
// by the organisation's managers (`partners.request`, ECR-0161): sharing data
// with a financer is their decision.
const resolve = (req, action) => resolveOrganization(prisma, req, action);

export async function getPassports(req, res) {
  const ctx = await resolve(req, 'finance.read');
  res.json({ passeports: await listPassports(prisma, ctx), financeurs: await financerSpaces(prisma) });
}

export async function postPassport(req, res) {
  res.status(201).json({ passeport: await preparePassport(prisma, await resolve(req, 'partners.request'), req.body) });
}

export async function postPassportStep(req, res) {
  const ctx = await resolve(req, 'partners.request');
  const step = req.params.step;
  if (step === 'publier') return res.json({ passeport: await publishPassport(prisma, ctx, req.params.id, req.body) });
  if (step === 'revoquer') return res.json({ passeport: await revokePassport(prisma, ctx, req.params.id) });
  throw new HttpError(404, 'Not found');
}

export async function deletePassport(req, res) {
  await discardPassport(prisma, await resolve(req, 'partners.request'), req.params.id);
  res.status(204).end();
}

export async function postDispute(req, res) {
  res.json({ litige: await setDispute(prisma, await resolve(req, 'documents.write'), req.params.id, req.body) });
}

export async function getFinancingCandidates(req, res) {
  res.json(await financingCandidates(prisma, await resolve(req, 'finance.read'), req.query));
}

export async function getBatches(req, res) {
  res.json({ lots: await listBatches(prisma, await resolve(req, 'finance.read')) });
}

export async function postBatch(req, res) {
  res.status(201).json({ lot: await createBatch(prisma, await resolve(req, 'partners.request'), req.body) });
}

export async function postBatchStep(req, res) {
  res.json({ lot: await moveBatch(prisma, await resolve(req, 'partners.request'), req.params.id, req.params.step) });
}

export async function getBatchCsv(req, res) {
  const csv = await batchCsv(prisma, await resolve(req, 'finance.read'), req.params.id);
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', 'attachment; filename="lot-factures.csv"');
  res.send(csv);
}

export async function postShare(req, res) {
  res.status(201).json({ partage: await shareWith(prisma, await resolve(req, 'partners.request'), req.body) });
}

export async function deleteShare(req, res) {
  res.json(await revokeShare(prisma, await resolve(req, 'partners.request'), req.params.id));
}

// ---- the financer's side --------------------------------------------------------------------

async function financerSpace(req) {
  const member = await prisma.finPartnerSpaceMember.findFirst({ where: { spaceId: req.params.id, userId: req.user.id, space: { active: true, kind: 'financer' } } });
  // 404, not 403: a space one is not a member of does not exist for them.
  if (!member) throw new HttpError(404, 'Space not found', { reason: 'spaceNotFound' });
}

export async function getSpaceShares(req, res) {
  await financerSpace(req);
  res.json({ partages: await sharesForSpace(prisma, req.params.id) });
}

export async function getSpaceShare(req, res) {
  await financerSpace(req);
  res.json({ partage: await openShare(prisma, req.params.id, req.params.sub, req.user.id) });
}
