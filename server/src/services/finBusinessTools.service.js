import { HttpError } from '../utils/httpError.js';
import { WORKBOOK_SIMULATORS } from '../constants/finSimulatorCatalogue.js';
import { BUSINESS_COMPARATORS, BUSINESS_SIMULATORS, classifyWorkbookSimulator, runSimulator, simulatorByCode } from './finBusinessSimulators.js';
import { employerRules, payslip } from './finPayrollEngine.js';
import { OVERTIME } from '../constants/finEmployerRules.js';

// Overtime pay: hourly rate (base / monthly hours) × hours × the default increase (lot H).
const overtimeOf = (baseSalary, hours) => Math.round((baseSalary / OVERTIME.monthlyHours) * hours * (1 + OVERTIME.premium));
import { confirmedValue } from './regulatoryParams.service.js';
import { businessCashPlan, businessDashboard } from './finBusiness.service.js';
import { documentSettlement, isIssuedInvoice } from './finBusinessView.service.js';

/**
 * Lot F (P13-05, 2026-11-24): the simulators and comparators of the client's
 * tabs 14 and 15, the universal search of tab 16 (REC-001), and the copilot
 * of tab 17 — closed questions only (CNV-08): a question is recognised by its
 * words, answered by the server's own figures, and written from a prepared
 * template. An unknown question gets the menu of what can be asked, never an
 * invented answer.
 */

// ---- simulators ----------------------------------------------------------------

export function simulatorCatalogue() {
  return {
    simulateurs: BUSINESS_SIMULATORS.map((s) => ({
      code: s.code,
      entrees: s.inputs.map(([key, unit, optional]) => ({ key, unit, optional: Boolean(optional) })),
      reglementaire: Boolean(s.regulatory),
    })),
    comparateurs: BUSINESS_COMPARATORS.map(({ code, simulator, options }) => ({ code, simulator, options })),
    // The client's 178 rows, each attached to a simulator or said elsewhere.
    catalogue: WORKBOOK_SIMULATORS.map((row) => ({ publics: row.publics, nom: row.name, ...classifyWorkbookSimulator(row.name) })),
  };
}

export async function simulate(code, inputs) {
  const simulator = simulatorByCode(code);
  if (!simulator) throw new HttpError(404, 'Unknown simulator', { reason: 'simulatorNotFound' });
  // DEC-001: a regulatory rate is the confirmed one, or none.
  const rate = simulator.regulatory ? await confirmedValue(simulator.regulatory) : null;
  // Payroll simulators read the employer rules (default values until confirmed, lot G).
  const payroll = simulator.payroll ? { rules: await employerRules(), payslip, overtimeOf } : null;
  return runSimulator(code, inputs, { rate: rate === null ? null : Number(rate), payroll });
}

// ---- universal search (REC-001) ----------------------------------------------------

const fold = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/** Deterministic score: exact identifier > prefix > contained (REC-001). */
function score(query, ...fields) {
  let best = 0;
  for (const field of fields) {
    const value = fold(field);
    if (!value) continue;
    if (value === query) best = Math.max(best, 100);
    else if (value.startsWith(query)) best = Math.max(best, 50);
    else if (value.includes(query)) best = Math.max(best, 10);
  }
  return best;
}

export async function searchBusiness(prisma, ctx, q) {
  const query = fold(q);
  if (query.length < 2) return [];
  const can = (action) => ctx.permissions.includes(action);
  const businessId = ctx.business.id;
  const results = [];
  const push = (type, row, title, subtitle, ...fields) => {
    const s = score(query, title, ...fields);
    if (s > 0) results.push({ type, id: row.id, title, subtitle, score: s });
  };

  if (can('finance.read')) {
    const [documents, contacts, operations] = await Promise.all([
      prisma.finBusinessDocument.findMany({ where: { businessId, archivedAt: null, deletedAt: null }, include: { contact: { select: { name: true } } }, take: 2000 }),
      prisma.finBusinessContact.findMany({ where: { businessId, archivedAt: null, deletedAt: null } }),
      prisma.finBusinessOperation.findMany({ where: { businessId } }),
    ]);
    for (const d of documents) push('document', d, d.number ?? d.label, `${d.docType}|${d.kind}|${d.state}`, d.label, d.contact?.name);
    for (const c of contacts) push('contact', c, c.name, c.kind, c.taxId, c.email, c.phone);
    for (const o of operations) push('operation', o, o.reference, o.label, o.label, o.country);
  }
  if (can('stock.read')) {
    const items = await prisma.finBusinessItem.findMany({ where: { businessId, archivedAt: null } });
    for (const i of items) push('item', i, i.name, i.unit, i.reference);
  }
  // Projects: the ones the person reaches (CNV-14).
  const projects = await prisma.finBusinessProject.findMany({
    where: {
      businessId,
      ...(can('project.manage') ? {} : { shares: { some: { memberId: ctx.member.id, revokedAt: null, OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }] } } }),
    },
  });
  for (const p of projects) push('project', p, p.name, p.location ?? '', p.location);
  if (can('patrimony.read')) {
    const holdings = await prisma.finBusinessHolding.findMany({ where: { businessId, archivedAt: null } });
    for (const h of holdings) push('holding', h, h.label, `${h.country} · ${h.currency}`);
  }
  return results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, 30);
}

