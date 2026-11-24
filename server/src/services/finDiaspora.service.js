import { HttpError } from '../utils/httpError.js';
import { checkVersion, journal } from './finOrganization.service.js';
import { patrimonyView, projectView } from './finDiasporaView.service.js';

/**
 * The diaspora (P13-05, lot E, 2026-11-24): projects in Algeria followed from
 * abroad, and the patrimony across countries.
 *
 * Who sees a project (CNV-14): those whose role manages every project
 * (`project.manage`), and the members it is SHARED with — for a purpose, until
 * a date, revocable, checked on every request. A share never opens the
 * patrimony. Who validates an expense: a manager who did not declare it
 * (DEC-018). FINCLUDIA moves no money (DEC-016).
 */

const projectInclude = {
  milestones: { orderBy: [{ dueAt: 'asc' }, { createdAt: 'asc' }] },
  expenses: { orderBy: { spentAt: 'desc' } },
};

const activeShare = (memberId, now = new Date()) => ({
  memberId,
  revokedAt: null,
  OR: [{ endsAt: null }, { endsAt: { gt: now } }],
});

/** What the person may do on this project: 'manage', 'contribute', 'read' — or nothing (404). */
async function accessTo(prisma, ctx, projectId) {
  const project = await prisma.finBusinessProject.findFirst({ where: { id: projectId, businessId: ctx.business.id }, include: projectInclude });
  if (!project) throw new HttpError(404, 'Project not found', { reason: 'projectNotFound' });
  if (ctx.permissions.includes('project.manage')) return { project, access: 'manage' };
  const share = await prisma.finBusinessProjectShare.findFirst({ where: { projectId, ...activeShare(ctx.member.id) } });
  // Not shared, or no longer: nothing says the project exists.
  if (!share) throw new HttpError(404, 'Project not found', { reason: 'projectNotFound' });
  return { project, access: share.access };
}

function need(access, wanted) {
  const rank = { read: 1, contribute: 2, manage: 3 };
  if (rank[access] < rank[wanted]) throw new HttpError(403, 'Your access to this project does not allow it', { reason: 'projectAccessForbidden' });
}

function assertRate(body, currency) {
  const foreign = body.currency !== currency;
  if (foreign && (!body.rate || !body.rateDate || !body.rateSource)) {
    throw new HttpError(422, 'An amount in another currency needs its dated and sourced rate', { reason: 'rateRequired', currency: body.currency });
  }
  if (!foreign && body.rate) throw new HttpError(422, 'No rate in the same currency', { reason: 'rateNotNeeded' });
  return foreign ? { rate: body.rate, rateDate: body.rateDate, rateSource: body.rateSource } : { rate: null, rateDate: null, rateSource: null };
}

function present(project, access, ctx) {
  const me = ctx.member.userId;
  const view = projectView({ project, expenses: project.expenses, milestones: project.milestones });
  return {
    ...project,
    acces: access,
    expenses: view.lignes.map((e) => ({
      ...e,
      // The screen offers only what the server would accept.
      peutValider: access === 'manage' && e.status === 'submitted' && e.createdById !== me,
      declareParMoi: e.createdById === me,
    })),
    calcul: { ...view, lignes: undefined },
  };
}

export async function listProjects(prisma, ctx) {
  const manage = ctx.permissions.includes('project.manage');
  const projects = await prisma.finBusinessProject.findMany({
    where: { businessId: ctx.business.id, ...(manage ? {} : { shares: { some: activeShare(ctx.member.id) } }) },
    orderBy: { createdAt: 'desc' },
    include: {
      ...projectInclude,
      ...(manage ? { shares: { where: { revokedAt: null }, include: { member: { select: { id: true, email: true, role: true } } } } } : {}),
    },
  });
  const shares = manage ? [] : await prisma.finBusinessProjectShare.findMany({ where: { projectId: { in: projects.map((p) => p.id) }, ...activeShare(ctx.member.id) } });
  return projects.map((project) => present(project, manage ? 'manage' : shares.find((s) => s.projectId === project.id)?.access ?? 'read', ctx));
}

export async function createProject(prisma, ctx, body) {
  return prisma.$transaction(async (tx) => {
    const project = await tx.finBusinessProject.create({ data: { businessId: ctx.business.id, ...body } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'project.created', objectType: 'project', objectId: project.id, details: { name: project.name } });
    return project;
  });
}

export async function updateProject(prisma, ctx, id, body, ifMatch) {
  const { project, access } = await accessTo(prisma, ctx, id);
  need(access, 'manage');
  checkVersion(project, ifMatch);
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finBusinessProject.update({ where: { id }, data: { ...body, version: { increment: 1 } } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'project.updated', objectType: 'project', objectId: id, details: { fields: Object.keys(body) } });
    return updated;
  });
}

