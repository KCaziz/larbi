import { HttpError } from '../utils/httpError.js';
import { computed } from './finance/contract.js';
import { checkVersion, journal } from './finOrganization.service.js';
import { declarations, employerRules, payslip, sumSlips } from './finPayrollEngine.js';
import { OVERTIME } from '../constants/finEmployerRules.js';

/**
 * P13-05, lot G, second part — payroll (ECR-0265 to 0271), on default rules
 * until the administration confirms them. A run is prepared, validated by
 * ANOTHER person (double control, also checked by the database), then closed.
 * While a rule is provisional, every figure carries the warning and every
 * bulletin is a draft (« brouillon, valeurs provisoires »).
 */

const DAY = 86400000;
const PROVISIONAL = 'Valeurs réglementaires provisoires : à confirmer avant tout usage réel.';
const VARIABLES = ['baseSalary', 'overtime', 'bonuses', 'irregularBonuses', 'nonContributable', 'absenceDeduction', 'netDeductions'];

const monthBounds = (period) => {
  const [year, month] = period.split('-').map(Number);
  return { start: new Date(Date.UTC(year, month - 1, 1)), end: new Date(Date.UTC(year, month, 1)), days: new Date(Date.UTC(year, month, 0)).getUTCDate() };
};

/**
 * The month's starting variables for one employee: the base salary, prorated
 * on the calendar days of presence when the person entered or left during the
 * month, the unpaid leave approved in the month (base / 30 per day), and the
 * overtime hours approved in the timesheets (hourly rate + 50 %). Default rules.
 */
export function startingVariables(employee, absences, period, timesheets = []) {
  const { start, end, days } = monthBounds(period);
  const from = new Date(employee.startedAt) > start ? new Date(employee.startedAt) : start;
  const until = employee.endedAt && new Date(employee.endedAt) < end ? new Date(new Date(employee.endedAt).getTime() + DAY) : end;
  const present = Math.max(0, Math.round((until - from) / DAY));
  const base = employee.baseSalary ?? 0;
  const baseSalary = present >= days ? base : Math.round((base * present) / days);
  const unpaid = absences.filter((a) => a.kind === 'sans_solde' && a.status === 'approved' && new Date(a.startsAt) >= start && new Date(a.startsAt) < end).reduce((sum, a) => sum + a.days, 0);
  const overtimeHours = timesheets.filter((s) => s.status === 'approved' && new Date(s.workedOn) >= start && new Date(s.workedOn) < end).reduce((sum, s) => sum + s.overtimeHours, 0);
  const overtime = Math.round((base / OVERTIME.monthlyHours) * (1 + OVERTIME.premium) * overtimeHours);
  return { baseSalary, overtime, overtimeHours, bonuses: 0, irregularBonuses: 0, nonContributable: 0, absenceDeduction: Math.min(baseSalary, Math.round((base * unpaid) / 30)), netDeductions: 0 };
}

const slipData = (variables, rules, partTime) => {
  const result = payslip({ ...variables, partTime }, rules);
  const { anomalies, ...figures } = result;
  return { ...figures, anomalies, ...(variables.overtimeHours !== undefined ? { overtimeHours: variables.overtimeHours } : {}) };
};

const rulesSnapshot = (rules) => ({
  snmg: rules.snmg,
  employeeRate: rules.employeeRate,
  employerRate: rules.employerRate,
  socialWorksRate: rules.socialWorksRate,
  irg: rules.irg,
  calendar: rules.calendar,
  provisoires: rules.provisoires.filter((key) => key.startsWith('PAIE-')),
});

function runView(run, ctx) {
  const totals = sumSlips(run.slips);
  const currency = ctx.business.currency;
  const warnings = run.provisional ? [PROVISIONAL] : [];
  const inputs = { periode: run.period, bulletins: run.slips.length };
  const headcount = run.slips.length;
  return {
    ...run,
    slips: run.slips.map((s) => ({ ...s, nom: s.employee?.fullName, matricule: s.employee?.employeeNumber ?? null, poste: s.employee?.position, employee: undefined })),
    totaux: totals,
    masse: computed('E043', run.slips.length ? totals.employerCost : null, { inputs, currency, warnings }),
    declarations: declarations(run.period, run.slips, headcount, run.rules),
    peutValider: run.status === 'draft' && run.preparedById !== ctx.member.userId && run.slips.length > 0,
    anomalies: run.slips.reduce((n, s) => n + (s.anomalies?.length ?? 0), 0),
  };
}

