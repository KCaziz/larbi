import { prisma } from '../config/prisma.js';
import { accountsWithBalances } from '../services/finAccount.service.js';
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
  netWorthHistory,
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

// The history behind the patrimony's net-worth curve (P6-23). Same currency
// default as `getWealth`, so a caller who never passes `?currency=` sees the
// series line up with the figure it leads to.
export async function getWealthHistory(req, res) {
  const currency = req.query.currency ?? req.user.finCurrency;
  res.json({ currency, points: await netWorthHistory(prisma, req.user.id, currency) });
}

export async function getWealth(req, res) {
  const currency = req.query.currency ?? req.user.finCurrency;
  const [declared, debts, { accounts }] = await Promise.all([listAssets(prisma, req.user.id), listDebts(prisma, req.user.id), accountsWithBalances(prisma, req.user.id)]);
  const { assets, liabilities } = wealthFromAccounts({ declared, debts, accounts });
  const view = buildWealthView({
    assets,
    debts: liabilities,
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

  res.json({ patrimoine: view, formulas: ['PB-F024', 'F036', 'F037'].map(describeFormula) });
}

// The kinds of declared asset an account now stands for: once the person has
// accounts, cash and bank balances come from them, never typed a second time.
const LIQUID_DECLARED = ['cash', 'account', 'ccp'];
const LIQUIDITY_OF = { liquid: 'liquid', savings: 'liquid', investment: 'semi_liquid', receivable: 'illiquid', configurable: 'semi_liquid' };

/**
 * The patrimony of P8-14 (PB-F003, PB-F024), without counting anything twice:
 * - the liquidities come AUTOMATICALLY from the accounts counted in the net
 *   worth (their balance, PB-F001); a declared cash or bank asset is then
 *   left out, the account already holds it;
 * - the other classes (real estate, gold, vehicle, business, real
 *   investments) stay declared and dated;
 * - the liabilities are the debts, plus the liability accounts (cards,
 *   loans) — a debt carried by an account is counted once, through it;
 * - a receivable (« J'ai prêté ») is an ASSET, never a liability.
 */
export function wealthFromAccounts({ declared, debts, accounts, now = new Date() }) {
  const open = accounts.filter((account) => !account.archivedAt && account.includeInNetWorth);
  const hasAccounts = open.length > 0;
  const fromAccounts = open
    .filter((account) => !account.liability && account.solde.resultat !== null && account.solde.resultat > 0)
    .map((account) => ({
      id: `account:${account.id}`,
      label: account.label,
      kind: account.nature === 'receivable' ? 'receivable' : account.nature === 'investment' ? 'investment' : 'account',
      liquidity: LIQUIDITY_OF[account.nature] ?? 'liquid',
      value: account.solde.resultat,
      currency: account.currency,
      valuedAt: now,
      categoryId: null,
      status: 'real',
      fromAccount: true,
    }));
  const liabilityAccounts = open
    .filter((account) => account.liability && account.solde.resultat !== null && account.solde.resultat > 0)
    .map((account) => ({ id: `account:${account.id}`, outstandingPrincipal: account.solde.resultat, currency: account.currency }));

  const assets = [...fromAccounts, ...declared.filter((asset) => !(hasAccounts && LIQUID_DECLARED.includes(asset.kind)))];
  // A receivable without its own account is still an asset.
  for (const debt of debts.filter((row) => row.direction === 'lent' && !row.accountId && row.outstandingPrincipal > 0)) {
    assets.push({ id: `receivable:${debt.id}`, label: debt.label, kind: 'receivable', liquidity: 'illiquid', value: debt.outstandingPrincipal, currency: debt.currency, valuedAt: now, categoryId: null, status: 'real' });
  }
  const liabilities = [...debts.filter((row) => row.direction !== 'lent' && !row.accountId), ...liabilityAccounts];
  return { assets, liabilities };
}
