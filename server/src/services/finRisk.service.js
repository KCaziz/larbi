import { HttpError } from '../utils/httpError.js';
import { computed } from './finance/contract.js';
import { checkVersion, journal } from './finOrganization.service.js';

/**
 * P13-05, lot D bis (2026-11-25).
 *
 * 1. The register of the risks of international trade (ECR-0370, 02_ECRANS):
 *    country, counterparty, transport; probability and impact on a versioned
 *    scale, level = probability × impact; a guarantee and its documented amount;
 *    the measures with who carries them; a review date. A rating without proof
 *    is a PROVISIONAL index (ETAT-02968, NOT-01239). Coverage by the guarantee
 *    = guaranteed amount / exposure (CAL-0728).
 *
 * 2. The exchange effect on a diaspora project (ECR-0378): the counter-value of
 *    an amount at a reference rate and at scenario rates, and the impact
 *    amount × (scenario rate − reference rate) (CAL-0734). A simulation changes
 *    nothing; a scenario can be kept. No conversion without a dated rate.
 */

export const RISK_SCALE = {
  version: 1,
  probability: [1, 2, 3, 4, 5],
  impact: [1, 2, 3, 4, 5],
  // level = probability × impact (1..25)
  bands: [
    { key: 'low', max: 4 },
    { key: 'moderate', max: 9 },
    { key: 'high', max: 16 },
    { key: 'critical', max: 25 },
  ],
};
export const RISK_CATEGORIES = ['country', 'counterparty', 'transport', 'payment', 'currency', 'other'];
export const bandOf = (level) => RISK_SCALE.bands.find((b) => level <= b.max).key;

const include = { actions: { orderBy: { createdAt: 'asc' } }, reviews: { orderBy: { reviewedAt: 'desc' }, take: 20 } };

function riskView(risk, now = new Date()) {
  const level = risk.probability * risk.impact;
  const coverage =
    risk.exposure && risk.exposure > 0 && risk.guaranteedAmount !== null && risk.guaranteedAmount !== undefined ? risk.guaranteedAmount / risk.exposure : null;
  return {
    ...risk,
    niveau: level,
    bande: bandOf(level),
    // ETAT-02968: a rating without proof is a provisional index.
    provisoire: !risk.evidenceRef,
    revueEnRetard: risk.status === 'open' && Boolean(risk.reviewAt) && new Date(risk.reviewAt) < now,
    actionsOuvertes: risk.actions.filter((a) => !a.doneAt).length,
    couverture: computed('E060', coverage, { inputs: { exposition: risk.exposure ?? null, montant_garanti: risk.guaranteedAmount ?? null }, now }),
  };
}

export async function listRisks(prisma, ctx) {
  const risks = await prisma.finBusinessRisk.findMany({ where: { businessId: ctx.business.id }, include, orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }] });
  const views = risks.map((r) => riskView(r));
  const open = views.filter((r) => r.status === 'open');
  return {
    echelle: RISK_SCALE,
    risques: views,
    synthese: {
      ouverts: open.length,
      critiques: open.filter((r) => r.bande === 'critical').length,
      eleves: open.filter((r) => r.bande === 'high').length,
      provisoires: open.filter((r) => r.provisoire).length,
      revuesEnRetard: open.filter((r) => r.revueEnRetard).length,
    },
  };
}

async function findRisk(prisma, ctx, id) {
  const risk = await prisma.finBusinessRisk.findFirst({ where: { id, businessId: ctx.business.id }, include });
  if (!risk) throw new HttpError(404, 'Risk not found', { reason: 'riskNotFound' });
  return risk;
}

async function assertOperation(prisma, ctx, operationId) {
  if (!operationId) return;
  const op = await prisma.finBusinessOperation.findFirst({ where: { id: operationId, businessId: ctx.business.id } });
  if (!op) throw new HttpError(404, 'Operation not found', { reason: 'operationNotFound' });
}

function assertAmounts(body) {
  if (body.guaranteedAmount !== undefined && body.guaranteedAmount !== null && (body.exposure === undefined || body.exposure === null)) {
    throw new HttpError(422, 'A guaranteed amount needs the exposure it covers', { reason: 'exposureRequired' });
  }
  if ((body.exposure ?? null) !== null && !body.currency) throw new HttpError(422, 'An exposure needs its currency', { reason: 'currencyRequired' });
}

