import { HttpError } from '../utils/httpError.js';
import { computed } from './finance/contract.js';
import { journal } from './finOrganization.service.js';
import { businessCashPlan, businessDashboard } from './finBusiness.service.js';
import { campaignView } from './finLotG.service.js';

/**
 * P13-05, lot I (2026-11-25) — the partners' and institutions' own space
 * (ECR-0287 to 0294, PRT-006/007/019/020, DRT-010 to 012, DRT-024) and the
 * crowdfunding regulatory report (ECR-0307).
 *
 * A space is created by the administration, which names its members. Nothing
 * is visible from it without a consent given elsewhere: a financer reads only
 * the requests sent to its offers and what each one chose to share; an
 * institution reads aggregates of the learners who accepted its invitation,
 * and none below its anonymity threshold; a platform reads only the validated
 * reports of the campaigns linked to it.
 */

export const SPACE_KINDS = ['financer', 'institution', 'cip'];
const FINANCER_STATUSES = ['received', 'in_review', 'answered', 'closed'];
const DAY = 86400000;

// ---- administration -----------------------------------------------------------------------

export const adminListSpaces = (prisma) =>
  prisma.finPartnerSpace.findMany({ orderBy: { createdAt: 'desc' }, include: { members: { include: { user: { select: { email: true, name: true } } } }, _count: { select: { offers: true, programs: true, campaigns: true } } } });

export const adminCreateSpace = (prisma, body) => prisma.finPartnerSpace.create({ data: body });

export async function adminUpdateSpace(prisma, id, body) {
  if (!(await prisma.finPartnerSpace.findUnique({ where: { id } }))) throw new HttpError(404, 'Space not found', { reason: 'spaceNotFound' });
  return prisma.finPartnerSpace.update({ where: { id }, data: body });
}

export async function adminAddMember(prisma, id, { email }) {
  if (!(await prisma.finPartnerSpace.findUnique({ where: { id } }))) throw new HttpError(404, 'Space not found', { reason: 'spaceNotFound' });
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) throw new HttpError(404, 'No account with this e-mail', { reason: 'accountNotFound' });
  return prisma.finPartnerSpaceMember.upsert({ where: { spaceId_userId: { spaceId: id, userId: user.id } }, update: {}, create: { spaceId: id, userId: user.id } });
}

export async function adminRemoveMember(prisma, id, memberId) {
  const member = await prisma.finPartnerSpaceMember.findFirst({ where: { id: memberId, spaceId: id } });
  if (!member) throw new HttpError(404, 'Member not found', { reason: 'memberNotFound' });
  await prisma.finPartnerSpaceMember.delete({ where: { id: memberId } });
  return { id: memberId };
}

// ---- access ----------------------------------------------------------------------------------

export async function mySpaces(prisma, user) {
  const rows = await prisma.finPartnerSpaceMember.findMany({ where: { userId: user.id, space: { active: true } }, include: { space: true } });
  return rows.map((r) => ({ id: r.space.id, name: r.space.name, kind: r.space.kind }));
}

export async function spaceOf(prisma, user, spaceId, kind) {
  const member = await prisma.finPartnerSpaceMember.findFirst({ where: { spaceId, userId: user.id, space: { active: true } }, include: { space: true } });
  // 404, not 403: a space one is not a member of does not exist for them.
  if (!member || (kind && member.space.kind !== kind)) throw new HttpError(404, 'Space not found', { reason: 'spaceNotFound' });
  return member.space;
}

// ---- financer: consented files (ECR-0287) and requests for documents (ECR-0288) ---------------

const responseDays = (messages) => {
  const asked = messages.filter((m) => m.side === 'partner' && m.kind === 'piece');
  const times = asked.map((m) => messages.find((r) => r.replyToId === m.id)).map((r, i) => (r ? (new Date(r.createdAt) - new Date(asked[i].createdAt)) / DAY : null)).filter((d) => d !== null);
  return times.length ? times.reduce((a, b) => a + b, 0) / times.length : null;
};

