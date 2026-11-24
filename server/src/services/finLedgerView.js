import { LEDGER_JOURNALS, SCF_CHART, SCF_CODES } from '../constants/finEmployerRules.js';

/**
 * P13-05, lot G, second part — the accounting views (ECR-0243 to 0250), pure.
 * Amounts in centimes; a line carries a debit OR a credit.
 */

const LABEL = new Map(SCF_CHART);

/** The SCF root an account belongs to (itself, or the longest root it starts with). */
export function rootOf(code) {
  if (LABEL.has(code)) return code;
  let best = null;
  for (const root of SCF_CODES) if (code.startsWith(root) && (!best || root.length > best.length)) best = root;
  return best;
}

export const isValidAccount = (code) => /^[1-7][0-9]{1,9}$/.test(code) && rootOf(code) !== null;

/** The chart of an organisation: the default one, plus its own sub-accounts. */
export function chartOf(customAccounts = []) {
  const own = customAccounts.map((a) => ({ code: a.code, label: a.label, root: rootOf(a.code), own: true, id: a.id }));
  const codes = new Set(own.map((a) => a.code));
  return [...SCF_CHART.filter(([code]) => !codes.has(code)).map(([code, label]) => ({ code, label, root: code, own: false })), ...own].sort((a, b) => a.code.localeCompare(b.code));
}

export const labelOf = (code, chart) => chart.find((a) => a.code === code)?.label ?? LABEL.get(rootOf(code) ?? '') ?? code;

export function entryTotals(lines) {
  const debit = lines.reduce((sum, l) => sum + (l.debit ?? 0), 0);
  const credit = lines.reduce((sum, l) => sum + (l.credit ?? 0), 0);
  return { debit, credit, balanced: lines.length >= 2 && Math.round(debit) === Math.round(credit) && debit > 0 };
}

const inPeriod = (date, from, to) => (!from || new Date(date) >= new Date(from)) && (!to || new Date(date) <= new Date(to));

/**
 * The trial balance (ECR-0245): per account, the opening balance (before
 * `from`), the movements of the period and the closing balance.
 * Solde final = solde initial + mouvements signés (debit − credit).
 */
export function trialBalance(entries, { from, to } = {}, chart = chartOf()) {
  const rows = new Map();
  for (const entry of entries) {
    if (to && new Date(entry.date) > new Date(to)) continue;
    const before = from && new Date(entry.date) < new Date(from);
    for (const line of entry.lines) {
      const row = rows.get(line.account) ?? { code: line.account, label: labelOf(line.account, chart), opening: 0, debit: 0, credit: 0 };
      if (before) row.opening += (line.debit ?? 0) - (line.credit ?? 0);
      else {
        row.debit += line.debit ?? 0;
        row.credit += line.credit ?? 0;
      }
      rows.set(line.account, row);
    }
  }
  const list = [...rows.values()].map((r) => ({ ...r, closing: r.opening + r.debit - r.credit })).sort((a, b) => a.code.localeCompare(b.code));
  const totals = list.reduce((t, r) => ({ debit: t.debit + r.debit, credit: t.credit + r.credit }), { debit: 0, credit: 0 });
  return { comptes: list, totaux: { ...totals, ecart: totals.debit - totals.credit } };
}

/** The general ledger of one account (ECR-0245), with its running balance. */
export function generalLedger(entries, account, { from, to } = {}) {
  let opening = 0;
  let running = 0;
  const lines = [];
  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date) || a.number.localeCompare(b.number));
  for (const entry of sorted) {
    if (to && new Date(entry.date) > new Date(to)) continue;
    for (const line of entry.lines.filter((l) => l.account.startsWith(account))) {
      const signed = (line.debit ?? 0) - (line.credit ?? 0);
      running += signed;
      if (inPeriod(entry.date, from, to)) lines.push({ entryId: entry.id, date: entry.date, journal: entry.journal, number: entry.number, label: line.label ?? entry.label, debit: line.debit, credit: line.credit, balance: running });
      else opening += signed;
    }
  }
  return { compte: account, ouverture: opening, lignes: lines, cloture: running };
}

/**
 * The statements in the SCF presentation (ECR-0249), from a trial balance:
 * balance sheet (assets, equity and liabilities) and income statement by
 * nature. Computed from validated entries; presented, never certified.
 */
