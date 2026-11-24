import { HttpError } from '../utils/httpError.js';
import { journal } from './finOrganization.service.js';

/**
 * P13-05, lot H (2026-11-24) — the rest of human resources (ECR-0274 to 0277):
 * timesheets (approved by another person; approved overtime feeds the payroll),
 * skills, training plan, recruitment. Amounts (training costs) are shown only
 * to those who read finance or payroll (DRT-005).
 */

export const SKILL_LEVELS = [1, 2, 3, 4];
export const TRAINING_STATUSES = ['planned', 'done', 'cancelled'];
export const VACANCY_STATUSES = ['open', 'filled', 'cancelled'];
export const CANDIDATE_STAGES = ['applied', 'interview', 'offer', 'hired', 'rejected'];

const seesAmounts = (ctx) => ctx.permissions.includes('finance.read') || ctx.permissions.includes('payroll.read');
const log = (tx, ctx, action, objectId, details = {}) => journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action, objectType: 'staff', objectId, details });

async function findEmployee(prisma, ctx, id) {
  const employee = await prisma.finBusinessEmployee.findFirst({ where: { id, businessId: ctx.business.id } });
  if (!employee) throw new HttpError(404, 'Employee not found', { reason: 'employeeNotFound' });
  return employee;
}

/** Everything of the HR tab beyond the register: one read. */
export async function staffOverview(prisma, ctx, { month } = {}) {
  const businessId = ctx.business.id;
  const now = new Date();
  const [year, m] = (month ?? now.toISOString().slice(0, 7)).split('-').map(Number);
  const range = { gte: new Date(Date.UTC(year, m - 1, 1)), lt: new Date(Date.UTC(year, m, 1)) };
  const me = ctx.member.userId;
  const manage = ctx.permissions.includes('hr.manage');
  const [employees, trainings, vacancies] = await Promise.all([
    prisma.finBusinessEmployee.findMany({
      where: { businessId },
      orderBy: [{ endedAt: 'asc' }, { fullName: 'asc' }],
      select: { id: true, fullName: true, position: true, endedAt: true, skills: { orderBy: { skill: 'asc' } }, timesheets: { where: { workedOn: range }, orderBy: { workedOn: 'asc' } } },
    }),
    prisma.finBusinessTraining.findMany({ where: { businessId }, orderBy: { plannedAt: 'desc' }, include: { employee: { select: { fullName: true } } } }),
    prisma.finBusinessVacancy.findMany({ where: { businessId }, orderBy: { openedAt: 'desc' }, include: { candidates: { orderBy: { createdAt: 'asc' } } } }),
  ]);
  const amounts = seesAmounts(ctx);
  return {
    mois: `${year}-${String(m).padStart(2, '0')}`,
    salaries: employees.map((e) => {
      const approved = e.timesheets.filter((s) => s.status === 'approved');
      return {
        ...e,
        timesheets: e.timesheets.map((s) => ({ ...s, peutDecider: manage && s.status === 'submitted' && s.createdById !== me })),
        heures: { travaillees: approved.reduce((sum, s) => sum + s.hours, 0), supplementaires: approved.reduce((sum, s) => sum + s.overtimeHours, 0), enAttente: e.timesheets.filter((s) => s.status === 'submitted').length },
      };
    }),
    formations: trainings.map((t) => ({ ...t, cost: amounts ? t.cost : undefined, salarie: t.employee?.fullName ?? null, employee: undefined })),
    budgetFormation: amounts ? trainings.filter((t) => t.status !== 'cancelled' && new Date(t.plannedAt).getUTCFullYear() === year).reduce((sum, t) => sum + (t.cost ?? 0), 0) : null,
    postes: vacancies,
  };
}

// ---- timesheets (ECR-0274) -----------------------------------------------------------------