export async function financerFiles(prisma, user, spaceId, { status } = {}) {
  await spaceOf(prisma, user, spaceId, 'financer');
  const requests = await prisma.finPartnerRequest.findMany({
    where: { offer: { spaceId }, status: status ? status : { not: 'withdrawn' } },
    orderBy: { createdAt: 'desc' },
    include: { offer: { select: { title: true } }, business: { select: { name: true, tradeName: true, wilaya: true, publicKey: true } }, messages: true },
  });
  const all = requests.flatMap((r) => r.messages);
  const avg = responseDays(all);
  return {
    dossiers: requests.map(({ messages, ...r }) => ({ ...r, demandesOuvertes: messages.filter((m) => m.kind === 'piece' && !m.closedAt && !messages.some((x) => x.replyToId === m.id)).length, echeance: messages.filter((m) => m.dueAt && !m.closedAt).map((m) => m.dueAt).sort()[0] ?? null })),
    delaiReponse: computed('E053', avg === null ? null : Math.round(avg * 10) / 10, { inputs: { demandes: all.filter((m) => m.kind === 'piece').length } }),
  };
}

async function fileOf(prisma, spaceId, requestId) {
  const request = await prisma.finPartnerRequest.findFirst({ where: { id: requestId, offer: { spaceId }, status: { not: 'withdrawn' } }, include: { offer: { select: { title: true, partnerName: true } }, business: true, messages: { orderBy: { createdAt: 'asc' } } } });
  if (!request) throw new HttpError(404, 'File not found', { reason: 'requestNotFound' });
  return request;
}

/** One file, with ONLY what the organisation chose to share, read now (DRT-011). */
export async function financerFile(prisma, user, spaceId, requestId) {
  await spaceOf(prisma, user, spaceId, 'financer');
  const request = await fileOf(prisma, spaceId, requestId);
  const b = request.business;
  const ctx = { business: b };
  const shared = {};
  const items = request.sharedItems ?? [];
  if (items.includes('profile')) shared.profile = { name: b.name, tradeName: b.tradeName, legalForm: b.legalForm, sector: b.sector, wilaya: b.wilaya, publicKey: b.publicKey, currency: b.currency };
  if (items.includes('dashboard') || items.includes('receivables')) shared.dashboard = await businessDashboard(prisma, ctx);
  if (items.includes('cashPlan')) shared.cashPlan = await businessCashPlan(prisma, ctx);
  if (items.includes('documents')) {
    shared.documents = await prisma.finBusinessDocument.findMany({ where: { businessId: b.id, deletedAt: null, archivedAt: null, state: 'issued' }, select: { docType: true, kind: true, number: true, issuedAt: true, dueAt: true, amountExcl: true, taxAmount: true, currency: true }, orderBy: { issuedAt: 'desc' }, take: 100 });
  }
  if (items.includes('projects')) shared.projects = await prisma.finBusinessProject.findMany({ where: { businessId: b.id }, select: { name: true, nature: true, budget: true, currency: true, status: true } });
  const { business, ...rest } = request;
  return { ...rest, organisation: { name: b.tradeName || b.name, wilaya: b.wilaya }, partage: shared };
}

export async function financerSetStatus(prisma, user, spaceId, requestId, { status, note }) {
  await spaceOf(prisma, user, spaceId, 'financer');
  if (!FINANCER_STATUSES.includes(status)) throw new HttpError(422, 'Unknown status', { reason: 'invalidTransition' });
  const request = await fileOf(prisma, spaceId, requestId);
  if (request.status === 'closed') throw new HttpError(409, 'This request is closed', { reason: 'requestClosed' });
  const history = [...request.history, { at: new Date().toISOString(), status, by: 'partenaire', note: note ?? null }];
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finPartnerRequest.update({ where: { id: requestId }, data: { status, history } });
    await journal(tx, { businessId: request.businessId, actorId: user.id, action: 'partner.status', objectType: 'partnerRequest', objectId: requestId, details: { status } });
    return updated;
  });
}

export async function financerMessage(prisma, user, spaceId, requestId, body) {
  await spaceOf(prisma, user, spaceId, 'financer');
  const request = await fileOf(prisma, spaceId, requestId);
  if (request.status === 'closed') throw new HttpError(409, 'This request is closed', { reason: 'requestClosed' });
  return prisma.$transaction(async (tx) => {
    const message = await tx.finPartnerMessage.create({ data: { requestId, side: 'partner', kind: body.kind, body: body.body, dueAt: body.dueAt ? new Date(body.dueAt) : null, authorId: user.id } });
    await journal(tx, { businessId: request.businessId, actorId: user.id, action: body.kind === 'piece' ? 'partner.pieceRequested' : 'partner.commented', objectType: 'partnerRequest', objectId: requestId, details: {} });
    return message;
  });
}