const starts = (code, prefixes) => prefixes.some((p) => code.startsWith(p));
export function statements(balance) {
  const rows = balance.comptes;
  const net = (prefixes, exclude = []) => rows.filter((r) => starts(r.code, prefixes) && !starts(r.code, exclude)).reduce((sum, r) => sum + r.closing, 0);
  // Third-party and cash accounts: a debit balance is an asset, a credit balance a liability.
  const side = (prefixes, exclude, debit) => rows.filter((r) => starts(r.code, prefixes) && !starts(r.code, exclude) && (debit ? r.closing > 0 : r.closing < 0)).reduce((sum, r) => sum + Math.abs(r.closing), 0);
  const credit = (prefixes, exclude = []) => -net(prefixes, exclude);

  // Income statement by nature.
  const sales = credit(['70']);
  const production = sales + credit(['72']) + credit(['73']) + credit(['74']);
  const consumption = net(['60']) + net(['61', '62']);
  const valueAdded = production - consumption;
  const staff = net(['63']);
  const taxes = net(['64']);
  const ebitda = valueAdded - staff - taxes;
  const operating = ebitda + credit(['75']) - net(['65']) - net(['68']) + credit(['78']);
  const financial = credit(['76']) - net(['66']);
  const beforeTax = operating + financial;
  const incomeTax = net(['69']);
  const ordinary = beforeTax - incomeTax;
  const extraordinary = credit(['77']) - net(['67']);
  const result = ordinary + extraordinary;

  const actif = {
    immoIncorporelles: net(['20', '280', '290']),
    immoCorporelles: net(['21', '22', '23', '281', '282', '291', '292', '293']),
    immoFinancieres: net(['26', '27', '296', '297']),
    stocks: net(['3']),
    clients: side(['41', '491'], [], true),
    impotsActif: side(['44'], [], true),
    autresDebiteurs: side(['4'], ['41', '44', '491'], true),
    tresorerie: side(['5'], [], true),
  };
  const passif = {
    capital: credit(['101', '108', '109']),
    primesReserves: credit(['104', '106']),
    reportNouveau: credit(['11']),
    resultatExercice: credit(['12']) + result,
    autresCapitaux: credit(['105', '13']),
    emprunts: credit(['16', '17']),
    provisions: credit(['15']),
    fournisseurs: side(['40'], [], false),
    impotsPassif: side(['44'], [], false),
    autresDettes: side(['4'], ['40', '44'], false),
    tresoreriePassif: side(['5'], [], false),
  };
  const totalActif = Object.values(actif).reduce((a, b) => a + b, 0);
  const totalPassif = Object.values(passif).reduce((a, b) => a + b, 0);
  return {
    resultat: {
      ventes: sales,
      production,
      consommation: consumption,
      valeurAjoutee: valueAdded,
      personnel: staff,
      impotsTaxes: taxes,
      ebe: ebitda,
      resultatOperationnel: operating,
      resultatFinancier: financial,
      avantImpots: beforeTax,
      impotsResultat: incomeTax,
      resultatOrdinaire: ordinary,
      extraordinaire: extraordinary,
      produits: credit(['7']),
      charges: net(['6']),
      resultat: result,
    },
    bilan: { actif: { ...actif, total: totalActif }, passif: { ...passif, total: totalPassif }, ecart: totalActif - totalPassif },
    gestion: { ventes: sales, marge: sales - net(['60']), bfr: net(['3']) + side(['41'], [], true) - side(['40'], [], false) },
  };
}

/** Straight-line depreciation of a fixed asset for a calendar year, prorated by month (the month of acquisition counts). */
export function depreciation(asset, year) {
  const start = new Date(asset.acquiredAt);
  const firstMonth = start.getUTCFullYear() * 12 + start.getUTCMonth();
  const end = asset.disposedAt ? new Date(asset.disposedAt) : null;
  const lastMonth = Math.min(firstMonth + asset.durationMonths - 1, end ? end.getUTCFullYear() * 12 + end.getUTCMonth() : Infinity);
  const monthly = asset.cost / asset.durationMonths;
  const monthsUpTo = (y) => Math.max(0, Math.min(lastMonth, y * 12 + 11) - firstMonth + 1);
  const cumulated = Math.min(asset.cost, Math.round(monthly * monthsUpTo(year)));
  const before = Math.min(asset.cost, Math.round(monthly * monthsUpTo(year - 1)));
  return { dotation: cumulated - before, cumul: cumulated, valeurNette: asset.cost - cumulated };
}

/** The depreciation account of an asset account: 20x gives 280, 21x gives 281, 22x gives 282. */
export const depreciationAccountOf = (account) => `28${account[1]}`;

