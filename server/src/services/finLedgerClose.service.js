import { HttpError } from '../utils/httpError.js';
import { ASSET_CATEGORIES } from '../constants/finEmployerRules.js';
import { journal } from './finOrganization.service.js';
import { afterCut, createEntry, cutDate } from './finLedger.service.js';
import { depreciation, depreciationAccountOf, isValidAccount, matchBankLines, parseBankStatement, trialBalance } from './finLedgerView.js';

/**
 * P13-05, lot H (2026-11-24) — accounting, second part, on our default
 * choices: fixed assets and straight-line depreciation, fiscal year closing
 * (calendar year) with its opening entry, bank statements and matching.
 */

const lineInclude = { lines: { orderBy: { position: 'asc' } } };
const log = (tx, ctx, action, objectId, details = {}) => journal(tx, { businessId: ctx.business.id, actorId: ctx.member.userId, action, objectType: 'ledger', objectId, details });

// ---- fixed assets -------------------------------------------------------------------------

export async function listAssets(prisma, ctx, { year } = {}) {
  const y = Number(year) || new Date().getUTCFullYear();
  const assets = await prisma.finLedgerAsset.findMany({ where: { businessId: ctx.business.id }, orderBy: { acquiredAt: 'desc' } });
  const rows = assets.map((a) => ({ ...a, annee: y, ...depreciation(a, y) }));
  return {
    annee: y,
    categories: Object.fromEntries(Object.entries(ASSET_CATEGORIES).map(([k, v]) => [k, v.months])),
    immobilisations: rows,
    totaux: rows.reduce((t, r) => ({ cout: t.cout + r.cost, dotation: t.dotation + r.dotation, valeurNette: t.valeurNette + r.valeurNette }), { cout: 0, dotation: 0, valeurNette: 0 }),
  };
}

export async function createAsset(prisma, ctx, body) {
  const category = ASSET_CATEGORIES[body.category];
  const account = body.account ?? category.account;
  if (!isValidAccount(account) || !/^2[0-3]/.test(account)) throw new HttpError(422, 'A fixed asset account', { reason: 'notAssetAccount' });
  return prisma.$transaction(async (tx) => {
    const asset = await tx.finLedgerAsset.create({
      data: { businessId: ctx.business.id, label: body.label, category: body.category, account, acquiredAt: new Date(body.acquiredAt), cost: body.cost, durationMonths: body.durationMonths ?? category.months },
    });
    await log(tx, ctx, 'ledger.assetCreated', asset.id, { label: asset.label });
    return asset;
  });
}

export async function disposeAsset(prisma, ctx, id, { disposedAt }) {
  const asset = await prisma.finLedgerAsset.findFirst({ where: { id, businessId: ctx.business.id } });
  if (!asset) throw new HttpError(404, 'Asset not found', { reason: 'assetNotFound' });
  if (new Date(disposedAt) < new Date(asset.acquiredAt)) throw new HttpError(422, 'After the acquisition', { reason: 'datesOutOfOrder' });
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finLedgerAsset.update({ where: { id }, data: { disposedAt: new Date(disposedAt) } });
    await log(tx, ctx, 'ledger.assetDisposed', id);
    return updated;
  });
}

/** The depreciation entries of a year, as drafts dated 31 December: one per asset, never two. */
export async function proposeDepreciation(prisma, ctx, year) {
  const businessId = ctx.business.id;
  if (await prisma.finLedgerYear.findFirst({ where: { businessId, year } })) throw new HttpError(409, 'This year is closed', { reason: 'yearClosed' });
  const assets = await prisma.finLedgerAsset.findMany({ where: { businessId } });
  const known = new Set((await prisma.finLedgerEntry.findMany({ where: { businessId, sourceKey: { startsWith: 'dep:' } }, select: { sourceKey: true } })).map((e) => e.sourceKey));
  let created = 0;
  await prisma.$transaction(async (tx) => {
    for (const a of assets) {
      const key = `dep:${a.id}:${year}`;
      const { dotation } = depreciation(a, year);
      if (dotation <= 0 || known.has(key)) continue;
      const label = `Dotation ${year} ${a.label}`.slice(0, 200);
      await createEntry(
        prisma,
        ctx,
        {
          journal: 'OD',
          date: `${year}-12-31`,
          label,
          lines: [
            { account: '681', label, debit: dotation, credit: 0 },
            { account: depreciationAccountOf(a.account), label, debit: 0, credit: dotation },
          ],
        },
        { source: 'auto', sourceKey: key, tx },
      );
      created += 1;
    }
  });
  return { creees: created };
}