const runInclude = { slips: { include: { employee: { select: { fullName: true, employeeNumber: true, position: true } } }, orderBy: { createdAt: 'asc' } } };

/** The payroll screen: the rules in force, the runs, the payroll mass of the last 12 months (ECR-0271). */
export async function payrollOverview(prisma, ctx) {
  const rules = await employerRules();
  const runs = await prisma.finPayrollRun.findMany({ where: { businessId: ctx.business.id }, orderBy: { period: 'desc' }, take: 24, include: runInclude });
  const views = runs.map((r) => runView(r, ctx));
  const kept = views.filter((r) => r.status !== 'draft').slice(0, 12);
  const currency = ctx.business.currency;
  const total = kept.reduce((sum, r) => sum + r.totaux.employerCost, 0);
  const staff = await prisma.finBusinessEmployee.findMany({
    where: { businessId: ctx.business.id },
    orderBy: [{ endedAt: 'asc' }, { fullName: 'asc' }],
    select: { id: true, fullName: true, position: true, employeeNumber: true, socialNumber: true, userId: true, baseSalary: true, partTime: true, startedAt: true, endedAt: true, version: true },
  });
  return {
    salaries: staff.map(({ userId, ...e }) => ({ ...e, acces: Boolean(userId) })),
    regles: { ...rulesSnapshot(rules), provisoire: rules.paieProvisoire },
    lots: views,
    masse12mois: computed('E043', kept.length ? total : null, { inputs: { mois: kept.length }, currency, warnings: rules.paieProvisoire ? [PROVISIONAL] : [] }),
    parMois: kept.map((r) => ({ periode: r.period, brut: r.totaux.gross, cout: r.totaux.employerCost, salaries: r.slips.length })).reverse(),
  };
}

/** A bulletin simulated, never saved (ECR-0267). */
export async function simulatePayslip(ctx, body) {
  const rules = await employerRules();
  const slip = payslip(body, rules);
  const currency = ctx.business.currency;
  const warnings = rules.paieProvisoire ? [PROVISIONAL] : [];
  const inputs = Object.fromEntries(VARIABLES.map((k) => [k, body[k] ?? 0]));
  return { ...slip, netEstime: computed('E041', slip.net, { inputs, currency, warnings }), coutEmployeur: computed('E042', slip.employerCost, { inputs, currency, warnings }), provisoire: rules.paieProvisoire };
}

async function findRun(prisma, ctx, id) {
  const run = await prisma.finPayrollRun.findFirst({ where: { id, businessId: ctx.business.id }, include: runInclude });
  if (!run) throw new HttpError(404, 'Payroll run not found', { reason: 'runNotFound' });
  return run;
}

export async function getRun(prisma, ctx, id) {
  return runView(await findRun(prisma, ctx, id), ctx);
}

/** Prepares the run of a month: one bulletin per person under contract that month. */
export async function createRun(prisma, ctx, { period }) {
  const { start, end } = monthBounds(period);
  const exists = await prisma.finPayrollRun.findFirst({ where: { businessId: ctx.business.id, period } });
  if (exists) throw new HttpError(409, 'This month already has a run', { reason: 'runExists' });
  const employees = await prisma.finBusinessEmployee.findMany({ where: { businessId: ctx.business.id, startedAt: { lt: end }, OR: [{ endedAt: null }, { endedAt: { gte: start } }] }, include: { absences: true, timesheets: true }, orderBy: { fullName: 'asc' } });
  if (employees.length === 0) throw new HttpError(422, 'Nobody under contract this month', { reason: 'noEmployee' });
  const rules = await employerRules(start);
  return prisma.$transaction(async (tx) => {
    const run = await tx.finPayrollRun.create({ data: { businessId: ctx.business.id, period, status: 'draft', provisional: rules.paieProvisoire, rules: rulesSnapshot(rules), preparedById: ctx.member.userId } });
    for (const e of employees) {
      await tx.finPayrollSlip.create({ data: { runId: run.id, employeeId: e.id, ...slipData(startingVariables(e, e.absences, period, e.timesheets), rules, e.partTime) } });
    }
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'payroll.prepared', objectType: 'payrollRun', objectId: run.id, details: { period, slips: employees.length } });
    return run;
  });
}

