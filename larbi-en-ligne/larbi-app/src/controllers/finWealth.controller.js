import { prisma } from '../config/prisma.js';
import {
  ASSET_KINDS,
  ASSET_LIQUIDITY,
  CONCENTRATION_NOTICE_SHARE,
  DEFAULT_LIQUIDITY,
  VALUATION_STALE_DAYS,
  WEALTH_STATUSES,
} from '../constants/finWealth.js';
import { listChanges } from '../services/finChange.service.js';
import { listDebts } from '../services/finDebt.service.js';
import {
  ASSET_ENTITY,
  buildWealthView,
  createAsset,
  deleteAsset,
  getAsset,
  listAssets,
  setAssetArchived,
  updateAsset,
  valuationHistory,
} from '../services/finWealth.service.js';
import { describeFormula } from '../services/finance/describe.js';

// Real patrimony (P6-11), screens C16 and JA07. Session required everywhere,
// and every read and write is scoped to the caller's own rows: what somebody
// owns is the most private figure in the platform.

export function getWealthReferences(req, res) {
  res.json({
    kinds: ASSET_KINDS,
    liquidity: ASSET_LIQUIDITY,
    defaultLiquidity: DEFAULT_LIQUIDITY,
    statuses: WEALTH_STATUSES,
    // Declared, not hidden: the client's own 90-day threshold, and the share
    // above which an educational note appears (ours).
    valuationStaleDays: VALUATION_STALE_DAYS,
    concentrationNoticeShare: CONCENTRATION_NOTICE_SHARE,
    // The client's sentence, published by the API so the interface can say it
    // rather than paraphrase it.
    fictionalForbidden: true,
    formulas: ['F035', 'F036', 'F037', 'F055'].map(describeFormula),
  });
}

export async function getAssets(req, res) {
  const assets = await listAssets(prisma, req.user.id, { includeArchived: req.query.includeArchived === 'true' });
  res.json({ assets });
}

export async function postAsset(req, res) {
  res.status(201).json({ asset: await createAsset(prisma, req.user.id, req.body) });
}

export async function patchAsset(req, res) {
  res.json({ asset: await updateAsset(prisma, req.user.id, req.params.id, req.body) });
}

export async function putAssetArchived(req, res) {
  const { archived, reason } = req.body;
  res.json({ asset: await setAssetArchived(prisma, req.user.id, req.params.id, archived, { reason }) });
}

export async function removeAsset(req, res) {
  res.json(await deleteAsset(prisma, req.user.id, req.params.id, { reason: req.body?.reason }));
}

export async function getAssetHistory(req, res) {
  // Ownership first: the trail of a row that is not the caller's is a 404.
  await getAsset(prisma, req.user.id, req.params.id);
  const changes = await listChanges(prisma, { userId: req.user.id, entity: ASSET_ENTITY, entityId: req.params.id });
  res.json({ changes });
}

// The valuation series, read from the correction journal rather than from a
// second table of the same facts.
export async function getAssetValuations(req, res) {
  res.json({ valuations: await valuationHistory(prisma, req.user.id, req.params.id) });
}

export async function getWealth(req, res) {
  const currency = req.query.currency ?? req.user.finCurrency;
  const [assets, debts] = await Promise.all([listAssets(prisma, req.user.id), listDebts(prisma, req.user.id)]);
  const view = buildWealthView({
    assets,
    // The liabilities of F035 come from P6-10, never from a second table here.
    debts,
    currency,
    staleDays: req.query.staleDays ?? VALUATION_STALE_DAYS,
    noticeShare: req.query.noticeShare ?? CONCENTRATION_NOTICE_SHARE,
  });

  // The labels the rows need, joined here so the interface never guesses what a
  // category is called.
  const ids = [...new Set(view.actifs.map((row) => row.categoryId).filter(Boolean))];
  const labels = new Map(
    (await prisma.finCategory.findMany({ where: { id: { in: ids } }, select: { id: true, label: true } })).map((row) => [row.id, row.label]),
  );
  view.actifs = view.actifs.map((row) => ({ ...row, categoryLabel: row.categoryId ? (labels.get(row.categoryId) ?? null) : null }));

  res.json({ patrimoine: view, formulas: ['F035', 'F036', 'F037'].map(describeFormula) });
}