// ---- fiscal year closing --------------------------------------------------------------------

/**
 * Closes a calendar year: every entry of the year validated, the 12 months
 * closed, and the opening entry of the next year (AN, 1 January) carrying the
 * balances of classes 1 to 5 and the result (120 profit, 129 loss), validated.
 */
export async function closeYear(prisma, ctx, year) {
  const businessId = ctx.business.id;
  if (await prisma.finLedgerYear.findFirst({ where: { businessId, year } })) throw new HttpError(409, 'Already closed', { reason: 'yearClosed' });
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year, 11, 31));
  const drafts = await prisma.finLedgerEntry.count({ where: { businessId, status: 'draft', date: { gte: start, lte: end } } });
  if (drafts > 0) throw new HttpError(409, 'Drafts remain in this year', { reason: 'draftsRemain', drafts });
  const entries = afterCut(await prisma.finLedgerEntry.findMany({ where: { businessId, status: 'validated', date: { lte: end } }, include: lineInclude }), await cutDate(prisma, businessId, end));
  const balance = trialBalance(entries, { to: end.toISOString() });
  const carried = balance.comptes.filter((r) => /^[1-5]/.test(r.code) && Math.round(r.closing) !== 0);
  const result = -balance.comptes.filter((r) => /^[67]/.test(r.code)).reduce((sum, r) => sum + r.closing, 0);
  const label = `À-nouveaux ${year + 1}`;
  const lines = carried.map((r) => ({ account: r.code, label, debit: r.closing > 0 ? r.closing : 0, credit: r.closing < 0 ? -r.closing : 0 }));
  if (Math.round(result) !== 0) lines.push({ account: result > 0 ? '120' : '129', label: `Résultat ${year}`, debit: result < 0 ? -result : 0, credit: result > 0 ? result : 0 });
  return prisma.$transaction(async (tx) => {
    for (let m = 1; m <= 12; m += 1) {
      const period = `${year}-${String(m).padStart(2, '0')}`;
      await tx.finLedgerPeriod.upsert({
        where: { businessId_period: { businessId, period } },
        update: { status: 'closed', closedById: ctx.member.userId, closedAt: new Date() },
        create: { businessId, period, status: 'closed', closedById: ctx.member.userId, closedAt: new Date() },
      });
    }
    if (lines.length >= 2) {
      const entry = await createEntry(prisma, ctx, { journal: 'AN', number: `AN-${year + 1}`, date: `${year + 1}-01-01`, label, lines }, { source: 'auto', sourceKey: `an:${year}`, tx });
      await tx.finLedgerEntry.update({ where: { id: entry.id }, data: { status: 'validated', validatedById: ctx.member.userId, validatedAt: new Date() } });
    }
    const closed = await tx.finLedgerYear.create({ data: { businessId, year, result, closedById: ctx.member.userId } });
    await log(tx, ctx, 'ledger.yearClosed', closed.id, { year, result });
    return closed;
  });
}

// ---- bank statements and matching -----------------------------------------------------------------

async function bookLines(prisma, businessId, account) {
  const entries = await prisma.finLedgerEntry.findMany({ where: { businessId, status: 'validated', lines: { some: { account: { startsWith: account } } } }, include: { lines: { include: { bankLine: { select: { id: true } } } } } });
  return entries.flatMap((e) => e.lines.filter((l) => l.account.startsWith(account)).map((l) => ({ id: l.id, date: e.date, number: e.number, label: l.label ?? e.label, debit: l.debit, credit: l.credit, matched: Boolean(l.bankLine) })));
}