export async function financerCloseMessage(prisma, user, spaceId, requestId, messageId) {
  await spaceOf(prisma, user, spaceId, 'financer');
  await fileOf(prisma, spaceId, requestId);
  const message = await prisma.finPartnerMessage.findFirst({ where: { id: messageId, requestId, side: 'partner' } });
  if (!message) throw new HttpError(404, 'Message not found', { reason: 'messageNotFound' });
  return prisma.finPartnerMessage.update({ where: { id: messageId }, data: { closedAt: new Date() } });
}

// Organisation side: the messages of its request, and its answers.
async function ownRequest(prisma, ctx, requestId) {
  const request = await prisma.finPartnerRequest.findFirst({ where: { id: requestId, businessId: ctx.business.id } });
  if (!request) throw new HttpError(404, 'Request not found', { reason: 'requestNotFound' });
  return request;
}

export async function requestMessages(prisma, ctx, requestId) {
  await ownRequest(prisma, ctx, requestId);
  return prisma.finPartnerMessage.findMany({ where: { requestId }, orderBy: { createdAt: 'asc' } });
}

export async function answerMessage(prisma, ctx, requestId, { body, replyToId }) {
  const request = await ownRequest(prisma, ctx, requestId);
  if (['closed', 'withdrawn'].includes(request.status)) throw new HttpError(409, 'This request is closed', { reason: 'requestClosed' });
  if (replyToId && !(await prisma.finPartnerMessage.findFirst({ where: { id: replyToId, requestId, side: 'partner' } }))) throw new HttpError(404, 'Message not found', { reason: 'messageNotFound' });
  return prisma.$transaction(async (tx) => {
    const message = await tx.finPartnerMessage.create({ data: { requestId, side: 'organisation', kind: 'answer', body, replyToId: replyToId ?? null, authorId: ctx.member.userId } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'partner.answered', objectType: 'partnerRequest', objectId: requestId, details: {} });
    return message;
  });
}

// ---- institution: programmes, cohorts, assignments, aggregates (ECR-0289 to 0294) ---------------

/** Aggregates of a cohort: counts always; anything about the learners' activity only above the threshold. */
async function cohortStats(prisma, cohort, threshold) {
  const members = cohort.members.filter((m) => m.status !== 'removed');
  const active = members.filter((m) => m.status === 'active' && m.userId);
  const invited = members.length;
  const formationIds = cohort.formations.map((f) => f.formationId);
  const base = { invites: invited, actifs: active.length, activation: computed('E048', invited ? active.length / invited : null, { inputs: { invites: invited, actifs: active.length } }) };
  if (active.length < threshold || formationIds.length === 0) {
    return { ...base, masque: active.length < threshold, seuil: threshold, completion: computed('E049', null, { inputs: { actifs: active.length } }), impact: computed('E052', null, { inputs: { actifs: active.length } }) };
  }
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: { in: active.map((m) => m.userId) }, formationId: { in: formationIds } },
    include: { certification: { select: { revokedAt: true } }, quizAttempts: { where: { submittedAt: { not: null }, score: { not: null } }, orderBy: { submittedAt: 'asc' }, select: { score: true } } },
  });
  const started = enrollments.length;
  const completed = enrollments.filter((e) => e.completedAt).length;
  const attestations = enrollments.filter((e) => e.certification && !e.certification.revokedAt).length;
  const pairs = enrollments.filter((e) => e.quizAttempts.length >= 2).map((e) => e.quizAttempts[e.quizAttempts.length - 1].score - e.quizAttempts[0].score);
  return {
    ...base,
    masque: false,
    seuil: threshold,
    demarres: started,
    termines: completed,
    attestations,
    completion: computed('E049', started ? completed / started : null, { inputs: { demarres: started, termines: completed } }),
    impact: computed('E052', pairs.length >= threshold ? pairs.reduce((a, b) => a + b, 0) / pairs.length : null, { inputs: { mesures: pairs.length, seuil: threshold } }),
  };
}