/**
 * Reads a bank statement (CSV, header first): date;libelle;montant (positive =
 * money in) or date;libelle;debit;credit (the bank's side: credit = money in).
 */
export function parseBankStatement(text) {
  const lines = String(text ?? '')
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '');
  if (lines.length < 2) return { lignes: [], rejets: [{ line: 1, reason: 'empty' }] };
  const separator = lines[0].includes(';') ? ';' : ',';
  const header = lines[0].split(separator).map((h) => h.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  const at = (name) => header.indexOf(name);
  const idx = { date: at('date'), label: at('libelle'), amount: at('montant'), debit: at('debit'), credit: at('credit') };
  if (idx.date < 0 || (idx.amount < 0 && (idx.debit < 0 || idx.credit < 0))) return { lignes: [], rejets: [{ line: 1, reason: 'missingColumns' }] };
  const parsed = [];
  const rejects = [];
  const seen = new Map();
  lines.slice(1).forEach((raw, i) => {
    const cells = raw.split(separator).map((c) => c.trim());
    const date = toDate(cells[idx.date]);
    let amount;
    if (idx.amount >= 0) {
      const t = String(cells[idx.amount] ?? '').replace(/\s/g, '').replace(',', '.');
      const n = Number(t);
      amount = t !== '' && Number.isFinite(n) ? Math.round(n * 100) : null;
    } else {
      const d = toCents(cells[idx.debit]);
      const c = toCents(cells[idx.credit]);
      amount = d === null || c === null ? null : c - d;
    }
    if (!date) return rejects.push({ line: i + 2, reason: 'date' });
    if (!amount) return rejects.push({ line: i + 2, reason: 'amount' });
    const label = (idx.label >= 0 ? cells[idx.label] : '') || '-';
    const base = `${date.toISOString().slice(0, 10)}|${amount}|${label}`.slice(0, 110);
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    parsed.push({ date, label: label.slice(0, 200), amount, key: `${base}|${n}` });
  });
  return { lignes: parsed, rejets: rejects };
}

/**
 * Matches statement lines with lines of the books on the same account: same
 * amount (money in = debit in the books), dates at most `days` apart, the
 * closest first. Each line is matched once.
 */
export function matchBankLines(statementLines, bookLines, days = 7) {
  const free = [...bookLines];
  const pairs = [];
  for (const s of statementLines) {
    let best = -1;
    let gap = Infinity;
    free.forEach((b, i) => {
      if (Math.round(b.debit - b.credit) !== Math.round(s.amount)) return;
      const d = Math.abs(new Date(b.date) - new Date(s.date)) / 86400000;
      if (d <= days && d < gap) {
        gap = d;
        best = i;
      }
    });
    if (best >= 0) pairs.push([s.id, free.splice(best, 1)[0].id]);
  }
  return pairs;
}

/** The anomalies to review (ECR-0250), computed: never stored, never hidden. */
export function ledgerAnomalies(entries, { closedPeriods = [], now = new Date() } = {}) {
  const found = [];
  for (const entry of entries) {
    const totals = entryTotals(entry.lines);
    if (!totals.balanced) found.push({ kind: 'unbalanced', entryId: entry.id, number: entry.number, date: entry.date, ecart: totals.debit - totals.credit });
    if (entry.status === 'draft' && now - new Date(entry.createdAt ?? entry.date) > 30 * 86400000) found.push({ kind: 'oldDraft', entryId: entry.id, number: entry.number, date: entry.date });
    if (entry.lines.some((l) => !isValidAccount(l.account))) found.push({ kind: 'unknownAccount', entryId: entry.id, number: entry.number, date: entry.date });
    if (entry.status === 'draft' && closedPeriods.includes(String(entry.date instanceof Date ? entry.date.toISOString() : entry.date).slice(0, 7))) {
      found.push({ kind: 'draftInClosedPeriod', entryId: entry.id, number: entry.number, date: entry.date });
    }
  }
  const suspense = entries
    .filter((e) => e.status === 'validated')
    .flatMap((e) => e.lines)
    .filter((l) => l.account.startsWith('471'));
  const pending = suspense.reduce((sum, l) => sum + (l.debit ?? 0) - (l.credit ?? 0), 0);
  if (Math.round(pending) !== 0) found.push({ kind: 'suspense', ecart: pending });
  return found;
}

// ---- import (ECR-0108, 0330) ------------------------------------------------------------

const toCents = (text) => {
  const clean = String(text ?? '')
    .trim()
    .replace(/\s/g, '')
    .replace(',', '.');
  if (clean === '') return 0;
  const n = Number(clean);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
};