/** One day of one employee: entered (or corrected while not decided), then approved by another person. */
export async function recordTimesheet(prisma, ctx, employeeId, body) {
  const employee = await findEmployee(prisma, ctx, employeeId);
  const day = new Date(`${body.workedOn.slice(0, 10)}T00:00:00.000Z`);
  if (day < new Date(employee.startedAt) || (employee.endedAt && day > new Date(employee.endedAt))) throw new HttpError(422, 'Outside the contract', { reason: 'outsideContract' });
  if ((body.overtimeHours ?? 0) > body.hours) throw new HttpError(422, 'Overtime is part of the hours', { reason: 'overtimeAboveHours' });
  const existing = await prisma.finBusinessTimesheet.findFirst({ where: { employeeId, workedOn: day } });
  if (existing && existing.status !== 'submitted') throw new HttpError(409, 'Already decided', { reason: 'timesheetDecided' });
  const data = { hours: body.hours, overtimeHours: body.overtimeHours ?? 0, note: body.note ?? null, createdById: ctx.member.userId };
  return prisma.$transaction(async (tx) => {
    const sheet = existing ? await tx.finBusinessTimesheet.update({ where: { id: existing.id }, data }) : await tx.finBusinessTimesheet.create({ data: { employeeId, workedOn: day, ...data } });
    await log(tx, ctx, 'timesheet.recorded', employeeId, { day: body.workedOn.slice(0, 10) });
    return sheet;
  });
}

export async function decideTimesheet(prisma, ctx, employeeId, sheetId, step) {
  await findEmployee(prisma, ctx, employeeId);
  const sheet = await prisma.finBusinessTimesheet.findFirst({ where: { id: sheetId, employeeId } });
  if (!sheet) throw new HttpError(404, 'Timesheet not found', { reason: 'timesheetNotFound' });
  if (sheet.status !== 'submitted') throw new HttpError(409, 'Already decided', { reason: 'timesheetDecided' });
  if (sheet.createdById === ctx.member.userId) throw new HttpError(409, 'Another person decides', { reason: 'secondPersonRequired' });
  const status = step === 'approuver' ? 'approved' : 'refused';
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.finBusinessTimesheet.updateMany({ where: { id: sheetId, status: 'submitted' }, data: { status, decidedById: ctx.member.userId } });
    if (count === 0) throw new HttpError(409, 'Changed since you read it', { reason: 'stateChanged' });
    await log(tx, ctx, `timesheet.${status}`, employeeId);
    return tx.finBusinessTimesheet.findUnique({ where: { id: sheetId } });
  });
}

// ---- skills (ECR-0275) ----------------------------------------------------------------------

export async function setSkill(prisma, ctx, employeeId, { skill, level }) {
  await findEmployee(prisma, ctx, employeeId);
  const name = skill.trim();
  return prisma.$transaction(async (tx) => {
    const row = await tx.finBusinessSkill.upsert({ where: { employeeId_skill: { employeeId, skill: name } }, update: { level, assessedAt: new Date() }, create: { employeeId, skill: name, level, assessedAt: new Date() } });
    await log(tx, ctx, 'skill.assessed', employeeId, { skill: name, level });
    return row;
  });
}

export async function removeSkill(prisma, ctx, employeeId, skillId) {
  await findEmployee(prisma, ctx, employeeId);
  const row = await prisma.finBusinessSkill.findFirst({ where: { id: skillId, employeeId } });
  if (!row) throw new HttpError(404, 'Skill not found', { reason: 'skillNotFound' });
  return prisma.$transaction(async (tx) => {
    await tx.finBusinessSkill.delete({ where: { id: skillId } });
    await log(tx, ctx, 'skill.removed', employeeId, { skill: row.skill });
    return { id: skillId };
  });
}

// ---- training plan (ECR-0276) ------------------------------------------------------------------