// ---- milestones (ECR-0375) ----------------------------------------------------

export async function addMilestone(prisma, ctx, id, body) {
  const { access } = await accessTo(prisma, ctx, id);
  need(access, 'manage');
  return prisma.$transaction(async (tx) => {
    const milestone = await tx.finBusinessProjectMilestone.create({ data: { projectId: id, label: body.label, weight: body.weight, dueAt: body.dueAt ?? null } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'milestone.created', objectType: 'project', objectId: id, details: { label: body.label } });
    return milestone;
  });
}

/**
 * declarer: whoever works on the project says it is done, with its proof.
 * accepter / refuser: the one who manages decides. Accepted progress is what
 * counts, never the money spent.
 */
export async function moveMilestone(prisma, ctx, id, milestoneId, step, body = {}) {
  const { project, access } = await accessTo(prisma, ctx, id);
  const milestone = project.milestones.find((m) => m.id === milestoneId);
  if (!milestone) throw new HttpError(404, 'Milestone not found', { reason: 'milestoneNotFound' });
  const rules = {
    declarer: { from: ['planned', 'rejected'], to: 'declared', need: 'contribute' },
    accepter: { from: ['declared'], to: 'accepted', need: 'manage' },
    refuser: { from: ['declared'], to: 'rejected', need: 'manage' },
  };
  const rule = rules[step];
  need(access, rule.need);
  if (!rule.from.includes(milestone.status)) throw new HttpError(409, 'This step does not apply now', { reason: 'invalidTransition', state: milestone.status });
  if (step === 'declarer' && !body.proofRef) throw new HttpError(422, 'A milestone is declared with its proof', { reason: 'proofRequired' });
  const data =
    step === 'declarer'
      ? { status: 'declared', proofRef: body.proofRef, declaredById: ctx.member.userId, decidedById: null, decidedAt: null }
      : { status: rule.to, decidedById: ctx.member.userId, decidedAt: new Date() };
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.finBusinessProjectMilestone.updateMany({ where: { id: milestoneId, status: milestone.status }, data });
    if (count === 0) throw new HttpError(409, 'Changed since you read it', { reason: 'stateChanged' });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: `milestone.${rule.to}`, objectType: 'project', objectId: id, details: { label: milestone.label } });
    return tx.finBusinessProjectMilestone.findUnique({ where: { id: milestoneId } });
  });
}

// ---- expenses (ECR-0376, DEC-018) -------------------------------------------------

export async function addExpense(prisma, ctx, id, body) {
  const { project, access } = await accessTo(prisma, ctx, id);
  need(access, 'contribute');
  if (project.status === 'cancelled') throw new HttpError(409, 'A cancelled project takes no expense', { reason: 'projectCancelled' });
  const rate = assertRate(body, project.currency);
  return prisma.$transaction(async (tx) => {
    const expense = await tx.finBusinessProjectExpense.create({
      data: {
        projectId: id,
        label: body.label,
        supplier: body.supplier ?? null,
        amount: body.amount,
        currency: body.currency,
        ...rate,
        spentAt: body.spentAt,
        proofRef: body.proofRef ?? null,
        // Without its proof, an expense is « to justify » (CNV-13).
        status: body.proofRef ? 'submitted' : 'to_justify',
        createdById: ctx.member.userId,
      },
    });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'expense.declared', objectType: 'project', objectId: id, details: { label: body.label } });
    return expense;
  });
}

/**
 * justifier: the proof is given (to_justify or rejected → submitted).
 * valider / refuser: a manager who is NOT the one who declared it.
 * payer: a validated expense is marked paid — declared, validated and paid
 * stay three different facts.
 */