const toDate = (text) => {
  const t = String(text ?? '').trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(t);
  if (m) return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]));
  return null;
};

export const IMPORT_COLUMNS = ['journal', 'piece', 'date', 'compte', 'libelle', 'debit', 'credit'];

/**
 * Reads an entries file (CSV, « ; » or « , », header line first):
 * journal;piece;date;compte;libelle;debit;credit. Checks every line, then each
 * piece's balance; nothing is written here (the preview of ECR-0108).
 * `mapping` turns an account of another chart into an SCF account (ECR-0243).
 */
export function parseEntriesFile(text, { mapping = {}, closedPeriods = [] } = {}) {
  const rawLines = String(text ?? '')
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '');
  if (rawLines.length < 2) return { lignes: 0, rejets: [{ line: 1, reason: 'empty' }], pieces: [], totaux: { debit: 0, credit: 0 }, valide: false };
  const separator = rawLines[0].includes(';') ? ';' : ',';
  const header = rawLines[0].split(separator).map((h) => h.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''));
  const index = Object.fromEntries(IMPORT_COLUMNS.map((c) => [c, header.indexOf(c)]));
  const missing = IMPORT_COLUMNS.filter((c) => index[c] < 0 && c !== 'libelle');
  if (missing.length) return { lignes: 0, rejets: [{ line: 1, reason: 'missingColumns', columns: missing }], pieces: [], totaux: { debit: 0, credit: 0 }, valide: false };
  const rejects = [];
  const pieces = new Map();
  rawLines.slice(1).forEach((raw, i) => {
    const line = i + 2;
    const cells = raw.split(separator).map((c) => c.trim());
    const journal = (cells[index.journal] ?? '').toUpperCase();
    const number = cells[index.piece] ?? '';
    const date = toDate(cells[index.date]);
    const source = cells[index.compte] ?? '';
    const account = mapping[source] ?? source;
    const debit = toCents(cells[index.debit]);
    const credit = toCents(cells[index.credit]);
    if (!LEDGER_JOURNALS.includes(journal)) return rejects.push({ line, reason: 'journal', value: journal });
    if (!number) return rejects.push({ line, reason: 'piece' });
    if (!date) return rejects.push({ line, reason: 'date', value: cells[index.date] });
    if (!isValidAccount(account)) return rejects.push({ line, reason: 'account', value: source });
    if (debit === null || credit === null || (debit > 0 && credit > 0) || debit + credit === 0) return rejects.push({ line, reason: 'amount' });
    if (closedPeriods.includes(date.toISOString().slice(0, 7))) return rejects.push({ line, reason: 'closedPeriod' });
    const key = `${journal}|${number}|${date.toISOString().slice(0, 10)}`;
    const piece = pieces.get(key) ?? { journal, number, date: date.toISOString().slice(0, 10), label: '', lines: [] };
    const label = index.libelle >= 0 ? (cells[index.libelle] ?? '').slice(0, 200) : '';
    if (!piece.label) piece.label = label || number;
    piece.lines.push({ account, label: label || null, debit, credit });
    pieces.set(key, piece);
  });
  const list = [...pieces.values()].map((p) => ({ ...p, ...entryTotals(p.lines) }));
  for (const p of list) if (!p.balanced) rejects.push({ line: null, reason: 'unbalanced', piece: p.number, ecart: p.debit - p.credit });
  const totals = list.reduce((t, p) => ({ debit: t.debit + p.debit, credit: t.credit + p.credit }), { debit: 0, credit: 0 });
  return { lignes: rawLines.length - 1, rejets: rejects, pieces: list, totaux: { ...totals, ecart: totals.debit - totals.credit }, valide: rejects.length === 0 && list.length > 0 };
}

/** Reads a chart of accounts of another software (code;libelle) for the mapping (ECR-0243). */
export function parseChartFile(text) {
  const lines = String(text ?? '')
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .filter((l) => l.trim() !== '');
  const separator = lines[0]?.includes(';') ? ';' : ',';
  const rows = [];
  lines.forEach((raw, i) => {
    const [code, ...rest] = raw.split(separator).map((c) => c.trim());
    if (i === 0 && !/\d/.test(code ?? '')) return; // header
    if (code) rows.push({ sourceCode: code.slice(0, 20), sourceLabel: rest.join(' ').slice(0, 200) || code });
  });
  return rows;
}

/** A suggestion for an account of another chart: its own code when it is already an SCF account. */
export const suggestAccount = (sourceCode) => (isValidAccount(sourceCode) ? sourceCode : null);