/** The month's variables of one bulletin, while the run is a draft (ECR-0266). */
export async function updateSlip(prisma, ctx, runId, slipId, body) {
  const run = await findRun(prisma, ctx, runId);
  if (run.status !== 'draft') throw new HttpError(409, 'Only a draft run changes', { reason: 'runLocked' });
  const slip = run.slips.find((s) => s.id === slipId);
  if (!slip) throw new HttpError(404, 'Bulletin not found', { reason: 'slipNotFound' });
  const employee = await prisma.finBusinessEmployee.findUnique({ where: { id: slip.employeeId } });
  const variables = Object.fromEntries(VARIABLES.map((k) => [k, body[k] ?? slip[k]]));
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finPayrollSlip.update({ where: { id: slipId }, data: { ...slipData(variables, run.rules, employee.partTime), note: body.note ?? slip.note } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'payroll.slipUpdated', objectType: 'payrollRun', objectId: runId, details: { fields: Object.keys(body) } });
    return updated;
  });
}

/**
 * recalculer: a draft run takes the rules in force now (after a confirmation);
 * valider: by another person than the one who prepared it, never with a negative net;
 * rouvrir: a validated run back to draft; cloturer: a validated run is closed for good.
 */
export async function moveRun(prisma, ctx, id, step, ifMatch) {
  const run = await findRun(prisma, ctx, id);
  if (ifMatch !== undefined) checkVersion(run, ifMatch);
  const allowed = { recalculer: ['draft'], valider: ['draft'], rouvrir: ['validated'], cloturer: ['validated'] }[step];
  if (!allowed.includes(run.status)) throw new HttpError(409, 'This step does not apply now', { reason: 'invalidTransition', state: run.status });
  if (step === 'valider' && run.preparedById === ctx.member.userId) throw new HttpError(409, 'Another person validates', { reason: 'secondPersonRequired' });
  if (step === 'valider' && run.slips.some((s) => s.net < 0 || s.gross < 0)) throw new HttpError(422, 'A bulletin has a negative amount', { reason: 'negativeSlip' });
  const now = new Date();
  return prisma.$transaction(async (tx) => {
    let data;
    if (step === 'recalculer') {
      const rules = await employerRules(monthBounds(run.period).start);
      for (const s of run.slips) {
        const employee = await tx.finBusinessEmployee.findUnique({ where: { id: s.employeeId } });
        await tx.finPayrollSlip.update({ where: { id: s.id }, data: slipData(Object.fromEntries(VARIABLES.map((k) => [k, s[k]])), rules, employee.partTime) });
      }
      data = { rules: rulesSnapshot(rules), provisional: rules.paieProvisoire };
    } else if (step === 'valider') data = { status: 'validated', validatedById: ctx.member.userId, validatedAt: now };
    else if (step === 'rouvrir') data = { status: 'draft', validatedById: null, validatedAt: null };
    else data = { status: 'closed', closedAt: now };
    const { count } = await tx.finPayrollRun.updateMany({ where: { id, status: run.status, version: run.version }, data: { ...data, version: { increment: 1 } } });
    if (count === 0) throw new HttpError(409, 'Changed since you read it', { reason: 'stateChanged' });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: `payroll.${step}`, objectType: 'payrollRun', objectId: id, details: { period: run.period } });
    return tx.finPayrollRun.findUnique({ where: { id } });
  });
}

export async function discardRun(prisma, ctx, id) {
  const run = await findRun(prisma, ctx, id);
  if (run.status !== 'draft') throw new HttpError(409, 'Only a draft run is discarded', { reason: 'runLocked' });
  return prisma.$transaction(async (tx) => {
    await tx.finPayrollRun.delete({ where: { id } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'payroll.discarded', objectType: 'payrollRun', objectId: id, details: { period: run.period } });
    return { id };
  });
}