export async function institutionView(prisma, user, spaceId) {
  const space = await spaceOf(prisma, user, spaceId, 'institution');
  const programs = await prisma.finPartnerProgram.findMany({
    where: { spaceId },
    orderBy: { startsAt: 'desc' },
    include: { cohorts: { orderBy: { createdAt: 'asc' }, include: { members: { orderBy: { invitedAt: 'asc' } }, formations: { include: { formation: { select: { id: true, title: true, slug: true } } } } } } },
  });
  const used = new Set(programs.flatMap((p) => p.cohorts.flatMap((c) => c.members.filter((m) => m.status === 'active' && m.userId).map((m) => m.userId)))).size;
  const out = [];
  for (const p of programs) {
    const milestones = p.milestones ?? [];
    const done = milestones.filter((m) => m.done).length;
    const cohorts = [];
    for (const c of p.cohorts) {
      cohorts.push({
        id: c.id,
        name: c.name,
        formations: c.formations.map((f) => ({ id: f.formation.id, title: f.formation.title, dueAt: f.dueAt })),
        // The individual list is the institution's own invitations (e-mail and status), never the learner's activity.
        membres: c.members.filter((m) => m.status !== 'removed').map((m) => ({ id: m.id, email: m.email, status: m.status })),
        stats: await cohortStats(prisma, c, space.anonymityThreshold),
      });
    }
    out.push({ ...p, cohorts, avancement: computed('E051', milestones.length ? done / milestones.length : null, { inputs: { jalons: milestones.length, valides: done } }) });
  }
  return {
    espace: { id: space.id, name: space.name, licences: space.licences, seuil: space.anonymityThreshold },
    licences: { disponibles: space.licences, activees: used, utilisation: computed('E050', space.licences ? used / space.licences : null, { inputs: { disponibles: space.licences, activees: used } }) },
    programmes: out,
    // The platform's courses, and the institution's own (lot I bis).
    formations: await prisma.formation.findMany({ where: { status: 'published', OR: [{ ownerSpaceId: null }, { ownerSpaceId: spaceId }] }, select: { id: true, title: true, ownerSpaceId: true }, orderBy: { title: 'asc' } }),
  };
}

async function programOf(prisma, user, spaceId, programId) {
  await spaceOf(prisma, user, spaceId, 'institution');
  const program = await prisma.finPartnerProgram.findFirst({ where: { id: programId, spaceId } });
  if (!program) throw new HttpError(404, 'Programme not found', { reason: 'programNotFound' });
  return program;
}

async function cohortOf(prisma, user, spaceId, cohortId) {
  await spaceOf(prisma, user, spaceId, 'institution');
  const cohort = await prisma.finPartnerCohort.findFirst({ where: { id: cohortId, program: { spaceId } } });
  if (!cohort) throw new HttpError(404, 'Cohort not found', { reason: 'cohortNotFound' });
  return cohort;
}

export async function createProgram(prisma, user, spaceId, body) {
  await spaceOf(prisma, user, spaceId, 'institution');
  return prisma.finPartnerProgram.create({
    data: { spaceId, name: body.name, audience: body.audience ?? null, objective: body.objective ?? null, startsAt: new Date(body.startsAt), endsAt: body.endsAt ? new Date(body.endsAt) : null, budget: body.budget ?? null, currency: body.budget ? (body.currency ?? 'DZD') : null, milestones: (body.milestones ?? []).map((label) => ({ label, done: false })) },
  });
}

export async function updateProgram(prisma, user, spaceId, programId, body) {
  const program = await programOf(prisma, user, spaceId, programId);
  const data = {};
  if (body.addMilestone) data.milestones = [...(program.milestones ?? []), { label: body.addMilestone, done: false }];
  if (body.milestone) data.milestones = (data.milestones ?? program.milestones ?? []).map((m, i) => (i === body.milestone.index ? { ...m, done: body.milestone.done } : m));
  return prisma.finPartnerProgram.update({ where: { id: programId }, data });
}

export async function createCohort(prisma, user, spaceId, programId, { name }) {
  await programOf(prisma, user, spaceId, programId);
  return prisma.finPartnerCohort.create({ data: { programId, name } });
}