export async function createRisk(prisma, ctx, body) {
  await assertOperation(prisma, ctx, body.operationId);
  assertAmounts(body);
  return prisma.$transaction(async (tx) => {
    const risk = await tx.finBusinessRisk.create({
      data: {
        businessId: ctx.business.id,
        operationId: body.operationId ?? null,
        category: body.category,
        country: body.country ?? null,
        counterparty: body.counterparty,
        description: body.description ?? null,
        probability: body.probability,
        impact: body.impact,
        exposure: body.exposure ?? null,
        guaranteedAmount: body.guaranteedAmount ?? null,
        currency: body.currency ?? null,
        guarantee: body.guarantee ?? null,
        evidenceRef: body.evidenceRef ?? null,
        reviewAt: body.reviewAt,
        scaleVersion: RISK_SCALE.version,
        createdById: ctx.member.userId,
        reviews: { create: { probability: body.probability, impact: body.impact, level: body.probability * body.impact, note: 'Cotation initiale', evidenceRef: body.evidenceRef ?? null, reviewedById: ctx.member.userId } },
      },
      include,
    });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'risk.created', objectType: 'risk', objectId: risk.id, details: { level: risk.probability * risk.impact } });
    return riskView(risk);
  });
}

/** Réévaluer (ACT-01445): a new rating, kept in the history; or the risk closed. */
export async function reassessRisk(prisma, ctx, id, body, ifMatch) {
  const risk = await findRisk(prisma, ctx, id);
  checkVersion(risk, ifMatch);
  const next = { ...risk, ...body };
  assertAmounts(next);
  return prisma.$transaction(async (tx) => {
    const changed = await tx.finBusinessRisk.updateMany({
      where: { id, version: risk.version },
      data: {
        probability: next.probability,
        impact: next.impact,
        exposure: next.exposure ?? null,
        guaranteedAmount: next.guaranteedAmount ?? null,
        currency: next.currency ?? null,
        guarantee: next.guarantee ?? null,
        evidenceRef: next.evidenceRef ?? null,
        reviewAt: next.reviewAt,
        status: body.close ? 'closed' : risk.status,
        version: { increment: 1 },
      },
    });
    if (changed.count === 0) throw new HttpError(409, 'This risk was changed meanwhile', { reason: 'stateChanged' });
    await tx.finBusinessRiskReview.create({
      data: { riskId: id, probability: next.probability, impact: next.impact, level: next.probability * next.impact, note: body.note ?? (body.close ? 'Risque clos' : null), evidenceRef: next.evidenceRef ?? null, reviewedById: ctx.member.userId },
    });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: body.close ? 'risk.closed' : 'risk.reassessed', objectType: 'risk', objectId: id, details: { level: next.probability * next.impact } });
    return riskView(await tx.finBusinessRisk.findUnique({ where: { id }, include }));
  });
}

/** Associer action (ACT-01444): a measure, who carries it, by when. */
export async function addRiskAction(prisma, ctx, id, body) {
  const risk = await findRisk(prisma, ctx, id);
  if (risk.status !== 'open') throw new HttpError(409, 'This risk is closed', { reason: 'riskClosed' });
  return prisma.$transaction(async (tx) => {
    const action = await tx.finBusinessRiskAction.create({ data: { riskId: id, label: body.label, ownerName: body.ownerName, dueAt: body.dueAt ?? null } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'risk.action.added', objectType: 'risk', objectId: id, details: { action: action.id } });
    return riskView(await tx.finBusinessRisk.findUnique({ where: { id }, include }));
  });
}

export async function completeRiskAction(prisma, ctx, id, actionId) {
  await findRisk(prisma, ctx, id);
  const action = await prisma.finBusinessRiskAction.findFirst({ where: { id: actionId, riskId: id } });
  if (!action) throw new HttpError(404, 'Action not found', { reason: 'actionNotFound' });
  if (action.doneAt) throw new HttpError(409, 'This action is already done', { reason: 'stateChanged' });
  return prisma.$transaction(async (tx) => {
    await tx.finBusinessRiskAction.update({ where: { id: actionId }, data: { doneAt: new Date() } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'risk.action.done', objectType: 'risk', objectId: id, details: { action: actionId } });
    return riskView(await tx.finBusinessRisk.findUnique({ where: { id }, include }));
  });
}

// ---- ECR-0378 : exchange effect on a project --------------------------------------------

const VARIATIONS = [-0.1, -0.05, 0.05, 0.1];

/**
 * Pure. `amount` in `from` (minor units), rates as « 1 from = rate to ».
 * Without the reference rate and its date, nothing is computed (ETAT-03024).
 */
