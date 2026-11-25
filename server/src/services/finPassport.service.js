import { randomUUID } from 'node:crypto';
import { HttpError } from '../utils/httpError.js';
import { computed } from './finance/contract.js';
import { journal } from './finOrganization.service.js';
import { businessDashboard } from './finBusiness.service.js';
import { ledgerOverview } from './finLedger.service.js';
import { documentSettlement, isIssuedInvoice } from './finBusinessView.service.js';

/**
 * P13-05, lot F bis (2026-11-25).
 *
 * 1. The financial passport of the organisation (FAC-010; ECR-0012, ECR-0050,
 *    ECR-0107, ECR-0152). A DATED SNAPSHOT of what the organisation chooses to
 *    include: identity, activity and cash, receivables, clients (concentration,
 *    never names), books (result, working capital) and the quality of the
 *    evidence. Its completeness index is explained check by check (E063).
 *    Without validated books, or with less than three months of history, it is
 *    a « provisional management passport ». It is never a credit rating, and
 *    promises nothing.
 *
 * 2. The receivables to finance (FAC-011; ECR-0104): the candidate invoices,
 *    the excluded ones with their reason, the theoretical cash net of fees
 *    (E064), a batch prepared and exported for a financer. FINCLUDIA grants
 *    nothing and assigns nothing.
 *
 * 3. Sharing either with a financer's space: explicit consent, an end date,
 *    revocable; every opening by the financer is recorded (ECR-0012).
 */

export const PASSPORT_ITEMS = ['activity', 'receivables', 'clients', 'books', 'quality'];
const DAY = 86_400_000;
const MAX_SHARE_DAYS = 180;
const LIVE_BATCH = ['draft', 'shared'];

// ---- 1. passport -------------------------------------------------------------------------

function completenessOf({ business, documents, payments, sales, validatedEntries, bankChecks, from, to }) {
  const months = (to - from) / (30.44 * DAY);
  const invoicedMonths = new Set(sales.map((d) => new Date(d.issuedAt).toISOString().slice(0, 7))).size;
  const costed = sales.filter((d) => d.costExcl !== null && d.costExcl !== undefined).length;
  const checks = [
    { key: 'identity', ok: Boolean(business.taxId && business.tradeRegister) },
    { key: 'history', ok: months >= 3 && invoicedMonths >= 3 },
    { key: 'payments', ok: payments.length > 0 },
    { key: 'costs', ok: sales.length > 0 && costed / sales.length >= 0.5 },
    { key: 'books', ok: validatedEntries > 0 },
    { key: 'bank', ok: bankChecks > 0 },
    { key: 'documents', ok: documents.length > 0 },
  ];
  const met = checks.filter((c) => c.ok).length;
  return {
    checks,
    index: computed('E063', met / checks.length, { inputs: { controles_remplis: met, controles: checks.length } }),
    provisional: !(validatedEntries > 0) || !(months >= 3 && invoicedMonths >= 3),
  };
}