export async function assignFormation(prisma, user, spaceId, cohortId, { formationId, dueAt }) {
  await cohortOf(prisma, user, spaceId, cohortId);
  const formation = await prisma.formation.findFirst({ where: { id: formationId, status: 'published', OR: [{ ownerSpaceId: null }, { ownerSpaceId: spaceId }] } });
  if (!formation) throw new HttpError(404, 'Course not found', { reason: 'formationNotFound' });
  return prisma.finPartnerCohortFormation.upsert({ where: { cohortId_formationId: { cohortId, formationId } }, update: { dueAt: dueAt ? new Date(dueAt) : null }, create: { cohortId, formationId, dueAt: dueAt ? new Date(dueAt) : null } });
}

export async function unassignFormation(prisma, user, spaceId, cohortId, formationId) {
  await cohortOf(prisma, user, spaceId, cohortId);
  await prisma.finPartnerCohortFormation.deleteMany({ where: { cohortId, formationId } });
  return { formationId };
}

/** Invites learners by e-mail: they are active only once they accept, in their own account. */
export async function inviteLearners(prisma, user, spaceId, cohortId, { emails }) {
  await cohortOf(prisma, user, spaceId, cohortId);
  const list = [...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))];
  let created = 0;
  for (const email of list) {
    const existing = await prisma.finPartnerCohortMember.findFirst({ where: { cohortId, email } });
    if (existing && existing.status !== 'removed' && existing.status !== 'declined') continue;
    if (existing) await prisma.finPartnerCohortMember.update({ where: { id: existing.id }, data: { status: 'invited', userId: null, consentAt: null, invitedAt: new Date() } });
    else await prisma.finPartnerCohortMember.create({ data: { cohortId, email } });
    created += 1;
  }
  return { invites: created };
}

export async function removeLearner(prisma, user, spaceId, cohortId, memberId) {
  await cohortOf(prisma, user, spaceId, cohortId);
  const member = await prisma.finPartnerCohortMember.findFirst({ where: { id: memberId, cohortId } });
  if (!member) throw new HttpError(404, 'Learner not found', { reason: 'memberNotFound' });
  return prisma.finPartnerCohortMember.update({ where: { id: memberId }, data: { status: 'removed', userId: null } });
}

