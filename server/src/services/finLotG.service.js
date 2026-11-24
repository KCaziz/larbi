import { HttpError } from '../utils/httpError.js';
import { computed } from './finance/contract.js';
import { checkVersion, journal } from './finOrganization.service.js';

/**
 * P13-05, lot G (2026-11-24) — the modules that need no regulatory value:
 * partners, human resources without payroll, crowdfunding preparation. (The
 * forum, which belongs to people rather than to an organisation, has its own
 * service: forum.service.js.)
 */

// ---- partners (ECR-0159, 0160, 0161, 0288) ---------------------------------------

export const PARTNER_TYPES = ['accountant', 'bank', 'leasing', 'insurance', 'microfinance', 'crowdfunding', 'support', 'training', 'institution', 'other'];
export const PARTNER_REQUEST_STATUSES = ['sent', 'received', 'in_review', 'answered', 'closed', 'withdrawn'];
// What a request may carry from the organisation: chosen one by one, with consent.
export const SHAREABLE_ITEMS = ['profile', 'dashboard', 'receivables', 'cashPlan', 'documents', 'projects'];

const liveOffer = (now = new Date()) => ({ active: true, OR: [{ validUntil: null }, { validUntil: { gte: now } }] });

/** Offers compatible with a type, a wilaya, a public — indicative, never a recommendation. */
export async function searchOffers(prisma, { type, wilaya, publicKey } = {}) {
  const offers = await prisma.finPartnerOffer.findMany({ where: { ...liveOffer(), ...(type ? { partnerType: type } : {}) }, orderBy: [{ partnerType: 'asc' }, { partnerName: 'asc' }] });
  // An empty list means « everywhere » / « every public ».
  return offers.filter((o) => (!wilaya || o.wilayas.length === 0 || o.wilayas.includes(wilaya)) && (!publicKey || o.publics.length === 0 || o.publics.includes(publicKey)));
}

export async function listRequests(prisma, ctx) {
  return prisma.finPartnerRequest.findMany({ where: { businessId: ctx.business.id }, orderBy: { createdAt: 'desc' }, include: { offer: { select: { id: true, partnerName: true, title: true, partnerType: true } } } });
}

/** A request is sent only with the person's explicit consent to what it shares. */
export async function createRequest(prisma, ctx, body) {
  if (body.consent !== true) throw new HttpError(422, 'A request is sent only with consent', { reason: 'consentRequired' });
  const offer = await prisma.finPartnerOffer.findFirst({ where: { id: body.offerId, ...liveOffer() } });
  if (!offer) throw new HttpError(404, 'Offer not found', { reason: 'offerNotFound' });
  const now = new Date();
  return prisma.$transaction(async (tx) => {
    const request = await tx.finPartnerRequest.create({
      data: {
        businessId: ctx.business.id,
        offerId: offer.id,
        motive: body.motive,
        amount: body.amount ?? null,
        currency: body.amount ? ctx.business.currency : null,
        message: body.message ?? null,
        sharedItems: body.sharedItems ?? [],
        consentAt: now,
        status: 'sent',
        history: [{ at: now.toISOString(), status: 'sent', by: 'organisation' }],
        createdById: ctx.member.userId,
      },
    });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'partner.requested', objectType: 'partnerRequest', objectId: request.id, details: { partner: offer.partnerName, shared: body.sharedItems ?? [] } });
    return request;
  });
}

export async function withdrawRequest(prisma, ctx, id) {
  const request = await prisma.finPartnerRequest.findFirst({ where: { id, businessId: ctx.business.id } });
  if (!request) throw new HttpError(404, 'Request not found', { reason: 'requestNotFound' });
  if (['closed', 'withdrawn'].includes(request.status)) throw new HttpError(409, 'This request is closed', { reason: 'requestClosed' });
  const history = [...request.history, { at: new Date().toISOString(), status: 'withdrawn', by: 'organisation' }];
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finPartnerRequest.update({ where: { id }, data: { status: 'withdrawn', history } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'partner.withdrawn', objectType: 'partnerRequest', objectId: id, details: {} });
    return updated;
  });
}

// Administration side: the offers, and the follow-up of requests.
export const adminListOffers = (prisma) => prisma.finPartnerOffer.findMany({ orderBy: { createdAt: 'desc' }, include: { _count: { select: { requests: true } } } });
export const adminCreateOffer = (prisma, body) => prisma.finPartnerOffer.create({ data: { ...body, wilayas: body.wilayas ?? [], publics: body.publics ?? [] } });
export async function adminUpdateOffer(prisma, id, body) {
  const offer = await prisma.finPartnerOffer.findUnique({ where: { id } });
  if (!offer) throw new HttpError(404, 'Offer not found', { reason: 'offerNotFound' });
  return prisma.finPartnerOffer.update({ where: { id }, data: body });
}
export const adminListRequests = (prisma) =>
  prisma.finPartnerRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 300, include: { offer: { select: { partnerName: true, title: true } }, business: { select: { name: true, publicKey: true, wilaya: true } } } });