async function snapshot(prisma, ctx, { from, to, items }) {
  const business = ctx.business;
  const [dashboard, documents, payments, ledger, bankChecks] = await Promise.all([
    businessDashboard(prisma, ctx, { from, to }),
    prisma.finBusinessDocument.findMany({ where: { businessId: business.id, archivedAt: null, deletedAt: null, issuedAt: { gte: from, lte: to } }, select: { id: true, kind: true, docType: true, state: true, issuedAt: true, contactId: true, amountExcl: true, taxAmount: true, costExcl: true, currency: true, source: true, sourceRef: true, relatedId: true, foreignCurrency: true, foreignAmountExcl: true, foreignTaxAmount: true, bookingRate: true, dueAt: true, archivedAt: true, deletedAt: true } }),
    prisma.finBusinessPayment.findMany({ where: { businessId: business.id, archivedAt: null, deletedAt: null, receivedAt: { gte: from, lte: to } }, select: { id: true } }),
    ledgerOverview(prisma, ctx, { from, to }),
    prisma.finLedgerBankCheck.count({ where: { businessId: business.id } }),
  ]);
  const sales = documents.filter((d) => d.kind === 'sale' && isIssuedInvoice(d));
  const validatedEntries = ledger.compteurs?.validees ?? 0;
  const quality = completenessOf({ business, documents, payments, sales, validatedEntries, bankChecks, from, to });
  const content = {
    identite: {
      nom: business.name,
      nomCommercial: business.tradeName ?? null,
      formeJuridique: business.legalForm ?? null,
      secteur: business.sector ?? null,
      wilaya: business.wilaya ?? null,
      nif: business.taxId ?? null,
      registreCommerce: business.tradeRegister ?? null,
      devise: business.currency,
    },
    periode: { debut: from, fin: to },
  };
  if (items.includes('activity')) {
    content.activite = {
      chiffreAffaires: dashboard.caFacture ?? null,
      marge: dashboard.marge ?? null,
      encaissements: dashboard.encaissements,
      decaissements: dashboard.decaissements,
      tresorerie: dashboard.tresorerie,
      base: dashboard.base,
    };
  }
  if (items.includes('receivables')) {
    content.creances = { creances: dashboard.creances, dettes: dashboard.dettes, echu: dashboard.echu, delaiMoyen: dashboard.delaiMoyen, balanceAgee: dashboard.balanceAgee ?? null };
  }
  if (items.includes('clients')) {
    // Concentration only: the clients' names are third parties' data, never shared here.
    const byClient = new Map();
    for (const d of sales) if (d.contactId) byClient.set(d.contactId, (byClient.get(d.contactId) ?? 0) + d.amountExcl);
    const total = [...byClient.values()].reduce((a, b) => a + b, 0);
    const sorted = [...byClient.values()].sort((a, b) => b - a);
    content.clients = {
      nombre: byClient.size,
      partPremierClient: computed('E065', total > 0 ? sorted[0] / total : null, { inputs: { clients: byClient.size } }),
      partCinqPremiers: computed('E065', total > 0 ? sorted.slice(0, 5).reduce((a, b) => a + b, 0) / total : null, { inputs: { clients: byClient.size } }),
    };
  }
  if (items.includes('books')) {
    content.comptes = validatedEntries > 0 ? { resultatNet: ledger.etats.resultatNet, bfr: ledger.etats.bfr, provisoire: ledger.provisoire } : null;
  }
  if (items.includes('quality')) {
    const bySource = {};
    for (const d of documents) bySource[d.source] = (bySource[d.source] ?? 0) + 1;
    content.qualite = { documents: documents.length, parOrigine: bySource, ecrituresValidees: validatedEntries, rapprochementsBancaires: bankChecks };
  }
  content.limites = [
    'Passeport de gestion établi par l’organisation à partir de ses données dans FINCLUDIA.',
    'Ce n’est ni une notation, ni une décision de crédit, ni une promesse de financement.',
    ...(quality.provisional ? ['Passeport provisoire : comptes non validés ou historique de moins de trois mois.'] : []),
  ];
  return { content, quality };
}

const passportView = (p) => ({ ...p, partages: p.shares?.map(shareView) ?? [] });

export async function listPassports(prisma, ctx) {
  const passports = await prisma.finBusinessPassport.findMany({
    where: { businessId: ctx.business.id },
    orderBy: { number: 'desc' },
    include: { shares: { include: { space: { select: { name: true } }, _count: { select: { accesses: true } } }, orderBy: { createdAt: 'desc' } } },
  });
  return passports.map(passportView);
}

/** Préparer / Assembler: a new numbered draft, computed now for the period. */
export async function preparePassport(prisma, ctx, { from, to, items }) {
  if (new Date(to) < new Date(from)) throw new HttpError(422, 'The period ends after it starts', { reason: 'datesOutOfOrder' });
  const chosen = [...new Set(items)].filter((i) => PASSPORT_ITEMS.includes(i));
  const { content, quality } = await snapshot(prisma, ctx, { from: new Date(from), to: new Date(to), items: chosen });
  return prisma.$transaction(async (tx) => {
    const last = await tx.finBusinessPassport.findFirst({ where: { businessId: ctx.business.id }, orderBy: { number: 'desc' }, select: { number: true } });
    const passport = await tx.finBusinessPassport.create({
      data: {
        businessId: ctx.business.id,
        number: (last?.number ?? 0) + 1,
        periodFrom: new Date(from),
        periodTo: new Date(to),
        items: chosen,
        content,
        completeness: { checks: quality.checks, index: quality.index },
        provisional: quality.provisional,
        preparedById: ctx.member.userId,
      },
    });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'passport.prepared', objectType: 'passport', objectId: passport.id, details: { number: passport.number } });
    return passport;
  });
}