/** CSV of the aggregates of a space (ECR-0292, 0293): no individual line. */
export async function institutionExport(prisma, user, spaceId) {
  const view = await institutionView(prisma, user, spaceId);
  const ratio = (c) => (c?.resultat === null || c?.resultat === undefined ? '' : (c.resultat * 100).toFixed(1));
  const header = ['programme', 'cohorte', 'invites', 'actifs', 'activation_pct', 'demarres', 'termines', 'completion_pct', 'attestations', 'variation_score'];
  const lines = view.programmes.flatMap((p) =>
    p.cohorts.map((c) => [p.name, c.name, c.stats.invites, c.stats.actifs, ratio(c.stats.activation), c.stats.masque ? '' : (c.stats.demarres ?? ''), c.stats.masque ? '' : (c.stats.termines ?? ''), ratio(c.stats.completion), c.stats.masque ? '' : (c.stats.attestations ?? ''), c.stats.impact?.resultat ?? ''].map((v) => (/[;"\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v)).join(';')),
  );
  return `﻿${[header.join(';'), ...lines].join('\r\n')}\r\n`;
}

// ---- learner side --------------------------------------------------------------------------------

export async function myCohorts(prisma, user) {
  const rows = await prisma.finPartnerCohortMember.findMany({
    where: { OR: [{ userId: user.id }, { email: user.email.toLowerCase(), status: 'invited' }], status: { in: ['invited', 'active'] } },
    include: { cohort: { include: { program: { include: { space: { select: { name: true, active: true } } } }, formations: { include: { formation: { select: { title: true, slug: true } } } } } } },
  });
  return rows
    .filter((r) => r.cohort.program.space.active)
    .map((r) => ({ id: r.id, status: r.status, institution: r.cohort.program.space.name, programme: r.cohort.program.name, cohorte: r.cohort.name, formations: r.cohort.formations.map((f) => ({ title: f.formation.title, slug: f.formation.slug, dueAt: f.dueAt })) }));
}

/** Accepting is the learner's consent, and uses a licence of the institution (0 = no limit). */
export async function answerCohort(prisma, user, memberId, accept) {
  const member = await prisma.finPartnerCohortMember.findFirst({ where: { id: memberId, OR: [{ userId: user.id }, { email: user.email.toLowerCase() }] }, include: { cohort: { include: { program: { include: { space: true } } } } } });
  if (!member || !['invited', 'active'].includes(member.status)) throw new HttpError(404, 'Invitation not found', { reason: 'invitationNotFound' });
  if (!accept) return prisma.finPartnerCohortMember.update({ where: { id: memberId }, data: { status: 'declined', userId: null, consentAt: null } });
  const space = member.cohort.program.space;
  if (space.licences > 0 && member.status !== 'active') {
    const used = await prisma.finPartnerCohortMember.findMany({ where: { status: 'active', userId: { not: null }, cohort: { program: { spaceId: space.id } } }, select: { userId: true }, distinct: ['userId'] });
    if (!used.some((u) => u.userId === user.id) && used.length >= space.licences) throw new HttpError(409, 'No licence left', { reason: 'noLicenceLeft' });
  }
  return prisma.finPartnerCohortMember.update({ where: { id: memberId }, data: { status: 'active', userId: user.id, consentAt: new Date() } });
}

// ---- crowdfunding platform (DRT-010) and the regulatory report (ECR-0307) ------------------------

export async function cipReports(prisma, user, spaceId) {
  await spaceOf(prisma, user, spaceId, 'cip');
  return prisma.finBusinessCampaignReport.findMany({
    where: { status: 'validated', campaign: { platformSpaceId: spaceId } },
    orderBy: { validatedAt: 'desc' },
    include: { campaign: { select: { name: true, business: { select: { name: true, tradeName: true } } } } },
  });
}

export const listPlatforms = (prisma) => prisma.finPartnerSpace.findMany({ where: { kind: 'cip', active: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } });

async function ownCampaign(prisma, ctx, id) {
  const campaign = await prisma.finBusinessCampaign.findFirst({ where: { id, businessId: ctx.business.id }, include: { commitments: true } });
  if (!campaign) throw new HttpError(404, 'Campaign not found', { reason: 'campaignNotFound' });
  return campaign;
}

export async function linkPlatform(prisma, ctx, id, { spaceId }) {
  await ownCampaign(prisma, ctx, id);
  if (spaceId && !(await prisma.finPartnerSpace.findFirst({ where: { id: spaceId, kind: 'cip', active: true } }))) throw new HttpError(404, 'Platform not found', { reason: 'spaceNotFound' });
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finBusinessCampaign.update({ where: { id }, data: { platformSpaceId: spaceId ?? null } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'campaign.platformLinked', objectType: 'campaign', objectId: id, details: { linked: Boolean(spaceId) } });
    return updated;
  });
}

/** The preparatory report of a period: operations, checks and the campaign's state, in our default form. */
export function reportContent(campaign, from, to) {
  const inPeriod = (d) => d && new Date(d) >= from && new Date(d) <= to;
  const sum = (list) => list.reduce((s, c) => s + c.amount, 0);
  const declared = campaign.commitments.filter((c) => inPeriod(c.declaredAt));
  const confirmed = campaign.commitments.filter((c) => inPeriod(c.confirmedAt));
  const cancelled = campaign.commitments.filter((c) => inPeriod(c.cancelledAt));
  const view = campaignView(campaign);
  return {
    campagne: { nom: campaign.name, instrument: campaign.instrument, objectif: campaign.target, devise: campaign.currency, statut: campaign.status, debut: campaign.startsAt, fin: campaign.endsAt },
    plateforme: { nom: campaign.platformName, agrement: campaign.platformAuthorization, verifieeLe: campaign.platformCheckedAt },
    periode: { du: from.toISOString().slice(0, 10), au: to.toISOString().slice(0, 10) },
    operations: {
      declares: { nombre: declared.length, montant: sum(declared) },
      confirmes: { nombre: confirmed.length, montant: sum(confirmed) },
      annules: { nombre: cancelled.length, montant: sum(cancelled) },
    },
    cumul: { declare: view.declare, confirme: view.confirme, reste: view.reste.resultat, partFinancee: view.finance.resultat, dilution: view.dilution },
    controles: (campaign.checklist ?? []).map((c) => ({ cle: c.key, fait: c.done })),
    risques: campaign.risks ?? null,
  };
}

export async function listReports(prisma, ctx, campaignId) {
  await ownCampaign(prisma, ctx, campaignId);
  const reports = await prisma.finBusinessCampaignReport.findMany({ where: { campaignId }, orderBy: { createdAt: 'desc' } });
  return reports.map((r) => ({ ...r, peutValider: r.status === 'draft' && r.createdById !== ctx.member.userId }));
}

export async function prepareReport(prisma, ctx, campaignId, { from, to }) {
  const campaign = await ownCampaign(prisma, ctx, campaignId);
  const start = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T23:59:59.999Z`);
  if (end < start) throw new HttpError(422, 'The end follows the start', { reason: 'datesOutOfOrder' });
  return prisma.$transaction(async (tx) => {
    const report = await tx.finBusinessCampaignReport.create({ data: { campaignId, periodFrom: start, periodTo: end, content: reportContent(campaign, start, end), createdById: ctx.member.userId } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'campaign.reportPrepared', objectType: 'campaign', objectId: campaignId, details: { from, to } });
    return report;
  });
}

export async function validateReport(prisma, ctx, campaignId, reportId) {
  await ownCampaign(prisma, ctx, campaignId);
  const report = await prisma.finBusinessCampaignReport.findFirst({ where: { id: reportId, campaignId } });
  if (!report) throw new HttpError(404, 'Report not found', { reason: 'reportNotFound' });
  if (report.status !== 'draft') throw new HttpError(409, 'Already validated', { reason: 'invalidTransition' });
  if (report.createdById === ctx.member.userId) throw new HttpError(409, 'Another person validates', { reason: 'secondPersonRequired' });
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finBusinessCampaignReport.update({ where: { id: reportId }, data: { status: 'validated', validatedById: ctx.member.userId, validatedAt: new Date() } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'campaign.reportValidated', objectType: 'campaign', objectId: campaignId, details: {} });
    return updated;
  });
}

/** CSV of one report: one line per indicator. Read by the organisation, or by its platform once validated. */
export function reportCsv(report) {
  const c = report.content;
  const money = (v) => (v === null || v === undefined ? '' : (v / 100).toFixed(2));
  const rows = [
    ['periode', `${c.periode.du} - ${c.periode.au}`],
    ['campagne', c.campagne.nom],
    ['instrument', c.campagne.instrument],
    ['objectif', money(c.campagne.objectif)],
    ['devise', c.campagne.devise],
    ['statut', c.campagne.statut],
    ['plateforme', c.plateforme.nom ?? ''],
    ['agrement', c.plateforme.agrement ?? ''],
    ['engagements_declares_nombre', c.operations.declares.nombre],
    ['engagements_declares_montant', money(c.operations.declares.montant)],
    ['engagements_confirmes_nombre', c.operations.confirmes.nombre],
    ['engagements_confirmes_montant', money(c.operations.confirmes.montant)],
    ['engagements_annules_nombre', c.operations.annules.nombre],
    ['engagements_annules_montant', money(c.operations.annules.montant)],
    ['cumul_declare', money(c.cumul.declare)],
    ['cumul_confirme', money(c.cumul.confirme)],
    ['reste_a_collecter', money(c.cumul.reste)],
    ['controles_faits', `${c.controles.filter((x) => x.fait).length}/${c.controles.length}`],
    ['statut_rapport', report.status],
  ];
  return `﻿${['indicateur;valeur', ...rows.map(([k, v]) => `${k};${/[;"\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v}`)].join('\r\n')}\r\n`;
}

export async function ownReportCsv(prisma, ctx, campaignId, reportId) {
  await ownCampaign(prisma, ctx, campaignId);
  const report = await prisma.finBusinessCampaignReport.findFirst({ where: { id: reportId, campaignId } });
  if (!report) throw new HttpError(404, 'Report not found', { reason: 'reportNotFound' });
  return reportCsv(report);
}

export async function cipReportCsv(prisma, user, spaceId, reportId) {
  await spaceOf(prisma, user, spaceId, 'cip');
  const report = await prisma.finBusinessCampaignReport.findFirst({ where: { id: reportId, status: 'validated', campaign: { platformSpaceId: spaceId } } });
  if (!report) throw new HttpError(404, 'Report not found', { reason: 'reportNotFound' });
  return reportCsv(report);
}
