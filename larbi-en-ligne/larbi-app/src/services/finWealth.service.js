// Real patrimony (P6-11): screens C16 and JA07, F035 (« patrimoine net »), F036
// (« allocation actif ») and F037 (« concentration maximale »).
//
// Assets live here; the liabilities are read from `fin_debts` (P6-10), so net
// worth has one definition and not two.
//
// « Le fictif est interdit ici » runs through the whole file: a fictional row
// cannot be stored (CHECK + zod), and the view asserts it again before adding
// anything up — because the entire value of F035 is that the figure is real.

import { ASSET_KINDS, ASSET_LIQUIDITY, CONCENTRATION_NOTICE_SHARE, DEFAULT_LIQUIDITY, FORBIDDEN_WEALTH_STATUS, VALUATION_STALE_DAYS } from '../constants/finWealth.js';
import { HttpError } from '../utils/httpError.js';
import { recordChange, recordCorrection } from './finChange.service.js';
import { DEBT_ENTITY } from './finDebt.service.js';
import { computed } from './finance/contract.js';
import { isFictional } from './finance/dataModel.js';
import { assetAllocation, dataAgeDays, maxConcentration, netWorth } from './finance/formulas.js';
// The engine's adder (it refuses to mix currencies); the catalogue has no row
// for "Σ actifs", so the gross totals are descriptive data and say so.
import { sumAmounts } from './finance/money.js';

export const ASSET_ENTITY = 'asset';

const ASSET_SELECT = {
  id: true,
  label: true,
  kind: true,
  categoryId: true,
  value: true,
  currency: true,
  valuedAt: true,
  liquidity: true,
  holder: true,
  note: true,
  scope: true,
  source: true,
  status: true,
  confidence: true,
  consentUses: true,
  version: true,
  archivedAt: true,
};

// A category this account may point an asset at, like everywhere else in Phase
// 6: the client's reference or its own, never somebody else's.
async function usableCategory(prisma, userId, categoryId) {
  if (categoryId === null || categoryId === undefined) return null;
  const row = await prisma.finCategory.findFirst({
    where: { id: categoryId, deletedAt: null, OR: [{ userId: null }, { userId }] },
    select: { id: true, archivedAt: true },
  });
  if (!row) throw new HttpError(422, 'Unknown category', { reason: 'unknownCategory' });
  if (row.archivedAt) throw new HttpError(422, 'Archived category', { reason: 'archivedCategory' });
  return row.id;
}

// ---- writes ----------------------------------------------------------------

export function listAssets(prisma, userId, { includeArchived = false } = {}) {
  return prisma.finAsset.findMany({
    where: { userId, deletedAt: null, ...(includeArchived ? {} : { archivedAt: null }) },
    select: ASSET_SELECT,
    orderBy: { value: 'desc' },
  });
}

export async function createAsset(prisma, userId, body) {
  if (!ASSET_KINDS.includes(body.kind)) throw new HttpError(422, 'Unknown asset kind', { reason: 'unknownKind' });
  // The client's sentence, checked before anything is written and not only by
  // the database: the error says WHY, which a CHECK violation could not.
  if (body.status === FORBIDDEN_WEALTH_STATUS) {
    throw new HttpError(422, 'Real patrimony never holds a fictional value', { reason: 'fictionalForbidden' });
  }
  const liquidity = body.liquidity ?? DEFAULT_LIQUIDITY[body.kind] ?? 'semi_liquid';
  if (!ASSET_LIQUIDITY.includes(liquidity)) throw new HttpError(422, 'Unknown liquidity', { reason: 'unknownLiquidity' });
  if (body.valuedAt.getTime() > Date.now()) {
    throw new HttpError(422, 'A valuation cannot be dated in the future', { reason: 'futureValuation' });
  }
  const categoryId = await usableCategory(prisma, userId, body.categoryId ?? null);

  return prisma.$transaction(async (tx) => {
    const row = await tx.finAsset.create({
      data: {
        userId,
        label: body.label,
        kind: body.kind,
        categoryId,
        value: body.value,
        currency: body.currency,
        valuedAt: body.valuedAt,
        liquidity,
        holder: body.holder ?? null,
        note: body.note ?? null,
        scope: body.scope ?? 'personal',
        consentUses: body.consentUses ?? [],
        confidence: body.confidence ?? null,
        source: 'manual',
        // Declared by default: most of these are estimates (a car, a flat), and
        // the socle's `confidence` is what says how sure the figure is.
        status: body.status ?? 'declared',
      },
      select: ASSET_SELECT,
    });
    await recordChange(tx, {
      userId,
      entity: ASSET_ENTITY,
      entityId: row.id,
      action: 'create',
      after: { label: row.label, kind: row.kind, value: row.value, currency: row.currency, valuedAt: row.valuedAt },
    });
    return row;
  });
}