export async function adminUpdateRequest(prisma, id, { status, note }, adminId) {
  const request = await prisma.finPartnerRequest.findUnique({ where: { id } });
  if (!request) throw new HttpError(404, 'Request not found', { reason: 'requestNotFound' });
  if (request.status === 'withdrawn') throw new HttpError(409, 'Withdrawn by the organisation', { reason: 'requestClosed' });
  const history = [...request.history, { at: new Date().toISOString(), status, by: 'administration', note: note ?? null, adminId }];
  return prisma.finPartnerRequest.update({ where: { id }, data: { status, history } });
}

// ---- human resources, without payroll (ECR-0272, 0273, 0278) ----------------------------

export const CONTRACTS = ['cdi', 'cdd', 'stage', 'apprenti', 'interim', 'autre'];
export const ABSENCE_KINDS = ['conge', 'maladie', 'formation', 'sans_solde', 'autre'];
const DAY = 86400000;

/**
 * Leave balance of the year (ECR-0273): rights acquired so far this year
 * (prorated from January or from the start date) + carry-over − approved
 * leave days taken this year.
 */
export function leaveBalance(employee, absences, now = new Date()) {
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const yearEnd = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1));
  const from = new Date(employee.startedAt) > yearStart ? new Date(employee.startedAt) : yearStart;
  const until = employee.endedAt && new Date(employee.endedAt) < now ? new Date(employee.endedAt) : now;
  const share = Math.max(0, Math.min(1, (until - from) / (yearEnd - yearStart)));
  const acquired = Math.round(employee.leaveRightsPerYear * share * 10) / 10;
  const taken = absences.filter((a) => a.kind === 'conge' && a.status === 'approved' && new Date(a.startsAt) >= yearStart).reduce((sum, a) => sum + a.days, 0);
  return { acquired, carryOver: employee.leaveCarryOver, taken, balance: Math.round((acquired + employee.leaveCarryOver - taken) * 10) / 10 };
}

/** The HR indicators of a period (ECR-0278): headcount, turnover, absenteeism. */
export function hrIndicators(employees, absences, { from, to, now = new Date() }) {
  const start = from ? new Date(from) : new Date(now.getTime() - 365 * DAY);
  const end = to ? new Date(to) : now;
  const activeAt = (date) => employees.filter((e) => new Date(e.startedAt) <= date && (!e.endedAt || new Date(e.endedAt) > date)).length;
  const headStart = activeAt(start);
  const headEnd = activeAt(end);
  const average = (headStart + headEnd) / 2;
  const exits = employees.filter((e) => e.endedAt && new Date(e.endedAt) > start && new Date(e.endedAt) <= end).length;
  const entries = employees.filter((e) => new Date(e.startedAt) > start && new Date(e.startedAt) <= end).length;
  const workingDays = (Math.max(0, end - start) / DAY) * (5 / 7) * average;
  const absent = absences
    .filter((a) => a.status === 'approved' && !['conge', 'formation'].includes(a.kind) && new Date(a.startsAt) >= start && new Date(a.startsAt) <= end)
    .reduce((sum, a) => sum + a.days, 0);
  const inputs = { debut: start.toISOString(), fin: end.toISOString(), effectif_debut: headStart, effectif_fin: headEnd };
  return {
    effectif: computed('E036', employees.length === 0 ? null : headEnd, { inputs, now }),
    rotation: computed('E037', average > 0 ? exits / average : null, { inputs: { ...inputs, departs: exits }, now }),
    absenteisme: computed('E038', workingDays > 0 ? absent / workingDays : null, { inputs: { ...inputs, jours_absence: absent }, now }),
    entrees: entries,
    sorties: exits,
  };
}

export async function listEmployees(prisma, ctx, query = {}) {
  const employees = await prisma.finBusinessEmployee.findMany({ where: { businessId: ctx.business.id }, orderBy: [{ endedAt: 'asc' }, { fullName: 'asc' }], include: { absences: { orderBy: { startsAt: 'desc' } } } });
  const me = ctx.member.userId;
  return {
    salaries: employees.map((e) => ({
      ...e,
      // DRT-005: the salary is an amount; only those who read payroll see it.
      baseSalary: ctx.permissions.includes('payroll.read') ? e.baseSalary : undefined,
      conges: leaveBalance(e, e.absences),
      absences: e.absences.map((a) => ({ ...a, peutDecider: a.status === 'requested' && a.createdById !== me && ctx.permissions.includes('hr.manage') })),
    })),
    indicateurs: hrIndicators(employees, employees.flatMap((e) => e.absences), query),
  };
}