async function findPassport(prisma, ctx, id) {
  const passport = await prisma.finBusinessPassport.findFirst({ where: { id, businessId: ctx.business.id } });
  if (!passport) throw new HttpError(404, 'Passport not found', { reason: 'passportNotFound' });
  return passport;
}

/** Valider / Publier: with the publisher's explicit consent. The content no longer changes. */
export async function publishPassport(prisma, ctx, id, { consent }) {
  if (consent !== true) throw new HttpError(422, 'Publishing needs explicit consent', { reason: 'consentRequired' });
  const passport = await findPassport(prisma, ctx, id);
  if (passport.status !== 'draft') throw new HttpError(409, 'Only a draft is published', { reason: 'invalidTransition' });
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finBusinessPassport.update({ where: { id }, data: { status: 'published', publishedAt: new Date(), publishedById: ctx.member.userId } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'passport.published', objectType: 'passport', objectId: id, details: { number: passport.number } });
    return updated;
  });
}

/** Révoquer: the passport and every share of it stop at once. */
export async function revokePassport(prisma, ctx, id) {
  const passport = await findPassport(prisma, ctx, id);
  if (passport.status === 'revoked') throw new HttpError(409, 'Already revoked', { reason: 'invalidTransition' });
  return prisma.$transaction(async (tx) => {
    const now = new Date();
    await tx.finBusinessShare.updateMany({ where: { passportId: id, revokedAt: null }, data: { revokedAt: now } });
    const updated = await tx.finBusinessPassport.update({ where: { id }, data: { status: 'revoked', revokedAt: now } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'passport.revoked', objectType: 'passport', objectId: id, details: { number: passport.number } });
    return updated;
  });
}

export async function discardPassport(prisma, ctx, id) {
  const passport = await findPassport(prisma, ctx, id);
  if (passport.status !== 'draft') throw new HttpError(409, 'A published passport is revoked, not deleted', { reason: 'invalidTransition' });
  await prisma.$transaction(async (tx) => {
    await tx.finBusinessPassport.delete({ where: { id } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'passport.discarded', objectType: 'passport', objectId: id, details: { number: passport.number } });
  });
}

// ---- 2. receivables to finance -------------------------------------------------------------

/** Mark (or clear) a dispute on a sale invoice: a disputed invoice is never offered. */
export async function setDispute(prisma, ctx, documentId, { disputed, note }) {
  const doc = await prisma.finBusinessDocument.findFirst({ where: { id: documentId, businessId: ctx.business.id, deletedAt: null } });
  if (!doc) throw new HttpError(404, 'Document not found', { reason: 'documentNotFound' });
  if (doc.kind !== 'sale' || !isIssuedInvoice(doc)) throw new HttpError(409, 'Only an issued sale invoice is disputed', { reason: 'notIssued' });
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finBusinessDocument.update({ where: { id: documentId }, data: { disputedAt: disputed ? new Date() : null, disputeNote: disputed ? (note ?? null) : null } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: disputed ? 'document.disputed' : 'document.dispute_cleared', objectType: 'document', objectId: documentId, details: { number: doc.number } });
    return { id: updated.id, disputedAt: updated.disputedAt, disputeNote: updated.disputeNote };
  });
}

/** Pure: the cash a financer would advance, net of its fees (FAC-011; TST-00037). */
export function financingOf(eligible, advanceRate, feeRate) {
  const advance = Math.round(eligible * advanceRate);
  const fees = Math.round(eligible * feeRate);
  return { advance, fees, net: advance - fees };
}