async function ownAsset(prisma, userId, id) {
  const row = await prisma.finAsset.findFirst({ where: { id, userId, deletedAt: null }, select: { ...ASSET_SELECT, userId: true } });
  if (!row) throw new HttpError(404, 'Asset not found');
  return row;
}

export async function updateAsset(prisma, userId, id, body) {
  const before = await ownAsset(prisma, userId, id);
  const { reason, ...fields } = body;
  if (fields.kind !== undefined && !ASSET_KINDS.includes(fields.kind)) throw new HttpError(422, 'Unknown asset kind', { reason: 'unknownKind' });
  if (fields.status === FORBIDDEN_WEALTH_STATUS) {
    throw new HttpError(422, 'Real patrimony never holds a fictional value', { reason: 'fictionalForbidden' });
  }
  if (fields.categoryId !== undefined) fields.categoryId = await usableCategory(prisma, userId, fields.categoryId);
  if (fields.valuedAt !== undefined && fields.valuedAt.getTime() > Date.now()) {
    throw new HttpError(422, 'A valuation cannot be dated in the future', { reason: 'futureValuation' });
  }
  // Correcting the AMOUNT without saying when it was valued would silently make
  // a stale figure look fresh, or a fresh one stale. The client's own field is
  // « valeur datée »: the two travel together.
  if (fields.value !== undefined && fields.valuedAt === undefined) {
    throw new HttpError(422, 'A new value needs the date it was established', { reason: 'valuationDateRequired' });
  }

  return prisma.$transaction(async (tx) => {
    const after = await tx.finAsset.update({ where: { id }, data: { ...fields, version: { increment: 1 } }, select: ASSET_SELECT });
    await recordCorrection(tx, { userId, entity: ASSET_ENTITY, entityId: id, before, after, reason: reason ?? null });
    return after;
  });
}

export async function setAssetArchived(prisma, userId, id, archived, { reason } = {}) {
  const before = await ownAsset(prisma, userId, id);
  const archivedAt = archived ? new Date() : null;
  return prisma.$transaction(async (tx) => {
    const after = await tx.finAsset.update({ where: { id }, data: { archivedAt }, select: ASSET_SELECT });
    await recordChange(tx, {
      userId,
      entity: ASSET_ENTITY,
      entityId: id,
      action: archived ? 'archive' : 'restore',
      field: 'archivedAt',
      before: before.archivedAt,
      after: archivedAt,
      reason: reason ?? null,
    });
    return after;
  });
}

export async function deleteAsset(prisma, userId, id, { reason } = {}) {
  await ownAsset(prisma, userId, id);
  await prisma.$transaction(async (tx) => {
    await tx.finAsset.update({ where: { id }, data: { deletedAt: new Date() } });
    await recordChange(tx, { userId, entity: ASSET_ENTITY, entityId: id, action: 'delete', field: 'deletedAt', after: true, reason: reason ?? null });
  });
  return { id };
}

export const getAsset = (prisma, userId, id) => ownAsset(prisma, userId, id);

// ---- the view (pure) -------------------------------------------------------

/**
 * The patrimony of one account.
 *
 * `assets` the account's own asset rows
 * `debts`  the account's own debt rows (P6-10) — read, never written here
 *
 * Mixed currencies are NOT converted: the engine has no dated rate, so a total
 * over several currencies answers `null` and says so, exactly as everywhere
 * else in Phase 6.
 */
