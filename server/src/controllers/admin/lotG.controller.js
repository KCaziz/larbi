import { prisma } from '../../config/prisma.js';
import { adminCreateOffer, adminListOffers, adminListRequests, adminUpdateOffer, adminUpdateRequest } from '../../services/finLotG.service.js';
import { decideHeld, decideReport, moderationQueue } from '../../services/forum.service.js';

// P13-05, lot G (2026-11-24): the administration of the partners' offers and
// of the requests the organisations send them (ECR-0159 to 0161, 0288), and
// the moderation of the forum (ECR-0158) — every decision by a person, kept.

export async function getPartnerOffers(req, res) {
  res.json({ offres: await adminListOffers(prisma) });
}

export async function postPartnerOffer(req, res) {
  res.status(201).json({ offre: await adminCreateOffer(prisma, req.body) });
}

export async function patchPartnerOffer(req, res) {
  res.json({ offre: await adminUpdateOffer(prisma, req.params.id, req.body) });
}

export async function getPartnerRequestsAdmin(req, res) {
  res.json({ demandes: await adminListRequests(prisma) });
}

export async function patchPartnerRequest(req, res) {
  res.json({ demande: await adminUpdateRequest(prisma, req.params.id, req.body, req.user.id) });
}

export async function getModeration(req, res) {
  res.json(await moderationQueue(prisma));
}

export async function postReportDecision(req, res) {
  res.json({ signalement: await decideReport(prisma, req.user.id, req.params.id, req.body) });
}

export async function postHeldDecision(req, res) {
  res.json({ contenu: await decideHeld(prisma, req.params.kind, req.params.id, req.body.publish) });
}