export async function createTraining(prisma, ctx, body) {
  if (body.employeeId) await findEmployee(prisma, ctx, body.employeeId);
  if (body.cost !== undefined && body.cost !== null && !seesAmounts(ctx)) throw new HttpError(403, 'Costs belong to finance', { reason: 'roleForbidden' });
  return prisma.$transaction(async (tx) => {
    const training = await tx.finBusinessTraining.create({ data: { businessId: ctx.business.id, ...body, plannedAt: new Date(body.plannedAt) } });
    await log(tx, ctx, 'training.planned', training.id, { title: training.title });
    return training;
  });
}

export async function updateTraining(prisma, ctx, id, { status }) {
  const training = await prisma.finBusinessTraining.findFirst({ where: { id, businessId: ctx.business.id } });
  if (!training) throw new HttpError(404, 'Training not found', { reason: 'trainingNotFound' });
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finBusinessTraining.update({ where: { id }, data: { status } });
    await log(tx, ctx, `training.${status}`, id);
    return updated;
  });
}

// ---- recruitment (ECR-0277) ----------------------------------------------------------------------

export async function createVacancy(prisma, ctx, body) {
  return prisma.$transaction(async (tx) => {
    const vacancy = await tx.finBusinessVacancy.create({ data: { businessId: ctx.business.id, ...body, openedAt: new Date(body.openedAt) } });
    await log(tx, ctx, 'vacancy.opened', vacancy.id, { title: vacancy.title });
    return vacancy;
  });
}

async function findVacancy(prisma, ctx, id) {
  const vacancy = await prisma.finBusinessVacancy.findFirst({ where: { id, businessId: ctx.business.id } });
  if (!vacancy) throw new HttpError(404, 'Position not found', { reason: 'vacancyNotFound' });
  return vacancy;
}

export async function updateVacancy(prisma, ctx, id, { status }) {
  await findVacancy(prisma, ctx, id);
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finBusinessVacancy.update({ where: { id }, data: { status } });
    await log(tx, ctx, `vacancy.${status}`, id);
    return updated;
  });
}

export async function addCandidate(prisma, ctx, vacancyId, body) {
  const vacancy = await findVacancy(prisma, ctx, vacancyId);
  if (vacancy.status !== 'open') throw new HttpError(409, 'This position is not open', { reason: 'vacancyClosed' });
  return prisma.$transaction(async (tx) => {
    const candidate = await tx.finBusinessCandidate.create({ data: { vacancyId, fullName: body.fullName, note: body.note ?? null } });
    await log(tx, ctx, 'candidate.added', vacancyId);
    return candidate;
  });
}

/** Moves a candidate; « hired » fills the position. Rejected candidates are kept with their stage only. */
export async function moveCandidate(prisma, ctx, vacancyId, candidateId, { stage, note }) {
  await findVacancy(prisma, ctx, vacancyId);
  const candidate = await prisma.finBusinessCandidate.findFirst({ where: { id: candidateId, vacancyId } });
  if (!candidate) throw new HttpError(404, 'Candidate not found', { reason: 'candidateNotFound' });
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finBusinessCandidate.update({ where: { id: candidateId }, data: { stage, ...(note !== undefined ? { note } : {}) } });
    if (stage === 'hired') await tx.finBusinessVacancy.update({ where: { id: vacancyId }, data: { status: 'filled' } });
    await log(tx, ctx, `candidate.${stage}`, vacancyId);
    return updated;
  });
}

/** Removes a candidate's record (their data, on request). */
export async function removeCandidate(prisma, ctx, vacancyId, candidateId) {
  await findVacancy(prisma, ctx, vacancyId);
  const candidate = await prisma.finBusinessCandidate.findFirst({ where: { id: candidateId, vacancyId } });
  if (!candidate) throw new HttpError(404, 'Candidate not found', { reason: 'candidateNotFound' });
  return prisma.$transaction(async (tx) => {
    await tx.finBusinessCandidate.delete({ where: { id: candidateId } });
    await log(tx, ctx, 'candidate.removed', vacancyId);
    return { id: candidateId };
  });
}