export function buildWealthView({ assets = [], debts = [], currency, now = new Date(), staleDays = VALUATION_STALE_DAYS, noticeShare = CONCENTRATION_NOTICE_SHARE }) {
  const warnings = [];

  // Belt and braces. The database cannot store a fictional asset, but if one
  // ever reached here it would be silently added into net worth — the one
  // outcome the client's sentence forbids — so it is dropped and reported.
  const fictional = assets.filter(isFictional);
  if (fictional.length > 0) {
    warnings.push(`${fictional.length} ligne(s) fictive(s) sont exclues : le patrimoine réel n'en contient jamais.`);
  }
  const real = assets.filter((row) => !isFictional(row));

  const inCurrency = (rows) => rows.filter((row) => row.currency === currency);
  const usableAssets = inCurrency(real);
  const usableDebts = inCurrency(debts);
  const skipped = real.length - usableAssets.length + (debts.length - usableDebts.length);
  if (skipped > 0) {
    warnings.push(`${skipped} ligne(s) dans une autre devise ne sont pas comptées : convertir sans taux daté donnerait un chiffre faux.`);
  }

  // The entries F035 itself adds up. It takes the LISTS, not two totals: it
  // sums them with the engine's own adder, which is what refuses to mix
  // currencies.
  const assetEntries = usableAssets.map((row) => ({ amount: row.value, currency }));
  const debtEntries = usableDebts.map((row) => ({ amount: row.outstandingPrincipal, currency }));
  const totalAssets = assetEntries.length === 0 ? null : sumAmounts(assetEntries, { currency });
  const totalDebts = debtEntries.length === 0 ? null : sumAmounts(debtEntries, { currency });

  const inputs = {
    actifs: usableAssets.length,
    dettes: usableDebts.length,
    total_actifs: totalAssets,
    total_dettes: totalDebts,
    seuil_valeur_ancienne_jours: staleDays,
  };
  const answer = (id, result, extra = {}) => computed(id, result, { inputs, currency, warnings, now, ...extra });

  // F035 — « patrimoine net = Σ actifs réels − Σ dettes réelles ». With no
  // asset at all there is nothing to net: `null`, not zero. With assets and no
  // debt, owing nothing IS the right reading — the person owes nothing.
  const net = assetEntries.length === 0 ? null : netWorth({ assets: assetEntries, liabilities: debtEntries, currency });

  // F036 — the share of each asset. Sorted biggest first, which is how somebody
  // reads their own patrimony.
  const lines = usableAssets
    .map((row) => {
      const age = dataAgeDays(row.valuedAt, now);
      return {
        id: row.id,
        label: row.label,
        kind: row.kind,
        liquidity: row.liquidity,
        holder: row.holder ?? null,
        value: row.value,
        currency: row.currency,
        valuedAt: row.valuedAt,
        categoryId: row.categoryId,
        // F055 on the date the value was ESTABLISHED, and the client's own
        // 90-day threshold. A flat entered last year and re-valued last week is
        // fresh data.
        ageJours: age,
        valeurAncienne: age === null ? null : age > staleDays,
        allocation: computed('F036', assetAllocation(row.value, totalAssets), { inputs: { ...inputs, actif: row.id, valeur: row.value }, currency, now }),
      };
    })
    .sort((a, b) => b.value - a.value);

  // Per kind, which is the allocation the client's screen actually shows (one
  // line per "comptes / or / immobilier", not per row).
  const byKind = new Map();
  for (const row of usableAssets) byKind.set(row.kind, (byKind.get(row.kind) ?? 0) + row.value);
  const kinds = [...byKind.entries()]
    .map(([kind, total]) => ({
      kind,
      total,
      allocation: computed('F036', assetAllocation(total, totalAssets), { inputs: { ...inputs, type: kind, valeur: total }, currency, now }),
    }))
    .sort((a, b) => b.total - a.total);

  // By liquidity: what could actually be reached quickly. F014's own condition
  // requires the illiquid to be excluded, and this is where that becomes
  // visible instead of being a hidden assumption.
  const liquid = usableAssets.filter((row) => row.liquidity === 'liquid');
  const byLiquidity = Object.fromEntries(
    ASSET_LIQUIDITY.map((level) => {
      const rows = usableAssets.filter((row) => row.liquidity === level);
      return [level, rows.length === 0 ? null : rows.reduce((sum, row) => sum + row.value, 0)];
    }),
  );

  // F037 — the biggest share. Educational, and the client says so for the paper
  // portfolio: « message éducatif, pas une alarme ». Same restraint here — the
  // answer carries the share and whether it crossed the notice threshold, and
  // the wording that goes with it is the interface's, never a verdict.
  const shares = kinds.map((row) => row.allocation.resultat).filter((share) => share !== null);
  const concentration = shares.length === 0 ? null : maxConcentration(shares);

  const stale = lines.filter((line) => line.valeurAncienne === true);
  if (stale.length > 0) {
    warnings.push(`${stale.length} valeur(s) datent de plus de ${staleDays} jours : les remettre à jour rendrait le patrimoine plus juste.`);
  }

  return {
    currency,
    // The gross totals are NOT a formula of the client's catalogue: F035 is the
    // NET figure, and labelling a gross total with its id would misattribute
    // it. They are plain data, like the `repartition` of the synthesis.
    totalActifs: totalAssets,
    totalDettes: totalDebts,
    // F035 — « patrimoine net = Σ actifs réels − Σ dettes réelles ».
    // PB-F024 — the net worth from the accounts, completed by the other
    // declared assets (P8-14): the client's final rule.
    patrimoineNet: answer('PB-F024', net),
    actifs: lines,
    parType: kinds,
    parLiquidite: byLiquidity,
    // What could be reached quickly, stated apart: the figure F014 needs.
    disponibleRapidement: liquid.length === 0 ? null : liquid.reduce((sum, row) => sum + row.value, 0),
    concentrationMax: answer('F037', concentration),
    // A fact and a threshold, never an alarm.
    concentrationSignalee: concentration === null ? null : concentration >= noticeShare,
    seuilConcentration: noticeShare,
    valeursAnciennes: stale.map((line) => ({ id: line.id, label: line.label, ageJours: line.ageJours })),
    seuilValeurAncienneJours: staleDays,
    avertissements: warnings,
  };
}