export async function createEmployee(prisma, ctx, body) {
  if (body.baseSalary !== undefined && !ctx.permissions.includes('payroll.manage')) throw new HttpError(403, 'The salary belongs to payroll', { reason: 'roleForbidden' });
  return prisma.$transaction(async (tx) => {
    const employee = await tx.finBusinessEmployee.create({ data: { businessId: ctx.business.id, ...body } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'employee.created', objectType: 'employee', objectId: employee.id, details: {} });
    return employee;
  });
}

async function findEmployee(prisma, ctx, id) {
  const employee = await prisma.finBusinessEmployee.findFirst({ where: { id, businessId: ctx.business.id } });
  if (!employee) throw new HttpError(404, 'Employee not found', { reason: 'employeeNotFound' });
  return employee;
}

export async function updateEmployee(prisma, ctx, id, body, ifMatch) {
  const employee = await findEmployee(prisma, ctx, id);
  checkVersion(employee, ifMatch);
  if (body.baseSalary !== undefined && !ctx.permissions.includes('payroll.manage')) throw new HttpError(403, 'The salary belongs to payroll', { reason: 'roleForbidden' });
  if (body.endedAt && new Date(body.endedAt) < new Date(body.startedAt ?? employee.startedAt)) throw new HttpError(422, 'An exit follows the entry', { reason: 'datesOutOfOrder' });
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finBusinessEmployee.update({ where: { id }, data: { ...body, version: { increment: 1 } } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: body.endedAt ? 'employee.left' : 'employee.updated', objectType: 'employee', objectId: id, details: { fields: Object.keys(body) } });
    return updated;
  });
}

export async function createAbsence(prisma, ctx, employeeId, body) {
  const employee = await findEmployee(prisma, ctx, employeeId);
  if (new Date(body.endsAt) < new Date(body.startsAt)) throw new HttpError(422, 'The end follows the start', { reason: 'datesOutOfOrder' });
  if (new Date(body.startsAt) < new Date(employee.startedAt) || (employee.endedAt && new Date(body.startsAt) > new Date(employee.endedAt))) {
    throw new HttpError(422, 'Outside the contract', { reason: 'outsideContract' });
  }
  return prisma.$transaction(async (tx) => {
    const absence = await tx.finBusinessAbsence.create({ data: { employeeId, ...body, createdById: ctx.member.userId } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'absence.requested', objectType: 'employee', objectId: employeeId, details: { kind: body.kind, days: body.days } });
    return absence;
  });
}

/** approuver / refuser by another person than the one who entered it; annuler by anyone who manages HR. */
export async function decideAbsence(prisma, ctx, employeeId, absenceId, step) {
  await findEmployee(prisma, ctx, employeeId);
  const absence = await prisma.finBusinessAbsence.findFirst({ where: { id: absenceId, employeeId } });
  if (!absence) throw new HttpError(404, 'Absence not found', { reason: 'absenceNotFound' });
  const to = { approuver: 'approved', refuser: 'refused', annuler: 'cancelled' }[step];
  const from = step === 'annuler' ? ['requested', 'approved'] : ['requested'];
  if (!from.includes(absence.status)) throw new HttpError(409, 'This step does not apply now', { reason: 'invalidTransition', state: absence.status });
  if (step !== 'annuler' && absence.createdById === ctx.member.userId) throw new HttpError(409, 'Another person decides', { reason: 'secondPersonRequired' });
  const data = step === 'annuler' ? { status: to } : { status: to, decidedById: ctx.member.userId, decidedAt: new Date() };
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.finBusinessAbsence.updateMany({ where: { id: absenceId, status: absence.status }, data });
    if (count === 0) throw new HttpError(409, 'Changed since you read it', { reason: 'stateChanged' });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: `absence.${to}`, objectType: 'employee', objectId: employeeId, details: {} });
    return tx.finBusinessAbsence.findUnique({ where: { id: absenceId } });
  });
}

// ---- crowdfunding, preparation only (ECR-0301 to 0306) -------------------------------------

export const CAMPAIGN_INSTRUMENTS = ['don', 'pret', 'capital', 'recompense'];
export const CAMPAIGN_STATUSES = ['preparing', 'open', 'closed', 'cancelled'];
// The diligence checklist (ECR-0304): our list, from the client's screen.
export const CAMPAIGN_CHECKS = ['business_plan', 'financials', 'legal_docs', 'use_of_funds', 'risk_disclosure', 'platform_contract', 'investor_information'];