export async function bankView(prisma, ctx, { account = '512' } = {}) {
  const businessId = ctx.business.id;
  const [statement, books] = await Promise.all([
    prisma.finLedgerBankLine.findMany({ where: { businessId, account }, orderBy: { date: 'desc' }, take: 500 }),
    bookLines(prisma, businessId, account),
  ]);
  const byId = new Map(books.map((b) => [b.id, b]));
  return {
    compte: account,
    releve: statement.map((s) => ({ ...s, ecriture: s.matchedLineId ? (byId.get(s.matchedLineId) ?? null) : null })),
    nonPointees: books.filter((b) => !b.matched).sort((a, b) => new Date(b.date) - new Date(a.date)),
    resume: { lignesReleve: statement.length, pointees: statement.filter((s) => s.matchedLineId).length, ecrituresNonPointees: books.filter((b) => !b.matched).length },
  };
}

/** Imports a statement (lines already imported are skipped), then matches what it can. */
export async function importBankStatement(prisma, ctx, { account, content }) {
  if (!/^5/.test(account) || !isValidAccount(account)) throw new HttpError(422, 'A bank or cash account', { reason: 'notCashAccount' });
  const { lignes, rejets } = parseBankStatement(content);
  if (lignes.length === 0) throw new HttpError(422, 'Nothing to read', { reason: 'emptyFile', rejets });
  const businessId = ctx.business.id;
  const keys = lignes.map((l) => `${account}|${l.key}`.slice(0, 120));
  const known = new Set((await prisma.finLedgerBankLine.findMany({ where: { businessId, importKey: { in: keys } }, select: { importKey: true } })).map((k) => k.importKey));
  let created = 0;
  await prisma.$transaction(async (tx) => {
    for (const [i, l] of lignes.entries()) {
      if (known.has(keys[i])) continue;
      await tx.finLedgerBankLine.create({ data: { businessId, account, date: l.date, label: l.label, amount: l.amount, importKey: keys[i] } });
      created += 1;
    }
    await log(tx, ctx, 'ledger.statementImported', businessId, { account, created });
  });
  const matched = await autoMatch(prisma, ctx, account);
  return { importees: created, dejaPresentes: lignes.length - created, rejets, pointees: matched.pointees };
}

export async function autoMatch(prisma, ctx, account) {
  const businessId = ctx.business.id;
  const statement = await prisma.finLedgerBankLine.findMany({ where: { businessId, account, matchedLineId: null }, orderBy: { date: 'asc' } });
  const free = (await bookLines(prisma, businessId, account)).filter((b) => !b.matched);
  const pairs = matchBankLines(statement, free);
  await prisma.$transaction(async (tx) => {
    for (const [statementId, lineId] of pairs) await tx.finLedgerBankLine.update({ where: { id: statementId }, data: { matchedLineId: lineId } });
  });
  return { pointees: pairs.length };
}

/** Matches (or unmatches, with null) one statement line by hand. */
export async function matchBankLine(prisma, ctx, id, { lineId }) {
  const line = await prisma.finLedgerBankLine.findFirst({ where: { id, businessId: ctx.business.id } });
  if (!line) throw new HttpError(404, 'Statement line not found', { reason: 'bankLineNotFound' });
  if (lineId) {
    const book = (await bookLines(prisma, ctx.business.id, line.account)).find((b) => b.id === lineId);
    if (!book) throw new HttpError(404, 'Line of the books not found', { reason: 'entryNotFound' });
    if (book.matched) throw new HttpError(409, 'Already matched', { reason: 'alreadyMatched' });
  }
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finLedgerBankLine.update({ where: { id }, data: { matchedLineId: lineId ?? null } });
    await log(tx, ctx, lineId ? 'ledger.matched' : 'ledger.unmatched', id);
    return updated;
  });
}