// ---- history (P6-23) --------------------------------------------------------

// Replays one entity's change events into a running total, one point per
// event, in the given currency. An asset (or a debt) that is archived,
// deleted, or in another currency stops contributing from that point on —
// the same inclusion rule `buildWealthView` applies to the CURRENT figure,
// so the series and the live number can never tell two different stories.
function ledgerTotals(events, amountField, currency) {
  const rows = new Map(); // entityId -> { amount, currency, active }
  const contribution = new Map(); // entityId -> what it currently adds to `running`
  const points = [];
  let running = 0;

  for (const event of events) {
    const id = event.entityId;
    const row = rows.get(id) ?? { amount: 0, currency: null, active: true };

    if (event.action === 'create') {
      row.amount = event.after?.[amountField] ?? 0;
      row.currency = event.after?.currency ?? null;
      row.active = true;
    } else if (event.action === 'delete') {
      row.active = false;
    } else if (event.field === amountField) {
      row.amount = event.after ?? 0;
    } else if (event.field === 'currency') {
      row.currency = event.after ?? null;
    } else if (event.field === 'archivedAt') {
      // `restore` sets it back to null; `archive` sets a date. Either way the
      // row's OWN field name tells which, never the action string alone.
      row.active = event.after === null;
    }
    rows.set(id, row);

    const now = row.active && row.currency === currency ? row.amount : 0;
    const delta = now - (contribution.get(id) ?? 0);
    contribution.set(id, now);
    // A row that never touches THIS currency (or an edit that leaves its
    // contribution unchanged, e.g. a correction to an unrelated field) moves
    // nothing: no point is added, rather than one recording a total that
    // did not actually change.
    if (delta === 0) continue;
    running += delta;
    points.push({ at: event.createdAt, total: running });
  }
  return points;
}

/**
 * The patrimony's history (screen C16), ONE series built from the change
 * journal both `fin_assets` and `fin_debts` already keep (P6-02) — never a
 * new table recomputing the same facts a second time. Net worth is read as
 * of the END of each day it moved: a chart of every single edit would be
 * noise, not a history anyone reads.
 *
 * Mixed currencies are NOT converted, same rule as `buildWealthView`: a row
 * in another currency simply does not contribute until it is in this one.
 */
export async function netWorthHistory(prisma, userId, currency) {
  const changeWhere = (entity, amountField) => ({
    userId,
    entity,
    OR: [{ action: 'create' }, { action: 'delete' }, { field: amountField }, { field: 'currency' }, { field: 'archivedAt' }],
  });

  const [assetEvents, debtEvents] = await Promise.all([
    prisma.finChange.findMany({ where: changeWhere(ASSET_ENTITY, 'value'), orderBy: { createdAt: 'asc' } }),
    prisma.finChange.findMany({ where: changeWhere(DEBT_ENTITY, 'outstandingPrincipal'), orderBy: { createdAt: 'asc' } }),
  ]);

  const assetPoints = ledgerTotals(assetEvents, 'value', currency).map((point) => ({ ...point, kind: 'asset' }));
  const debtPoints = ledgerTotals(debtEvents, 'outstandingPrincipal', currency).map((point) => ({ ...point, kind: 'debt' }));
  const merged = [...assetPoints, ...debtPoints].sort((a, b) => a.at - b.at);

  let assetsTotal = 0;
  let debtsTotal = 0;
  // One point per DAY (the last that day moved), oldest first: a `Map` keeps
  // insertion order and overwriting the same key moves nothing, so the final
  // iteration order is already "one entry per day, in time order".
  const byDay = new Map();
  for (const point of merged) {
    if (point.kind === 'asset') assetsTotal = point.total;
    else debtsTotal = point.total;
    byDay.set(point.at.toISOString().slice(0, 10), assetsTotal - debtsTotal);
  }

  return [...byDay.entries()].map(([date, net]) => ({ date, net }));
}

/**
 * The valuation history of one asset — read from the correction journal.
 *
 * No second table: `fin_changes` already records every change of `value` with
 * its date, its before and its after (P6-02). A separate valuation series would
 * be the same facts stored twice, and the two would drift.
 */
export async function valuationHistory(prisma, userId, assetId) {
  await ownAsset(prisma, userId, assetId);
  const changes = await prisma.finChange.findMany({
    where: { userId, entity: ASSET_ENTITY, entityId: assetId, field: { in: ['value', 'valuedAt'] } },
    select: { field: true, before: true, after: true, reason: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  return changes;
}