/** Examiner l'éligibilité: candidates and exclusions, each with its reason. */
export async function financingCandidates(prisma, ctx, { minAmount = 0, advanceRate = 0.8, feeRate = 0.01, now = new Date() } = {}) {
  const businessId = ctx.business.id;
  const [documents, payments, live] = await Promise.all([
    prisma.finBusinessDocument.findMany({ where: { businessId, archivedAt: null, deletedAt: null }, include: { contact: { select: { id: true, name: true, taxId: true } } } }),
    prisma.finBusinessPayment.findMany({ where: { businessId, archivedAt: null, deletedAt: null } }),
    prisma.finBusinessFinancingItem.findMany({ where: { batch: { businessId, status: { in: LIVE_BATCH } } }, select: { documentId: true, batch: { select: { label: true } } } }),
  ]);
  const assigned = new Map(live.map((i) => [i.documentId, i.batch.label]));
  const today = new Date(now.toISOString().slice(0, 10));
  const rows = documents
    .filter((d) => d.kind === 'sale' && isIssuedInvoice(d))
    .map((d) => ({ document: d, settlement: documentSettlement(d, payments, documents) }))
    .filter((r) => r.settlement.outstanding > 0);
  const eligible = [];
  const excluded = [];
  for (const { document: d, settlement } of rows) {
    const reasons = [];
    if (assigned.has(d.id)) reasons.push('alreadyInBatch');
    if (d.disputedAt) reasons.push('disputed');
    if (!d.contactId) reasons.push('noClient');
    else if (!d.contact?.taxId) reasons.push('payerUnidentified');
    if (!d.dueAt) reasons.push('noDueDate');
    else if (new Date(d.dueAt) < today) reasons.push('overdue');
    if (settlement.outstanding < minAmount) reasons.push('belowMinimum');
    const line = { id: d.id, number: d.number, label: d.label, client: d.contact?.name ?? null, issuedAt: d.issuedAt, dueAt: d.dueAt, outstanding: settlement.outstanding, currency: d.currency, foreign: d.foreignCurrency ? { currency: d.foreignCurrency, outstanding: settlement.devise?.outstanding ?? null } : null };
    if (reasons.length) excluded.push({ ...line, reasons, batch: assigned.get(d.id) ?? null });
    else eligible.push(line);
  }
  const total = eligible.reduce((s, l) => s + l.outstanding, 0);
  const f = financingOf(total, advanceRate, feeRate);
  const currency = ctx.business.currency;
  const inputs = { factures_eligibles: eligible.length, taux_avance: advanceRate, taux_frais: feeRate };
  return {
    eligibles: eligible,
    exclues: excluded,
    hypotheses: { advanceRate, feeRate, minAmount },
    montantEligible: computed('E064', eligible.length ? total : null, { inputs, currency, hypotheses: { advanceRate, feeRate } }),
    netTheorique: computed('E064', eligible.length ? f.net : null, { inputs, currency, hypotheses: { advanceRate, feeRate } }),
    avance: eligible.length ? f.advance : null,
    frais: eligible.length ? f.fees : null,
  };
}

const batchInclude = {
  items: { include: { document: { select: { id: true, number: true, label: true, issuedAt: true, dueAt: true, currency: true, foreignCurrency: true, contact: { select: { name: true, taxId: true } } } } } },
  shares: { include: { space: { select: { name: true } }, _count: { select: { accesses: true } } }, orderBy: { createdAt: 'desc' } },
};

function batchView(b) {
  const total = b.items.reduce((s, i) => s + i.amount, 0);
  const f = financingOf(total, b.advanceRate, b.feeRate);
  return { ...b, total, ...f, partages: b.shares.map(shareView) };
}

export async function listBatches(prisma, ctx) {
  const batches = await prisma.finBusinessFinancingBatch.findMany({ where: { businessId: ctx.business.id }, include: batchInclude, orderBy: { createdAt: 'desc' } });
  return batches.map(batchView);
}