export async function moveExpense(prisma, ctx, id, expenseId, step, body = {}) {
  const { project, access } = await accessTo(prisma, ctx, id);
  const expense = project.expenses.find((e) => e.id === expenseId);
  if (!expense) throw new HttpError(404, 'Expense not found', { reason: 'expenseNotFound' });
  const rules = {
    justifier: { from: ['to_justify', 'rejected'], need: 'contribute' },
    valider: { from: ['submitted'], need: 'manage' },
    refuser: { from: ['submitted'], need: 'manage' },
    payer: { from: ['validated'], need: 'manage' },
  };
  const rule = rules[step];
  need(access, rule.need);
  if (!rule.from.includes(expense.status) || (step === 'payer' && expense.paidAt)) {
    throw new HttpError(409, 'This step does not apply now', { reason: 'invalidTransition', state: expense.status });
  }
  if ((step === 'valider' || step === 'refuser') && expense.createdById === ctx.member.userId) {
    throw new HttpError(409, 'Another person validates what you declared', { reason: 'secondPersonRequired' });
  }
  let data;
  if (step === 'justifier') {
    if (!body.proofRef) throw new HttpError(422, 'Give the proof', { reason: 'proofRequired' });
    data = { status: 'submitted', proofRef: body.proofRef, rejectionNote: null };
  } else if (step === 'valider') data = { status: 'validated', validatedById: ctx.member.userId, validatedAt: new Date() };
  else if (step === 'refuser') data = { status: 'rejected', rejectionNote: body.note ?? null, validatedById: null, validatedAt: null };
  else data = { paidAt: body.paidAt ?? new Date() };

  return prisma.$transaction(async (tx) => {
    const { count } = await tx.finBusinessProjectExpense.updateMany({ where: { id: expenseId, status: expense.status, paidAt: expense.paidAt }, data });
    if (count === 0) throw new HttpError(409, 'Changed since you read it', { reason: 'stateChanged' });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: `expense.${step}`, objectType: 'project', objectId: id, details: { label: expense.label } });
    return tx.finBusinessProjectExpense.findUnique({ where: { id: expenseId } });
  });
}

// ---- shares (CNV-14) ---------------------------------------------------------------

export async function shareProject(prisma, ctx, id, body) {
  const { access } = await accessTo(prisma, ctx, id);
  need(access, 'manage');
  const member = await prisma.finOrganizationMember.findFirst({ where: { id: body.memberId, businessId: ctx.business.id, status: 'active' } });
  if (!member) throw new HttpError(404, 'Member not found', { reason: 'memberNotFound' });
  return prisma.$transaction(async (tx) => {
    // One share in force per member and project: a new one replaces the old.
    await tx.finBusinessProjectShare.updateMany({ where: { projectId: id, memberId: member.id, revokedAt: null }, data: { revokedAt: new Date() } });
    const share = await tx.finBusinessProjectShare.create({ data: { projectId: id, memberId: member.id, access: body.access, purpose: body.purpose, endsAt: body.endsAt ?? null } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'project.shared', objectType: 'project', objectId: id, details: { member: member.email, access: body.access } });
    return share;
  });
}

export async function revokeShare(prisma, ctx, id, shareId) {
  const { access } = await accessTo(prisma, ctx, id);
  need(access, 'manage');
  const share = await prisma.finBusinessProjectShare.findFirst({ where: { id: shareId, projectId: id, revokedAt: null } });
  if (!share) throw new HttpError(404, 'Share not found', { reason: 'shareNotFound' });
  await prisma.$transaction(async (tx) => {
    await tx.finBusinessProjectShare.update({ where: { id: shareId }, data: { revokedAt: new Date() } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'project.unshared', objectType: 'project', objectId: id, details: {} });
  });
}

// ---- patrimony (ECR-0372, ECR-0373) ---------------------------------------------------

export async function listPatrimony(prisma, ctx) {
  const holdings = await prisma.finBusinessHolding.findMany({ where: { businessId: ctx.business.id, archivedAt: null }, orderBy: { createdAt: 'asc' }, include: { values: true } });
  return patrimonyView({ holdings, base: ctx.business.currency });
}

const valueData = (body) => ({
  value: body.value,
  valuedAt: body.valuedAt,
  mode: body.mode,
  rate: body.rate ?? null,
  rateDate: body.rate ? body.rateDate : null,
  rateSource: body.rate ? body.rateSource : null,
  proofRef: body.proofRef ?? null,
});

function assertHoldingRate(body) {
  if (body.rate && (!body.rateDate || !body.rateSource)) throw new HttpError(422, 'A rate has its date and source', { reason: 'rateRequired' });
}

export async function createHolding(prisma, ctx, body) {
  assertHoldingRate(body);
  return prisma.$transaction(async (tx) => {
    const holding = await tx.finBusinessHolding.create({
      data: { businessId: ctx.business.id, kind: body.kind, category: body.category, label: body.label, country: body.country, currency: body.currency, values: { create: valueData(body) } },
    });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'holding.created', objectType: 'holding', objectId: holding.id, details: { label: body.label } });
    return holding;
  });
}

/** A new valuation: added, never written over the previous one (ECR-0373). */
export async function addHoldingValue(prisma, ctx, id, body) {
  const holding = await prisma.finBusinessHolding.findFirst({ where: { id, businessId: ctx.business.id, archivedAt: null } });
  if (!holding) throw new HttpError(404, 'Holding not found', { reason: 'holdingNotFound' });
  assertHoldingRate(body);
  return prisma.$transaction(async (tx) => {
    const value = await tx.finBusinessHoldingValue.create({ data: { holdingId: id, ...valueData(body) } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'holding.valued', objectType: 'holding', objectId: id, details: { mode: body.mode } });
    return value;
  });
}