// ---- copilot (17_COPILOTE, CNV-08) ---------------------------------------------------

// The words that recognise each closed question, in the three languages.
const INTENTS = [
  { intent: 'clientBalance', words: ['doit', 'doivent', 'owe', 'owes', 'solde client', 'يدين', 'ديون الزبون'] },
  { intent: 'invoiceStatus', words: ['facture', 'invoice', 'réglée', 'payée', 'paid', 'فاتورة'] },
  { intent: 'cashNegative', words: ['négatif', 'negative', 'sous zéro', 'below zero', 'tension', 'سالب', 'تحت الصفر'] },
  { intent: 'earned', words: ['gagné', 'gagne', 'earned', 'earn', 'chiffre', 'ce mois', 'this month', 'ربحت', 'هذا الشهر'] },
  { intent: 'overdue', words: ['retard', 'échu', 'late', 'overdue', 'متأخر'] },
  { intent: 'cashNow', words: ['trésorerie', 'tresorerie', 'cash', 'argent', 'money', 'solde', 'الخزينة', 'المال'] },
  { intent: 'stock', words: ['stock', 'inventaire', 'inventory', 'المخزون'] },
  { intent: 'budget', words: ['budget', 'dépassé', 'over budget', 'الميزانية'] },
];

export const COPILOT_INTENTS = INTENTS.map((i) => i.intent);

export function detectIntent(question) {
  const text = fold(question);
  let best = null;
  let bestHits = 0;
  for (const { intent, words } of INTENTS) {
    const hits = words.filter((w) => text.includes(fold(w))).length;
    if (hits > bestHits) {
      best = intent;
      bestHits = hits;
    }
  }
  return best;
}

export async function copilot(prisma, ctx, { question, intent: asked, params = {} }) {
  const intent = asked ?? detectIntent(question ?? '');
  const currency = ctx.business.currency;
  if (!intent) return { intent: null, menu: COPILOT_INTENTS };
  if (!ctx.permissions.includes('finance.read')) throw new HttpError(403, 'Your role does not reach the figures', { reason: 'roleForbidden' });

  if (intent === 'clientBalance' || intent === 'invoiceStatus') {
    const documents = await prisma.finBusinessDocument.findMany({ where: { businessId: ctx.business.id, archivedAt: null, deletedAt: null }, include: { contact: { select: { id: true, name: true } } } });
    const payments = await prisma.finBusinessPayment.findMany({ where: { businessId: ctx.business.id, archivedAt: null, deletedAt: null } });
    const sales = documents.filter((d) => isIssuedInvoice(d) && d.kind === 'sale');
    const text = fold(question ?? '');

    if (intent === 'invoiceStatus') {
      const number = params.number ?? sales.find((d) => d.number && text.includes(fold(d.number)))?.number;
      const doc = sales.find((d) => d.number === number);
      if (!doc) return { intent, needs: 'invoiceNumber', options: sales.slice(0, 8).map((d) => d.number) };
      const s = documentSettlement(doc, payments, documents);
      return { intent, values: { number: doc.number, state: s.state, paid: s.settled, outstanding: s.outstanding, currency } };
    }

    const contacts = [...new Map(sales.filter((d) => d.contact).map((d) => [d.contact.id, d.contact])).values()];
    const client = contacts.find((c) => c.id === params.clientId) ?? contacts.find((c) => text.includes(fold(c.name)));
    if (!client) return { intent, needs: 'client', options: contacts.slice(0, 12).map((c) => ({ id: c.id, name: c.name })) };
    const open = sales.filter((d) => d.contactId === client.id).map((d) => documentSettlement(d, payments, documents)).filter((s) => s.outstanding > 0);
    return { intent, values: { client: client.name, amount: open.reduce((t, s) => t + s.outstanding, 0), count: open.length, currency } };
  }

  const board = await businessDashboard(prisma, ctx, {});
  const value = (answer) => answer?.resultat ?? null;
  switch (intent) {
    case 'earned': {
      const now = new Date();
      const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
      const month = await businessDashboard(prisma, ctx, { from, to: now });
      // BOT-003: invoiced and collected are two different figures; both are said.
      return { intent, values: { invoiced: value(month.caFacture), collected: value(month.encaissements), currency } };
    }
    case 'cashNow':
      return { intent, values: { cash: value(board.pilotage.tresorerieDisponible), receivables: value(board.creances), currency } };
    case 'cashNegative': {
      const plan = await businessCashPlan(prisma, ctx, {});
      if (!plan.depart) return { intent, needs: 'openingBalance' };
      const week = plan.premiereTension ? plan.semaines[plan.premiereTension - 1] : null;
      return { intent, values: { week: plan.premiereTension, date: week?.debut ?? null, lowest: plan.plusBas, currency } };
    }
    case 'overdue':
      return { intent, values: { amount: value(board.echu), count: board.enRetard.length, currency } };
    case 'stock':
      return { intent, values: { value: value(board.pilotage.stock), currency } };
    case 'budget':
      return { intent, values: { gap: value(board.pilotage.budget), month: board.pilotage.budgetMois.mois, currency } };
    default:
      return { intent: null, menu: COPILOT_INTENTS };
  }
}