/** Créer lot: the server checks every invoice again (a screen can be stale). */
export async function createBatch(prisma, ctx, { label, documentIds, advanceRate, feeRate }) {
  const ids = [...new Set(documentIds)];
  const candidates = await financingCandidates(prisma, ctx, { advanceRate, feeRate });
  const byId = new Map(candidates.eligibles.map((l) => [l.id, l]));
  const refused = ids.filter((id) => !byId.has(id));
  if (refused.length) {
    const reasons = candidates.exclues.filter((e) => refused.includes(e.id)).map((e) => ({ id: e.id, number: e.number, reasons: e.reasons }));
    throw new HttpError(422, 'Some invoices cannot be financed', { reason: 'notEligible', invoices: reasons.length ? reasons : refused.map((id) => ({ id, reasons: ['notFound'] })) });
  }
  return prisma.$transaction(async (tx) => {
    const batch = await tx.finBusinessFinancingBatch.create({
      data: { businessId: ctx.business.id, label, advanceRate, feeRate, createdById: ctx.member.userId, items: { create: ids.map((id) => ({ documentId: id, amount: byId.get(id).outstanding })) } },
      include: batchInclude,
    });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'financing.batch.created', objectType: 'financingBatch', objectId: batch.id, details: { invoices: ids.length } });
    return batchView(batch);
  });
}

export async function moveBatch(prisma, ctx, id, step) {
  const batch = await prisma.finBusinessFinancingBatch.findFirst({ where: { id, businessId: ctx.business.id } });
  if (!batch) throw new HttpError(404, 'Batch not found', { reason: 'batchNotFound' });
  const next = { cloturer: 'closed', annuler: 'cancelled' }[step];
  if (!next || !LIVE_BATCH.includes(batch.status)) throw new HttpError(409, 'This batch cannot take this step', { reason: 'invalidTransition' });
  return prisma.$transaction(async (tx) => {
    // A closed or cancelled batch is no longer shared.
    await tx.finBusinessShare.updateMany({ where: { batchId: id, revokedAt: null }, data: { revokedAt: new Date() } });
    await tx.finBusinessFinancingBatch.update({ where: { id }, data: { status: next } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: `financing.batch.${next}`, objectType: 'financingBatch', objectId: id, details: {} });
    return batchView(await tx.finBusinessFinancingBatch.findUnique({ where: { id }, include: batchInclude }));
  });
}

