import { IRG_MONTHLY_SCALE, IRG_RULES, LEDGER_DEFAULTS, PAYROLL_CALENDAR, PAYROLL_DEFAULTS } from '../constants/finEmployerRules.js';
import { confirmedValue } from './regulatoryParams.service.js';

/**
 * P13-05, lot G, second part — the payroll engine (ECR-0266, 0267, 0270, 0271).
 * Pure functions, plus `employerRules()` which reads what the administration
 * confirmed. A value not confirmed keeps its default and is listed in
 * `provisoires`: every screen then says the result is provisional.
 */

const round = (value) => Math.round(value);

/** The rules in force on `at`: the confirmed value of each, else its default. */
export async function employerRules(at = new Date()) {
  const provisional = [];
  const read = async (rule, parse) => {
    const confirmed = await confirmedValue(rule.key, at);
    const parsed = confirmed === null ? null : parse(confirmed);
    if (parsed === null || parsed === undefined || Number.isNaN(parsed)) {
      provisional.push(rule.key);
      return rule.value;
    }
    return parsed;
  };
  const number = (text) => {
    const n = Number(String(text).replace(',', '.'));
    return Number.isFinite(n) && n >= 0 ? n : null;
  };
  // A text rule confirmed means « the default as written is right »: its value stays the default.
  const approved = async (rule) => {
    if ((await confirmedValue(rule.key, at)) === null) provisional.push(rule.key);
  };
  const values = {
    snmg: await read(PAYROLL_DEFAULTS.snmg, (v) => (number(v) === null ? null : number(v) * 100)),
    employeeRate: await read(PAYROLL_DEFAULTS.employeeRate, number),
    employerRate: await read(PAYROLL_DEFAULTS.employerRate, number),
    socialWorksRate: await read(PAYROLL_DEFAULTS.socialWorksRate, number),
  };
  await approved(PAYROLL_DEFAULTS.irgScale);
  await approved(PAYROLL_DEFAULTS.calendar);
  const payrollProvisional = [...provisional];
  await approved(LEDGER_DEFAULTS.chart);
  await approved(LEDGER_DEFAULTS.presentation);
  return { ...values, irg: { scale: IRG_MONTHLY_SCALE, ...IRG_RULES }, calendar: PAYROLL_CALENDAR, provisoires: provisional, paieProvisoire: payrollProvisional.length > 0, comptaProvisoire: provisional.some((key) => key.startsWith('SCF-')) };
}

/** The IRG of a month's taxable income (centimes), by default rules. */
export function monthlyIrg(taxable, irg) {
  const base = Math.floor(Math.max(0, taxable) / irg.roundTo) * irg.roundTo;
  if (base <= irg.exemptUpTo) return 0;
  let tax = 0;
  let floor = 0;
  for (const band of irg.scale) {
    const top = band.upTo ?? Infinity;
    if (base > floor) tax += (Math.min(base, top) - floor) * band.rate;
    floor = top;
  }
  const abatement = Math.min(irg.abatementMax, Math.max(irg.abatementMin, tax * irg.abatementRate));
  const after = Math.max(0, tax - abatement);
  const result = base <= irg.smoothingUpTo ? after * irg.smoothingFactor - irg.smoothingOffset : after;
  return Math.max(0, round(result));
}

/**
 * One bulletin (ECR-0266, 0267):
 *   brut = base + heures supplémentaires + primes + indemnités non cotisables − retenue d'absence
 *   cotisations salariales = (brut − indemnités non cotisables) × taux salarié
 *   imposable = brut − cotisations salariales ; IRG selon le barème
 *   net = brut − cotisations salariales − IRG − retenues nettes
 *   coût employeur = brut + cotisations patronales + œuvres sociales
 */
export function payslip(variables, rules) {
  const v = {
    baseSalary: variables.baseSalary ?? 0,
    overtime: variables.overtime ?? 0,
    bonuses: variables.bonuses ?? 0,
    nonContributable: variables.nonContributable ?? 0,
    absenceDeduction: variables.absenceDeduction ?? 0,
    netDeductions: variables.netDeductions ?? 0,
    irregularBonuses: variables.irregularBonuses ?? 0,
  };
  const gross = v.baseSalary + v.overtime + v.bonuses + v.irregularBonuses + v.nonContributable - v.absenceDeduction;
  const contributionBase = Math.max(0, gross - v.nonContributable);
  const employeeContrib = round(contributionBase * rules.employeeRate);
  // Lot H: bonuses for several months bear their contributions, then a flat tax apart.
  const irregularContrib = round(v.irregularBonuses * rules.employeeRate);
  const irgIrregular = round((v.irregularBonuses - irregularContrib) * (rules.irg.irregularRate ?? 0.1));
  const taxable = gross - v.irregularBonuses - (employeeContrib - irregularContrib);
  const irg = monthlyIrg(taxable, rules.irg);
  const net = gross - employeeContrib - irg - irgIrregular - v.netDeductions;
  const employerContrib = round(contributionBase * rules.employerRate);
  const socialWorks = round(contributionBase * rules.socialWorksRate);
  const anomalies = [];
  if (gross < 0) anomalies.push('negativeGross');
  if (net < 0) anomalies.push('negativeNet');
  if (v.baseSalary > 0 && v.baseSalary < rules.snmg && !variables.partTime) anomalies.push('belowMinimumWage');
  if (v.baseSalary === 0) anomalies.push('noBaseSalary');
  return { ...v, gross, contributionBase, employeeContrib, taxable, irg, irgIrregular, net, employerContrib, socialWorks, employerCost: gross + employerContrib + socialWorks, anomalies };
}

export const sumSlips = (slips) => ['gross', 'employeeContrib', 'irg', 'irgIrregular', 'net', 'netDeductions', 'employerContrib', 'socialWorks', 'employerCost'].reduce((totals, key) => ({ ...totals, [key]: slips.reduce((sum, s) => sum + (s[key] ?? 0), 0) }), {});

/** The employer's declarations of a month (ECR-0270): indicative amounts and due dates. */
export function declarations(period, slips, headcount, rules) {
  const [year, month] = period.split('-').map(Number);
  const base = slips.reduce((sum, s) => sum + s.contributionBase, 0);
  const social = slips.reduce((sum, s) => sum + s.employeeContrib + s.employerContrib + s.socialWorks, 0);
  const irg = slips.reduce((sum, s) => sum + s.irg + (s.irgIrregular ?? 0), 0);
  const quarterly = headcount < rules.calendar.quarterlyBelow;
  const socialFrom = quarterly ? new Date(Date.UTC(year, Math.ceil(month / 3) * 3, 1)) : new Date(Date.UTC(year, month, 1));
  return {
    assiette: base,
    cotisations: social,
    irgRetenu: irg,
    trimestriel: quarterly,
    echeanceIrg: new Date(Date.UTC(year, month, rules.calendar.irgDay)).toISOString().slice(0, 10),
    echeanceCotisations: new Date(socialFrom.getTime() + (rules.calendar.socialDays - 1) * 86400000).toISOString().slice(0, 10),
  };
}