export function campaignView(campaign, now = new Date()) {
  const live = campaign.commitments.filter((c) => !c.cancelledAt);
  const declared = live.reduce((sum, c) => sum + c.amount, 0);
  const confirmed = live.filter((c) => c.confirmedAt).reduce((sum, c) => sum + c.amount, 0);
  const checks = campaign.checklist ?? [];
  const done = checks.filter((c) => c.done).length;
  const currency = campaign.currency;
  const inputs = { devise: currency, objectif: campaign.target, engagements: live.length };
  return {
    declare: declared,
    confirme: confirmed,
    reste: computed('E039', campaign.target - declared, { inputs, currency, now }),
    finance: computed('E040', confirmed / campaign.target, { inputs, currency, now }),
    // ECR-0302: post-money = pre-money + funds; dilution = funds / post-money, at the target.
    dilution: campaign.instrument === 'capital' && campaign.preMoney !== null ? campaign.target / (campaign.preMoney + campaign.target) : null,
    controles: { faits: done, attendus: checks.length, complet: checks.length > 0 && done === checks.length },
    plateformeVerifiee: Boolean(campaign.platformCheckedAt && campaign.platformAuthorization),
  };
}

export async function listCampaigns(prisma, ctx) {
  const campaigns = await prisma.finBusinessCampaign.findMany({ where: { businessId: ctx.business.id }, orderBy: { createdAt: 'desc' }, include: { commitments: { orderBy: { declaredAt: 'desc' } } } });
  return campaigns.map((c) => ({ ...c, calcul: campaignView(c) }));
}

async function findCampaign(prisma, ctx, id) {
  const campaign = await prisma.finBusinessCampaign.findFirst({ where: { id, businessId: ctx.business.id } });
  if (!campaign) throw new HttpError(404, 'Campaign not found', { reason: 'campaignNotFound' });
  return campaign;
}

export async function createCampaign(prisma, ctx, body) {
  return prisma.$transaction(async (tx) => {
    const campaign = await tx.finBusinessCampaign.create({
      data: { businessId: ctx.business.id, ...body, checklist: CAMPAIGN_CHECKS.map((key) => ({ key, done: false })) },
    });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'campaign.created', objectType: 'campaign', objectId: campaign.id, details: { name: campaign.name } });
    return campaign;
  });
}

/**
 * Update a campaign. Marking the platform as checked records WHEN a person
 * checked its authorisation (ECR-0303): without that reference, the platform
 * stays « not confirmed ». A campaign does not open before its checks are done.
 */
export async function updateCampaign(prisma, ctx, id, body, ifMatch) {
  const campaign = await findCampaign(prisma, ctx, id);
  checkVersion(campaign, ifMatch);
  const { platformChecked, check, ...rest } = body;
  const data = { ...rest };
  if (platformChecked !== undefined) {
    if (platformChecked && !(rest.platformAuthorization ?? campaign.platformAuthorization)) throw new HttpError(422, 'Enter the authorisation checked', { reason: 'authorizationRequired' });
    data.platformCheckedAt = platformChecked ? new Date() : null;
  }
  if (check) data.checklist = campaign.checklist.map((c) => (c.key === check.key ? { ...c, done: check.done } : c));
  const checklist = data.checklist ?? campaign.checklist;
  if (rest.status === 'open' && (!checklist.every((c) => c.done) || !(data.platformCheckedAt ?? campaign.platformCheckedAt))) {
    throw new HttpError(409, 'Checks and platform first', { reason: 'campaignNotReady' });
  }
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finBusinessCampaign.update({ where: { id }, data: { ...data, version: { increment: 1 } } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'campaign.updated', objectType: 'campaign', objectId: id, details: { fields: Object.keys(body) } });
    return updated;
  });
}

export async function addCommitment(prisma, ctx, id, body) {
  const campaign = await findCampaign(prisma, ctx, id);
  if (['closed', 'cancelled'].includes(campaign.status)) throw new HttpError(409, 'This campaign is closed', { reason: 'campaignClosed' });
  return prisma.$transaction(async (tx) => {
    const commitment = await tx.finBusinessCampaignCommitment.create({ data: { campaignId: id, amount: body.amount, declaredAt: body.declaredAt, source: body.source } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'campaign.commitment', objectType: 'campaign', objectId: id, details: {} });
    return commitment;
  });
}

export async function moveCommitment(prisma, ctx, id, commitmentId, step) {
  await findCampaign(prisma, ctx, id);
  const commitment = await prisma.finBusinessCampaignCommitment.findFirst({ where: { id: commitmentId, campaignId: id } });
  if (!commitment) throw new HttpError(404, 'Commitment not found', { reason: 'commitmentNotFound' });
  if (commitment.cancelledAt || (step === 'confirmer' && commitment.confirmedAt)) throw new HttpError(409, 'This step does not apply now', { reason: 'invalidTransition' });
  const data = step === 'confirmer' ? { confirmedAt: new Date() } : { cancelledAt: new Date() };
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finBusinessCampaignCommitment.update({ where: { id: commitmentId }, data });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: step === 'confirmer' ? 'campaign.confirmed' : 'campaign.cancelled', objectType: 'campaign', objectId: id, details: {} });
    return updated;
  });
}