const csvCell = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[;"\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Exporter pour partenaire: one line per invoice, as the batch holds it. */
export async function batchCsv(prisma, ctx, id) {
  const batch = await prisma.finBusinessFinancingBatch.findFirst({ where: { id, businessId: ctx.business.id }, include: batchInclude });
  if (!batch) throw new HttpError(404, 'Batch not found', { reason: 'batchNotFound' });
  const head = ['numero', 'libelle', 'client', 'nif_client', 'emise_le', 'echeance', 'montant_du', 'devise'];
  const lines = batch.items.map((i) => [i.document.number, i.document.label, i.document.contact?.name, i.document.contact?.taxId, i.document.issuedAt.toISOString().slice(0, 10), i.document.dueAt?.toISOString().slice(0, 10), (i.amount / 100).toFixed(2), i.document.currency]);
  return '﻿' + [head, ...lines].map((l) => l.map(csvCell).join(';')).join('\r\n') + '\r\n';
}

// ---- 3. sharing with a financer -------------------------------------------------------------

function shareView(s) {
  const now = new Date();
  return {
    id: s.id,
    kind: s.kind,
    espace: s.space?.name ?? null,
    spaceId: s.spaceId,
    consentAt: s.consentAt,
    expiresAt: s.expiresAt,
    revokedAt: s.revokedAt,
    actif: !s.revokedAt && new Date(s.expiresAt) > now,
    ouvertures: s._count?.accesses ?? 0,
  };
}

/** The financers an organisation can share with (spaces of kind « financer »). */
export async function financerSpaces(prisma) {
  return prisma.finPartnerSpace.findMany({ where: { kind: 'financer', active: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } });
}

export async function shareWith(prisma, ctx, { kind, id, spaceId, expiresAt, consent }) {
  if (consent !== true) throw new HttpError(422, 'Sharing needs explicit consent', { reason: 'consentRequired' });
  const end = new Date(expiresAt);
  const now = new Date();
  if (end <= now || end - now > MAX_SHARE_DAYS * DAY) throw new HttpError(422, 'A share ends within 180 days', { reason: 'invalidExpiry', maxDays: MAX_SHARE_DAYS });
  const space = await prisma.finPartnerSpace.findFirst({ where: { id: spaceId, kind: 'financer', active: true } });
  if (!space) throw new HttpError(404, 'Financer not found', { reason: 'spaceNotFound' });
  // The rule the database cannot hold (error 1901): a share points at what its kind says.
  if (kind === 'passport') {
    const p = await findPassport(prisma, ctx, id);
    if (p.status !== 'published') throw new HttpError(409, 'Only a published passport is shared', { reason: 'notPublished' });
  } else {
    const b = await prisma.finBusinessFinancingBatch.findFirst({ where: { id, businessId: ctx.business.id } });
    if (!b) throw new HttpError(404, 'Batch not found', { reason: 'batchNotFound' });
    if (!LIVE_BATCH.includes(b.status)) throw new HttpError(409, 'This batch is closed', { reason: 'invalidTransition' });
  }
  return prisma.$transaction(async (tx) => {
    const share = await tx.finBusinessShare.create({
      data: { id: randomUUID(), businessId: ctx.business.id, kind, passportId: kind === 'passport' ? id : null, batchId: kind === 'batch' ? id : null, spaceId, consentAt: now, expiresAt: end, createdById: ctx.member.userId },
      include: { space: { select: { name: true } }, _count: { select: { accesses: true } } },
    });
    if (kind === 'batch') await tx.finBusinessFinancingBatch.update({ where: { id }, data: { status: 'shared' } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: `${kind}.shared`, objectType: kind === 'batch' ? 'financingBatch' : 'passport', objectId: id, details: { space: space.name, until: end.toISOString() } });
    return shareView(share);
  });
}

export async function revokeShare(prisma, ctx, shareId) {
  const share = await prisma.finBusinessShare.findFirst({ where: { id: shareId, businessId: ctx.business.id } });
  if (!share) throw new HttpError(404, 'Share not found', { reason: 'shareNotFound' });
  if (share.revokedAt) throw new HttpError(409, 'Already revoked', { reason: 'invalidTransition' });
  return prisma.$transaction(async (tx) => {
    await tx.finBusinessShare.update({ where: { id: shareId }, data: { revokedAt: new Date() } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'share.revoked', objectType: share.kind === 'batch' ? 'financingBatch' : 'passport', objectId: share.passportId ?? share.batchId, details: {} });
    return { revoked: true };
  });
}

// ---- the financer's side (partner portal) ---------------------------------------------------

const liveShare = (now = new Date()) => ({ revokedAt: null, expiresAt: { gt: now } });

export async function sharesForSpace(prisma, spaceId) {
  const shares = await prisma.finBusinessShare.findMany({
    where: { spaceId, ...liveShare() },
    include: { business: { select: { name: true, tradeName: true, wilaya: true } }, passport: { select: { number: true, periodFrom: true, periodTo: true, provisional: true } }, batch: { select: { label: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return shares.map((s) => ({ id: s.id, kind: s.kind, organisation: s.business.tradeName || s.business.name, wilaya: s.business.wilaya, expiresAt: s.expiresAt, passport: s.passport, batch: s.batch }));
}

/** One share, opened by a member of the financer's space: the opening is recorded. */
export async function openShare(prisma, spaceId, shareId, userId) {
  const share = await prisma.finBusinessShare.findFirst({
    where: { id: shareId, spaceId, ...liveShare() },
    include: { business: { select: { name: true, tradeName: true, wilaya: true, currency: true } }, passport: true, batch: { include: batchInclude } },
  });
  // Revoked, expired or never shared: it does not exist for the financer.
  if (!share) throw new HttpError(404, 'Share not found', { reason: 'shareNotFound' });
  await prisma.finBusinessShareAccess.create({ data: { shareId, userId } });
  const organisation = { nom: share.business.tradeName || share.business.name, wilaya: share.business.wilaya, devise: share.business.currency };
  if (share.kind === 'passport') {
    const p = share.passport;
    return { kind: 'passport', organisation, expiresAt: share.expiresAt, passeport: { number: p.number, periodFrom: p.periodFrom, periodTo: p.periodTo, provisional: p.provisional, publishedAt: p.publishedAt, content: p.content, completeness: p.completeness } };
  }
  const { shares, ...batch } = batchView(share.batch);
  return { kind: 'batch', organisation, expiresAt: share.expiresAt, lot: batch };
}
