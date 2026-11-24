import { HttpError } from '../utils/httpError.js';
import { ASSET_THRESHOLD, AUTO_ACCOUNTS, EXPENSE_ACCOUNT_OF, SCF_CODES } from '../constants/finEmployerRules.js';
import { computed } from './finance/contract.js';
import { checkVersion, journal } from './finOrganization.service.js';
import { employerRules } from './finPayrollEngine.js';
import { chartOf, entryTotals, generalLedger, isValidAccount, ledgerAnomalies, parseChartFile, parseEntriesFile, statements, suggestAccount, trialBalance } from './finLedgerView.js';

/**
 * P13-05, lot G, second part — accounting (ECR-0108, 0243 to 0250, 0330), on
 * the default SCF chart until the administration confirms it. Entries are
 * drafts until validated; a validated entry is never changed, it is reversed.
 * The statements are « présentation simplifiée, non certifiée ».
 */

const PROVISIONAL = 'Plan de comptes et présentation par défaut, à valider : états non certifiés.';
const periodOf = (date) => new Date(date).toISOString().slice(0, 7);
const lineInclude = { lines: { orderBy: { position: 'asc' } } };

/**
 * Lot H: once a fiscal year is closed, its balances live on in the opening
 * entry (AN) of the next year. For a view that ends after a closed year, the
 * entries of that year and before are left out: counting both would double them.
 */
export async function cutDate(prisma, businessId, to) {
  const until = to ? new Date(to) : new Date();
  const years = await prisma.finLedgerYear.findMany({ where: { businessId }, select: { year: true } });
  const closed = years.map((y) => y.year).filter((y) => new Date(Date.UTC(y, 11, 31)) < until);
  return closed.length ? new Date(Date.UTC(Math.max(...closed), 11, 31)) : null;
}
export const afterCut = (entries, cut) => (cut ? entries.filter((e) => new Date(e.date) > cut) : entries);

async function closedPeriods(prisma, businessId) {
  const rows = await prisma.finLedgerPeriod.findMany({ where: { businessId, status: 'closed' } });
  return rows.map((r) => r.period);
}

async function assertOpen(prisma, businessId, date) {
  if ((await closedPeriods(prisma, businessId)).includes(periodOf(date))) throw new HttpError(409, 'This month is closed', { reason: 'periodClosed' });
}

function checkLines(lines) {
  for (const l of lines) {
    if (!isValidAccount(l.account)) throw new HttpError(422, 'Unknown account', { reason: 'unknownAccount', account: l.account });
    if ((l.debit ?? 0) > 0 && (l.credit ?? 0) > 0) throw new HttpError(422, 'A debit or a credit', { reason: 'debitOrCredit' });
    if ((l.debit ?? 0) + (l.credit ?? 0) <= 0) throw new HttpError(422, 'An amount per line', { reason: 'debitOrCredit' });
  }
}