/** The payroll conditions of one employee (ECR-0265): matricule, base salary, part time. */
export async function setConditions(prisma, ctx, id, body, ifMatch) {
  const employee = await prisma.finBusinessEmployee.findFirst({ where: { id, businessId: ctx.business.id } });
  if (!employee) throw new HttpError(404, 'Employee not found', { reason: 'employeeNotFound' });
  checkVersion(employee, ifMatch);
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finBusinessEmployee.update({ where: { id }, data: { ...body, version: { increment: 1 } } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'payroll.conditions', objectType: 'employee', objectId: id, details: { fields: Object.keys(body) } });
    return updated;
  });
}

/** Links an employee to their FINCLUDIA account (by e-mail), so they read their own payslips (ECR-0269). */
export async function linkEmployeeAccount(prisma, ctx, id, { email }) {
  const employee = await prisma.finBusinessEmployee.findFirst({ where: { id, businessId: ctx.business.id } });
  if (!employee) throw new HttpError(404, 'Employee not found', { reason: 'employeeNotFound' });
  let userId = null;
  if (email) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) throw new HttpError(404, 'No account with this e-mail', { reason: 'accountNotFound' });
    userId = user.id;
  }
  return prisma.$transaction(async (tx) => {
    await tx.finBusinessEmployee.update({ where: { id }, data: { userId, version: { increment: 1 } } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: userId ? 'payroll.accessGranted' : 'payroll.accessRevoked', objectType: 'employee', objectId: id, details: {} });
    return { lie: Boolean(userId) };
  });
}

/** The payslips of the person, in every organisation that linked them: validated or closed runs only. */
export async function myPayslips(prisma, user) {
  const slips = await prisma.finPayrollSlip.findMany({
    where: { employee: { userId: user.id }, run: { status: { in: ['validated', 'closed'] } } },
    include: { run: { select: { period: true, provisional: true, status: true, business: { select: { name: true, tradeName: true, currency: true, wilaya: true } } } }, employee: { select: { fullName: true, position: true, employeeNumber: true } } },
    orderBy: { createdAt: 'desc' },
    take: 120,
  });
  return slips.map(({ run, employee, ...s }) => ({ ...s, periode: run.period, provisoire: run.provisional, organisation: run.business, nom: employee.fullName, poste: employee.position, matricule: employee.employeeNumber }));
}

const csvCell = (value) => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[;"\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** The annual statement of salaries (one line per employee), from validated and closed runs. */
export async function annualStatement(prisma, ctx, year) {
  const runs = await prisma.finPayrollRun.findMany({
    where: { businessId: ctx.business.id, status: { in: ['validated', 'closed'] }, period: { startsWith: `${year}-` } },
    include: { slips: { include: { employee: { select: { fullName: true, employeeNumber: true, socialNumber: true } } } } },
  });
  const rows = new Map();
  for (const run of runs) {
    for (const s of run.slips) {
      const row = rows.get(s.employeeId) ?? { nom: s.employee.fullName, matricule: s.employee.employeeNumber ?? '', secu: s.employee.socialNumber ?? '', mois: 0, brut: 0, assiette: 0, cotisations: 0, imposable: 0, irg: 0, net: 0 };
      row.mois += 1;
      row.brut += s.gross;
      row.assiette += s.contributionBase;
      row.cotisations += s.employeeContrib;
      row.imposable += s.taxable;
      row.irg += s.irg + s.irgIrregular;
      row.net += s.net;
      rows.set(s.employeeId, row);
    }
  }
  const money = (v) => (v / 100).toFixed(2);
  const header = ['annee', 'matricule', 'numero_securite_sociale', 'nom', 'mois_payes', 'brut', 'assiette_cotisations', 'cotisations_salariales', 'imposable', 'irg_retenu', 'net'];
  const lines = [...rows.values()].map((r) => [year, r.matricule, r.secu, r.nom, r.mois, money(r.brut), money(r.assiette), money(r.cotisations), money(r.imposable), money(r.irg), money(r.net)].map(csvCell).join(';'));
  return `\uFEFF${[header.join(';'), ...lines].join('\r\n')}\r\n`;
}