export function fxProjection({ amount, from, to, referenceRate, referenceDate, rates = [], variations = false, remaining = null }, now = new Date()) {
  if (!referenceRate || !referenceDate) throw new HttpError(422, 'A conversion needs a dated rate', { reason: 'rateRequired' });
  const at = (rate) => Math.round(amount * rate);
  const reference = at(referenceRate);
  const scenarioRates = [...rates.map((r) => ({ rate: r, source: 'saisi' })), ...(variations ? VARIATIONS.map((v) => ({ rate: Number((referenceRate * (1 + v)).toFixed(6)), source: 'variation', variation: v })) : [])];
  const scenarios = scenarioRates.map((s) => ({
    ...s,
    contreValeur: computed('E062', at(s.rate), { inputs: { montant: amount, cours: s.rate }, currency: to, now }),
    // CAL-0734: montant devise × (cours scénario − cours de référence).
    impact: computed('E061', Math.round(amount * (s.rate - referenceRate)), { inputs: { montant: amount, cours_scenario: s.rate, cours_reference: referenceRate }, currency: to, now }),
    // What `from` it would take to cover what the project still needs, at this rate.
    pourCouvrir: remaining === null ? null : Math.ceil(remaining / s.rate),
  }));
  const values = scenarios.map((s) => s.contreValeur.resultat);
  return {
    montant: amount,
    de: from,
    vers: to,
    coursReference: referenceRate,
    dateCours: referenceDate,
    contreValeurReference: computed('E062', reference, { inputs: { montant: amount, cours: referenceRate }, currency: to, now }),
    resteAFinancer: remaining,
    pourCouvrirReference: remaining === null ? null : Math.ceil(remaining / referenceRate),
    scenarios,
    fourchette: values.length ? { min: Math.min(reference, ...values), max: Math.max(reference, ...values) } : null,
  };
}

async function projectFor(prisma, ctx, projectId) {
  const project = await prisma.finBusinessProject.findFirst({ where: { id: projectId, businessId: ctx.business.id } });
  if (!project) throw new HttpError(404, 'Project not found', { reason: 'projectNotFound' });
  if (ctx.permissions.includes('project.manage')) return { project, access: 'manage' };
  const now = new Date();
  const share = await prisma.finBusinessProjectShare.findFirst({ where: { projectId, memberId: ctx.member.id, revokedAt: null, OR: [{ endsAt: null }, { endsAt: { gt: now } }] } });
  if (!share) throw new HttpError(404, 'Project not found', { reason: 'projectNotFound' });
  return { project, access: share.access };
}

/** Comparer scénarios (ACT-01524): computed, isolated, nothing saved. */
export async function simulateProjectFx(prisma, ctx, projectId, body) {
  const { project } = await projectFor(prisma, ctx, projectId);
  if (body.to !== project.currency) throw new HttpError(422, 'The target currency is the project’s', { reason: 'currencyMismatch', expected: project.currency });
  if (body.from === body.to) throw new HttpError(422, 'Two different currencies are needed', { reason: 'sameCurrency' });
  const remaining = Math.max(0, project.budget - project.fundsConfirmed);
  const saved = await prisma.finBusinessFxScenario.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' }, take: 20 });
  return { projection: fxProjection({ ...body, remaining }), scenariosConserves: saved };
}

/** Conserver scénario (ACT-01469): kept with its rates, its date and its source. */
export async function saveProjectFx(prisma, ctx, projectId, body) {
  const { project, access } = await projectFor(prisma, ctx, projectId);
  if (access === 'read') throw new HttpError(403, 'Your access to this project does not allow it', { reason: 'projectAccessForbidden' });
  if (body.to !== project.currency) throw new HttpError(422, 'The target currency is the project’s', { reason: 'currencyMismatch', expected: project.currency });
  fxProjection(body);
  return prisma.$transaction(async (tx) => {
    const scenario = await tx.finBusinessFxScenario.create({
      data: {
        businessId: ctx.business.id,
        projectId,
        label: body.label,
        amount: body.amount,
        fromCurrency: body.from,
        toCurrency: body.to,
        referenceRate: body.referenceRate,
        referenceDate: body.referenceDate,
        rateSource: body.rateSource ?? null,
        rates: body.rates ?? [],
        createdById: ctx.member.userId,
      },
    });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'project.fx.saved', objectType: 'project', objectId: projectId, details: { scenario: scenario.id } });
    return scenario;
  });
}