async function nextNumber(tx, businessId, journalCode, date) {
  const year = new Date(date).getUTCFullYear();
  const prefix = `${journalCode}-${year}-`;
  const count = await tx.finLedgerEntry.count({ where: { businessId, number: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(4, '0')}`;
}

const linesData = (lines) => lines.map((l, i) => ({ position: i + 1, account: l.account, label: l.label ?? null, debit: l.debit ?? 0, credit: l.credit ?? 0 }));

// ---- overview, balance, ledger, statements ------------------------------------------------

/** The accounting screen: chart, mapping coverage, balance, statements, anomalies, closings, reconciliations. */
export async function ledgerOverview(prisma, ctx, { from, to } = {}) {
  const businessId = ctx.business.id;
  const currency = ctx.business.currency;
  const [rules, own, mappings, periods, checks, entries] = await Promise.all([
    employerRules(),
    prisma.finLedgerAccount.findMany({ where: { businessId }, orderBy: { code: 'asc' } }),
    prisma.finLedgerMapping.findMany({ where: { businessId }, orderBy: { sourceCode: 'asc' } }),
    prisma.finLedgerPeriod.findMany({ where: { businessId }, orderBy: { period: 'desc' } }),
    prisma.finLedgerBankCheck.findMany({ where: { businessId }, orderBy: { checkedAt: 'desc' }, take: 12 }),
    prisma.finLedgerEntry.findMany({ where: { businessId }, include: lineInclude }),
  ]);
  const chart = chartOf(own);
  const cut = await cutDate(prisma, businessId, to);
  const validated = afterCut(entries.filter((e) => e.status === 'validated'), cut);
  const years = await prisma.finLedgerYear.findMany({ where: { businessId }, orderBy: { year: 'desc' } });
  const balance = trialBalance(validated, { from, to }, chart);
  const states = statements(trialBalance(validated, { to }, chart));
  const warnings = rules.comptaProvisoire ? [PROVISIONAL] : [];
  const mapped = mappings.filter((m) => m.account).length;
  const closed = periods.filter((p) => p.status === 'closed').map((p) => p.period);
  return {
    provisoire: rules.comptaProvisoire,
    plan: chart,
    correspondances: mappings,
    couverture: computed('E044', mappings.length ? mapped / mappings.length : null, { inputs: { comptes_importes: mappings.length, comptes_mappes: mapped } }),
    balance,
    etats: {
      ...states,
      resultatNet: computed('E046', validated.length ? states.resultat.resultat : null, { inputs: { periode_fin: to ?? null }, currency, warnings }),
      bfr: computed('E047', validated.length ? states.gestion.bfr : null, { inputs: { periode_fin: to ?? null }, currency, warnings }),
    },
    anomalies: ledgerAnomalies(entries, { closedPeriods: closed }),
    periodes: periods,
    exercices: years,
    rapprochements: checks.map((c) => ({ ...c, ecart: computed('E045', c.statementBalance - c.bookBalance, { inputs: { compte: c.account, date: c.checkedAt }, currency }) })),
    compteurs: { brouillons: entries.length - validated.length, validees: validated.length },
  };
}

export async function listEntries(prisma, ctx, { from, to, journal: journalCode, status, account } = {}) {
  const entries = await prisma.finLedgerEntry.findMany({
    where: {
      businessId: ctx.business.id,
      ...(journalCode ? { journal: journalCode } : {}),
      ...(status ? { status } : {}),
      ...(from || to ? { date: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}),
      ...(account ? { lines: { some: { account: { startsWith: account } } } } : {}),
    },
    include: lineInclude,
    orderBy: [{ date: 'desc' }, { number: 'desc' }],
    take: 300,
  });
  return entries.map((e) => ({ ...e, ...entryTotals(e.lines) }));
}

export async function ledgerOfAccount(prisma, ctx, { account, from, to }) {
  const entries = await prisma.finLedgerEntry.findMany({ where: { businessId: ctx.business.id, status: 'validated', lines: { some: { account: { startsWith: account } } } }, include: lineInclude });
  return generalLedger(afterCut(entries, await cutDate(prisma, ctx.business.id, to)), account, { from, to });
}

// ---- chart and correspondences (ECR-0243) ----------------------------------------------------

export async function createAccount(prisma, ctx, { code, label }) {
  if (!isValidAccount(code) || SCF_CODES.includes(code)) throw new HttpError(422, 'A sub-account under an SCF account', { reason: 'invalidAccount' });
  const exists = await prisma.finLedgerAccount.findFirst({ where: { businessId: ctx.business.id, code } });
  if (exists) throw new HttpError(409, 'This account exists', { reason: 'accountExists' });
  return prisma.$transaction(async (tx) => {
    const account = await tx.finLedgerAccount.create({ data: { businessId: ctx.business.id, code, label } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'ledger.accountCreated', objectType: 'ledgerAccount', objectId: account.id, details: { code } });
    return account;
  });
}

/** Imports the chart of another software; each account gets its own code as a suggestion when it is an SCF account. */
export async function importChart(prisma, ctx, { content }) {
  const rows = parseChartFile(content);
  if (rows.length === 0) throw new HttpError(422, 'Nothing to read', { reason: 'emptyFile' });
  let created = 0;
  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const exists = await tx.finLedgerMapping.findFirst({ where: { businessId: ctx.business.id, sourceCode: row.sourceCode } });
      if (exists) continue;
      await tx.finLedgerMapping.create({ data: { businessId: ctx.business.id, ...row, account: suggestAccount(row.sourceCode) } });
      created += 1;
    }
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'ledger.chartImported', objectType: 'ledgerMapping', objectId: ctx.business.id, details: { read: rows.length, created } });
  });
  return { lus: rows.length, crees: created };
}

export async function setMapping(prisma, ctx, id, { account }) {
  const mapping = await prisma.finLedgerMapping.findFirst({ where: { id, businessId: ctx.business.id } });
  if (!mapping) throw new HttpError(404, 'Correspondence not found', { reason: 'mappingNotFound' });
  if (account && !isValidAccount(account)) throw new HttpError(422, 'Unknown account', { reason: 'unknownAccount' });
  return prisma.finLedgerMapping.update({ where: { id }, data: { account: account || null } });
}

// ---- entries (ECR-0244, 0247) ------------------------------------------------------------------

export async function createEntry(prisma, ctx, body, { source = 'manual', sourceKey = null, tx: outer = null } = {}) {
  checkLines(body.lines);
  await assertOpen(outer ?? prisma, ctx.business.id, body.date);
  const write = async (tx) => {
    const number = body.number?.trim() || (await nextNumber(tx, ctx.business.id, body.journal, body.date));
    const entry = await tx.finLedgerEntry.create({
      data: { businessId: ctx.business.id, journal: body.journal, number, date: new Date(body.date), label: body.label, status: 'draft', source, sourceKey, createdById: ctx.member.userId, lines: { create: linesData(body.lines) } },
      include: lineInclude,
    });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: `ledger.${source}Entry`, objectType: 'ledgerEntry', objectId: entry.id, details: { journal: body.journal, number } });
    return entry;
  };
  return outer ? write(outer) : prisma.$transaction(write);
}

async function findEntry(prisma, ctx, id) {
  const entry = await prisma.finLedgerEntry.findFirst({ where: { id, businessId: ctx.business.id }, include: lineInclude });
  if (!entry) throw new HttpError(404, 'Entry not found', { reason: 'entryNotFound' });
  return entry;
}

export async function updateEntry(prisma, ctx, id, body, ifMatch) {
  const entry = await findEntry(prisma, ctx, id);
  checkVersion(entry, ifMatch);
  if (entry.status !== 'draft') throw new HttpError(409, 'A validated entry is reversed, not changed', { reason: 'entryLocked' });
  if (body.lines) checkLines(body.lines);
  await assertOpen(prisma, ctx.business.id, body.date ?? entry.date);
  return prisma.$transaction(async (tx) => {
    if (body.lines) await tx.finLedgerLine.deleteMany({ where: { entryId: id } });
    const updated = await tx.finLedgerEntry.update({
      where: { id },
      data: {
        ...(body.journal ? { journal: body.journal } : {}),
        ...(body.number ? { number: body.number } : {}),
        ...(body.date ? { date: new Date(body.date) } : {}),
        ...(body.label ? { label: body.label } : {}),
        ...(body.lines ? { lines: { create: linesData(body.lines) } } : {}),
        version: { increment: 1 },
      },
      include: lineInclude,
    });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'ledger.entryUpdated', objectType: 'ledgerEntry', objectId: id, details: {} });
    return updated;
  });
}

export async function discardEntry(prisma, ctx, id) {
  const entry = await findEntry(prisma, ctx, id);
  if (entry.status !== 'draft') throw new HttpError(409, 'A validated entry is reversed, not deleted', { reason: 'entryLocked' });
  return prisma.$transaction(async (tx) => {
    await tx.finLedgerEntry.delete({ where: { id } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'ledger.entryDiscarded', objectType: 'ledgerEntry', objectId: id, details: { number: entry.number } });
    return { id };
  });
}

/** valider: balanced, in an open month. contrepasser: a reversing draft of a validated entry (dated today). */
export async function moveEntry(prisma, ctx, id, step) {
  const entry = await findEntry(prisma, ctx, id);
  if (step === 'valider') {
    if (entry.status !== 'draft') throw new HttpError(409, 'Already validated', { reason: 'invalidTransition' });
    if (!entryTotals(entry.lines).balanced) throw new HttpError(422, 'Debits and credits differ', { reason: 'unbalanced' });
    await assertOpen(prisma, ctx.business.id, entry.date);
    return prisma.$transaction(async (tx) => {
      const { count } = await tx.finLedgerEntry.updateMany({ where: { id, status: 'draft' }, data: { status: 'validated', validatedById: ctx.member.userId, validatedAt: new Date(), version: { increment: 1 } } });
      if (count === 0) throw new HttpError(409, 'Changed since you read it', { reason: 'stateChanged' });
      await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'ledger.entryValidated', objectType: 'ledgerEntry', objectId: id, details: { number: entry.number } });
      return tx.finLedgerEntry.findUnique({ where: { id }, include: lineInclude });
    });
  }
  if (entry.status !== 'validated') throw new HttpError(409, 'Only a validated entry is reversed', { reason: 'invalidTransition' });
  const reversed = await prisma.finLedgerEntry.findFirst({ where: { businessId: ctx.business.id, sourceKey: `reverse:${id}` } });
  if (reversed) throw new HttpError(409, 'Already reversed', { reason: 'alreadyReversed' });
  const today = new Date().toISOString().slice(0, 10);
  return createEntry(
    prisma,
    ctx,
    { journal: entry.journal, date: today, label: `Contrepassation ${entry.number}`.slice(0, 200), lines: entry.lines.map((l) => ({ account: l.account, label: l.label, debit: l.credit, credit: l.debit })) },
    { source: 'manual', sourceKey: `reverse:${id}` },
  );
}

// ---- automatic entries (ECR-0247) ----------------------------------------------------------------

const settlementAccount = (method) => (method === 'especes' ? AUTO_ACCOUNTS.cash : AUTO_ACCOUNTS.bank);
const journalOfSettlement = (method) => (method === 'especes' ? 'CA' : 'BQ');

/** The entry an event of the application calls for, by default (null when it calls for none). */
export function proposalFor(event) {
  if (event.type === 'document') {
    const d = event.document;
    const total = d.amountExcl + d.taxAmount;
    const credit = d.docType === 'credit_note';
    const sale = d.kind === 'sale';
    const label = `${credit ? 'Avoir' : 'Facture'} ${d.number ?? ''} ${d.contact?.name ?? ''}`.trim().slice(0, 200);
    const third = sale ? AUTO_ACCOUNTS.customers : AUTO_ACCOUNTS.suppliers;
    const asset = !sale && d.category === 'equipement' && d.amountExcl >= ASSET_THRESHOLD;
    const main = sale ? AUTO_ACCOUNTS.sales : asset ? '218' : (EXPENSE_ACCOUNT_OF[d.category] ?? '628');
    const vat = sale ? AUTO_ACCOUNTS.vatCollected : AUTO_ACCOUNTS.vatDeductible;
    // A sale debits the customer; a purchase credits the supplier; a credit note does the opposite.
    const thirdDebit = sale !== credit;
    const lines = [
      { account: third, label, debit: thirdDebit ? total : 0, credit: thirdDebit ? 0 : total },
      { account: main, label, debit: thirdDebit ? 0 : d.amountExcl, credit: thirdDebit ? d.amountExcl : 0 },
    ];
    if (d.taxAmount > 0) lines.push({ account: vat, label, debit: thirdDebit ? 0 : d.taxAmount, credit: thirdDebit ? d.taxAmount : 0 });
    return { sourceKey: `doc:${d.id}`, journal: sale ? 'VT' : 'AC', date: d.issuedAt, label, lines: lines.filter((l) => l.debit + l.credit > 0) };
  }
  if (event.type === 'payment') {
    const p = event.payment;
    const sale = p.document.kind === 'sale';
    const label = `Règlement ${p.document.number ?? p.document.label}`.slice(0, 200);
    const money = settlementAccount(p.method);
    const third = sale ? AUTO_ACCOUNTS.customers : AUTO_ACCOUNTS.suppliers;
    const lines = sale
      ? [
          { account: money, label, debit: p.value, credit: 0 },
          { account: third, label, debit: 0, credit: p.value },
        ]
      : [
          { account: third, label, debit: p.value, credit: 0 },
          { account: money, label, debit: 0, credit: p.value },
        ];
    return { sourceKey: `pay:${p.id}`, journal: journalOfSettlement(p.method), date: p.receivedAt, label, lines };
  }
  if (event.type === 'payroll') {
    const run = event.run;
    const t = run.slips.reduce(
      (acc, s) => ({ gross: acc.gross + s.gross, employee: acc.employee + s.employeeContrib, irg: acc.irg + s.irg + (s.irgIrregular ?? 0), net: acc.net + s.net, deductions: acc.deductions + s.netDeductions, employer: acc.employer + s.employerContrib + s.socialWorks }),
      { gross: 0, employee: 0, irg: 0, net: 0, deductions: 0, employer: 0 },
    );
    const [year, month] = run.period.split('-').map(Number);
    const label = `Paie ${run.period}`;
    const lines = [
      { account: AUTO_ACCOUNTS.wages, label, debit: t.gross, credit: 0 },
      { account: AUTO_ACCOUNTS.socialCharges, label, debit: t.employer, credit: 0 },
      { account: AUTO_ACCOUNTS.social, label, debit: 0, credit: t.employee + t.employer },
      { account: AUTO_ACCOUNTS.withheldTax, label, debit: 0, credit: t.irg },
      { account: AUTO_ACCOUNTS.staffAdvances, label, debit: 0, credit: t.deductions },
      { account: AUTO_ACCOUNTS.staffDue, label, debit: 0, credit: t.net },
    ].filter((l) => l.debit + l.credit > 0);
    return { sourceKey: `payroll:${run.id}`, journal: 'PA', date: new Date(Date.UTC(year, month, 0)), label, lines };
  }
  return null;
}

/**
 * Proposes the entries of what happened in the application and is not yet in
 * the books: issued invoices and credit notes, payments, validated payroll
 * runs. One event, one entry (sourceKey); all drafts, to be validated.
 */
export async function proposeEntries(prisma, ctx) {
  const businessId = ctx.business.id;
  const [documents, payments, runs, known, closed] = await Promise.all([
    prisma.finBusinessDocument.findMany({ where: { businessId, archivedAt: null, deletedAt: null, docType: { in: ['invoice', 'credit_note'] }, state: 'issued' }, include: { contact: { select: { name: true } } } }),
    prisma.finBusinessPayment.findMany({ where: { businessId, archivedAt: null, deletedAt: null, status: 'active' }, include: { document: { select: { kind: true, number: true, label: true } } } }),
    prisma.finPayrollRun.findMany({ where: { businessId, status: { in: ['validated', 'closed'] } }, include: { slips: true } }),
    prisma.finLedgerEntry.findMany({ where: { businessId, sourceKey: { not: null } }, select: { sourceKey: true } }),
    closedPeriods(prisma, businessId),
  ]);
  const seen = new Set(known.map((k) => k.sourceKey));
  const events = [...documents.map((document) => ({ type: 'document', document })), ...payments.map((payment) => ({ type: 'payment', payment })), ...runs.map((run) => ({ type: 'payroll', run }))];
  let created = 0;
  let skipped = 0;
  await prisma.$transaction(async (tx) => {
    for (const event of events) {
      const proposal = proposalFor(event);
      if (!proposal || seen.has(proposal.sourceKey)) continue;
      if (closed.includes(periodOf(proposal.date)) || proposal.lines.length < 2) {
        skipped += 1;
        continue;
      }
      const { sourceKey, ...body } = proposal;
      await createEntry(prisma, ctx, { ...body, date: new Date(body.date).toISOString().slice(0, 10) }, { source: 'auto', sourceKey, tx });
      created += 1;
    }
  });
  return { creees: created, ignorees: skipped };
}

// ---- import (ECR-0108, 0330) ------------------------------------------------------------------------

/** Checks a file of entries (preview) or imports it as drafts when it is entirely valid. */
export async function importEntries(prisma, ctx, { content, apply }) {
  const businessId = ctx.business.id;
  const mappings = await prisma.finLedgerMapping.findMany({ where: { businessId, account: { not: null } } });
  const report = parseEntriesFile(content, { mapping: Object.fromEntries(mappings.map((m) => [m.sourceCode, m.account])), closedPeriods: await closedPeriods(prisma, businessId) });
  if (!apply) return { ...report, applique: false };
  if (!report.valide) throw new HttpError(422, 'The file has errors', { reason: 'importInvalid', rejets: report.rejets.slice(0, 50) });
  const keys = report.pieces.map((p) => `import:${p.journal}|${p.number}|${p.date}`.slice(0, 80));
  const known = new Set((await prisma.finLedgerEntry.findMany({ where: { businessId, sourceKey: { in: keys } }, select: { sourceKey: true } })).map((k) => k.sourceKey));
  let created = 0;
  await prisma.$transaction(async (tx) => {
    for (const [i, piece] of report.pieces.entries()) {
      if (known.has(keys[i])) continue;
      await createEntry(prisma, ctx, { journal: piece.journal, number: piece.number.slice(0, 40), date: piece.date, label: piece.label, lines: piece.lines }, { source: 'import', sourceKey: keys[i], tx });
      created += 1;
    }
  });
  return { ...report, applique: true, creees: created, dejaImportees: report.pieces.length - created };
}

// ---- closing (ECR-0248) and reconciliation (ECR-0246) ---------------------------------------------------

export async function closePeriod(prisma, ctx, period) {
  const businessId = ctx.business.id;
  const [year, month] = period.split('-').map(Number);
  const range = { gte: new Date(Date.UTC(year, month - 1, 1)), lt: new Date(Date.UTC(year, month, 1)) };
  const drafts = await prisma.finLedgerEntry.count({ where: { businessId, status: 'draft', date: range } });
  if (drafts > 0) throw new HttpError(409, 'Drafts remain in this month', { reason: 'draftsRemain', drafts });
  const existing = await prisma.finLedgerPeriod.findFirst({ where: { businessId, period } });
  if (existing?.status === 'closed') throw new HttpError(409, 'Already closed', { reason: 'periodClosed' });
  return prisma.$transaction(async (tx) => {
    const data = { status: 'closed', closedById: ctx.member.userId, closedAt: new Date() };
    const row = existing ? await tx.finLedgerPeriod.update({ where: { id: existing.id }, data }) : await tx.finLedgerPeriod.create({ data: { businessId, period, ...data } });
    await journal(tx, { businessId, actorId: ctx.member.userId, action: 'ledger.periodClosed', objectType: 'ledgerPeriod', objectId: row.id, details: { period } });
    return row;
  });
}

export async function reopenPeriod(prisma, ctx, period, { reason }) {
  const row = await prisma.finLedgerPeriod.findFirst({ where: { businessId: ctx.business.id, period, status: 'closed' } });
  if (!row) throw new HttpError(404, 'This month is not closed', { reason: 'periodNotClosed' });
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finLedgerPeriod.update({ where: { id: row.id }, data: { status: 'open', reopenReason: reason, reopenedById: ctx.member.userId, reopenedAt: new Date() } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'ledger.periodReopened', objectType: 'ledgerPeriod', objectId: row.id, details: { period, reason } });
    return updated;
  });
}

/** Solde banque − solde comptable = écart, at a date, on a bank or cash account (validated entries). */
export async function createBankCheck(prisma, ctx, { account, checkedAt, statementBalance, note }) {
  if (!/^5/.test(account) || !isValidAccount(account)) throw new HttpError(422, 'A bank or cash account', { reason: 'notCashAccount' });
  const all = await prisma.finLedgerEntry.findMany({ where: { businessId: ctx.business.id, status: 'validated', date: { lte: new Date(checkedAt) }, lines: { some: { account: { startsWith: account } } } }, include: lineInclude });
  const entries = afterCut(all, await cutDate(prisma, ctx.business.id, checkedAt));
  const book = entries
    .flatMap((e) => e.lines)
    .filter((l) => l.account.startsWith(account))
    .reduce((sum, l) => sum + l.debit - l.credit, 0);
  return prisma.$transaction(async (tx) => {
    const check = await tx.finLedgerBankCheck.create({ data: { businessId: ctx.business.id, account, checkedAt: new Date(checkedAt), statementBalance, bookBalance: book, note: note ?? null, createdById: ctx.member.userId } });
    await journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action: 'ledger.reconciled', objectType: 'ledgerBankCheck', objectId: check.id, details: { account, gap: statementBalance - book } });
    return check;
  });
}
