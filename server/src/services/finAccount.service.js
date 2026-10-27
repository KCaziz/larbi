// Accounts and transfers (P8-03, ARC-04): « les comptes sont la source de
// vérité des soldes ». A balance is never stored — it is PB-F001, computed
// from the opening balance and the realised movements, so it cannot drift from
// them. A transfer is two linked movements written in ONE database
// transaction, and it is neither income nor spending (PB-F004, PB-F005).
import { randomUUID } from 'node:crypto';
import { ACCOUNT_TYPES, CASH_ACCOUNT_TYPE, accountType, isLiability } from '../constants/finAccounts.js';
import { TRANSFER_KINDS } from '../constants/finMoney.js';
import { HttpError } from '../utils/httpError.js';
import { computed } from './finance/contract.js';
import { recordChange, recordCorrection } from './finChange.service.js';

export const ACCOUNT_ENTITY = 'account';
export const TRANSFER_ENTITY = 'transfer';

const ACCOUNT_SELECT = {
  id: true,
  label: true,
  type: true,
  currency: true,
  openingBalance: true,
  openingDate: true,
  includeInTotal: true,
  includeInNetWorth: true,
  color: true,
  icon: true,
  minBalanceAlert: true,
  maxBalanceInfo: true,
  overdraftAllowed: true,
  note: true,
  status: true,
  version: true,
  archivedAt: true,
};

export function listAccounts(prisma, userId, { includeArchived = false } = {}) {
  return prisma.finAccount.findMany({
    where: { userId, deletedAt: null, ...(includeArchived ? {} : { archivedAt: null }) },
    select: ACCOUNT_SELECT,
    orderBy: [{ archivedAt: 'asc' }, { createdAt: 'asc' }],
  });
}

export async function ownAccount(prisma, userId, id) {
  const row = await prisma.finAccount.findFirst({ where: { id, userId, deletedAt: null }, select: ACCOUNT_SELECT });
  if (!row) throw new HttpError(404, 'Account not found');
  return row;
}

// An account a NEW movement may be written on: this person's, open, and in the
// movement's own currency — the engine never converts implicitly.
export async function usableAccount(prisma, userId, id, currency) {
  const account = await ownAccount(prisma, userId, id);
  if (account.archivedAt) throw new HttpError(422, 'Archived account', { reason: 'archivedAccount' });
  if (account.currency !== currency) throw new HttpError(422, 'Currency differs from the account', { reason: 'accountCurrency' });
  return account;
}

export async function createAccount(prisma, userId, body) {
  const type = accountType(body.type);
  return prisma.$transaction(async (tx) => {
    const created = await tx.finAccount.create({
      data: {
        userId,
        label: body.label,
        type: body.type,
        currency: body.currency,
        openingBalance: body.openingBalance ?? 0,
        openingDate: body.openingDate ?? new Date(),
        // « Selon type » (onglet 04B): the type's default unless chosen.
        includeInTotal: body.includeInTotal ?? type.includeInTotal,
        includeInNetWorth: body.includeInNetWorth ?? type.includeInNetWorth,
        color: body.color ?? null,
        icon: body.icon ?? null,
        minBalanceAlert: body.minBalanceAlert ?? null,
        maxBalanceInfo: body.maxBalanceInfo ?? null,
        overdraftAllowed: body.overdraftAllowed ?? null,
        note: body.note ?? null,
        source: 'manual',
        status: 'declared',
      },
      select: ACCOUNT_SELECT,
    });
    await recordChange(tx, { userId, entity: ACCOUNT_ENTITY, entityId: created.id, action: 'create', after: { type: created.type, label: created.label } });
    return created;
  });
}

export async function updateAccount(prisma, userId, id, body) {
  const before = await ownAccount(prisma, userId, id);
  const { reason, ...fields } = body;
  return prisma.$transaction(async (tx) => {
    const after = await tx.finAccount.update({ where: { id }, data: { ...fields, version: { increment: 1 } }, select: ACCOUNT_SELECT });
    await recordCorrection(tx, { userId, entity: ACCOUNT_ENTITY, entityId: id, before, after, reason: reason ?? null });
    return after;
  });
}

// « Compte archivé conservé dans historique » (onglet 04B): archived, never
// erased — its movements stay readable and its balance stays computable.
export async function setAccountArchived(prisma, userId, id, archived, { reason } = {}) {
  await ownAccount(prisma, userId, id);
  return prisma.$transaction(async (tx) => {
    const after = await tx.finAccount.update({ where: { id }, data: { archivedAt: archived ? new Date() : null }, select: ACCOUNT_SELECT });
    await recordChange(tx, { userId, entity: ACCOUNT_ENTITY, entityId: id, action: archived ? 'archive' : 'restore', field: 'archivedAt', after: archived, reason: reason ?? null });
    return after;
  });
}

/**
 * The account a movement goes on when none was chosen: the person's open
 * « Espèces » account in that currency, created if there is none yet
 * (PB-PR-04). Runs inside the caller's transaction, so the movement and its
 * account are written together or not at all.
 */
export async function ensureCashAccount(tx, userId, currency) {
  const existing = await tx.finAccount.findFirst({
    where: { userId, currency, type: CASH_ACCOUNT_TYPE, deletedAt: null, archivedAt: null },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });
  if (existing) return existing.id;
  const type = accountType(CASH_ACCOUNT_TYPE);
  const created = await tx.finAccount.create({
    data: {
      userId,
      label: type.label,
      type: CASH_ACCOUNT_TYPE,
      currency,
      includeInTotal: type.includeInTotal,
      includeInNetWorth: type.includeInNetWorth,
      source: 'computed',
      status: 'declared',
    },
    select: { id: true },
  });
  return created.id;
}

// ---- balances ----------------------------------------------------------------

// What moves an account's balance: realised movements only (« seul Réalisé
// affecte les soldes réels »), from its opening date.
const SIGNS = { income: 1, transfer_in: 1, expense: -1, transfer_out: -1 };

/**
 * PB-F001 for one account, from its grouped movements: opening balance +
 * credits − debits + transfers in − transfers out.
 *
 * A liability (credit card, loan) reads the other way round (PB-F027): its
 * balance is what is OWED, so a purchase on the card raises it and a
 * repayment brings it down.
 */
export function accountBalance(account, groups) {
  const flow = groups.reduce((sum, group) => sum + (SIGNS[group.kind] ?? 0) * (group._sum.value ?? 0), 0);
  return isLiability(account.type) ? account.openingBalance - flow : account.openingBalance + flow;
}

/**
 * Every open account with its balance, and the two totals of screen COM-01:
 * PB-F002 (cash available: included accounts that are assets) and PB-F003
 * (net position: assets in the patrimony minus liabilities). Several
 * currencies are never added together: a total is then computed per currency.
 */
export async function accountsWithBalances(prisma, userId, { includeArchived = false, now = new Date() } = {}) {
  const accounts = await listAccounts(prisma, userId, { includeArchived });
  const groups =
    accounts.length === 0
      ? []
      : await prisma.finTransaction.groupBy({
          by: ['accountId', 'kind'],
          where: { userId, deletedAt: null, status: 'real', planned: false, accountId: { in: accounts.map((a) => a.id) }, occurredAt: { lte: now } },
          _sum: { value: true },
        });

  const rows = accounts.map((account) => {
    const own = groups.filter((group) => group.accountId === account.id);
    const type = accountType(account.type);
    const balance = accountBalance(account, own);
    return {
      ...account,
      nature: type.nature,
      liability: isLiability(account.type),
      alertes: accountAlerts(account, balance),
      color: account.color ?? type.color,
      icon: account.icon ?? type.icon,
      solde: computed('PB-F001', balance, {
        inputs: { compte: account.id, solde_initial: account.openingBalance, date_solde_initial: account.openingDate },
        currency: account.currency,
        now,
      }),
    };
  });

  const currencies = [...new Set(rows.filter((row) => !row.archivedAt).map((row) => row.currency))];
  const totals = currencies.map((currency) => {
    const open = rows.filter((row) => !row.archivedAt && row.currency === currency);
    const value = (row) => row.solde.resultat;
    const cash = open.filter((row) => row.includeInTotal && !isLiability(row.type));
    const assets = open.filter((row) => row.includeInNetWorth && !isLiability(row.type));
    const liabilities = open.filter((row) => row.includeInNetWorth && isLiability(row.type));
    const sum = (list) => list.reduce((acc, row) => acc + value(row), 0);
    return {
      currency,
      soldeTotal: computed('PB-F002', cash.length === 0 ? null : sum(cash), { inputs: { comptes: cash.length }, currency, now }),
      positionNette: computed('PB-F003', assets.length + liabilities.length === 0 ? null : sum(assets) - sum(liabilities), {
        inputs: { actifs: assets.length, passifs: liabilities.length },
        currency,
        now,
      }),
    };
  });

  return { accounts: rows, totals, types: ACCOUNT_TYPES, suggestions: await accountSuggestions(prisma, userId, accounts) };
}

/**
 * The alerts of one account (AL-P02, AL-P03): below the threshold the person
 * chose, and in the red. Said in words by the interface, never by colour
 * alone. A liability is a debt: being « negative » means nothing for it.
 */
export function accountAlerts(account, balance) {
  if (isLiability(account.type) || account.archivedAt) return [];
  const alerts = [];
  if (balance < 0) {
    // Beyond the overdraft the bank allows, or simply in the red.
    const beyond = account.overdraftAllowed !== null && account.overdraftAllowed !== undefined && -balance > account.overdraftAllowed;
    alerts.push(beyond ? 'overdraftExceeded' : 'overdrawn');
  }
  if (account.minBalanceAlert !== null && account.minBalanceAlert !== undefined && balance < account.minBalanceAlert) alerts.push('belowMinimum');
  return alerts;
}

// The accounts the person already DECLARED in their real patrimony (P6-11)
// and has not created as accounts yet: offered, never created on their own.
const ASSET_KIND_TO_ACCOUNT = { cash: 'AC-01', account: 'AC-02', ccp: 'AC-03', investment: 'AC-06' };
async function accountSuggestions(prisma, userId, accounts) {
  const assets = await prisma.finAsset.findMany({
    where: { userId, deletedAt: null, archivedAt: null, kind: { in: Object.keys(ASSET_KIND_TO_ACCOUNT) }, status: { not: 'fictional' } },
    select: { id: true, label: true, kind: true, value: true, currency: true, valuedAt: true },
  });
  const taken = new Set(accounts.map((account) => account.label.toLocaleLowerCase('fr')));
  return assets
    .filter((asset) => !taken.has(asset.label.toLocaleLowerCase('fr')))
    .map((asset) => ({ assetId: asset.id, label: asset.label, type: ASSET_KIND_TO_ACCOUNT[asset.kind], currency: asset.currency, openingBalance: asset.value, openingDate: asset.valuedAt }));
}

/**
 * The balance of one account at the end of each of the last `months` months
 * (PB-F001 at each date): the curve of its detail screen (COM-03).
 */
export async function accountBalanceHistory(prisma, userId, id, { months = 6, now = new Date() } = {}) {
  const account = await ownAccount(prisma, userId, id);
  const ends = Array.from({ length: months }, (_, index) => {
    const monthsAgo = months - 1 - index;
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo + 1, 1) - 1);
    return end > now ? now : end;
  });
  const rows = await prisma.finTransaction.findMany({
    where: { userId, accountId: id, deletedAt: null, status: 'real', planned: false, occurredAt: { lte: now } },
    select: { kind: true, value: true, occurredAt: true },
  });
  const points = ends.map((end) => {
    const before = rows.filter((row) => row.occurredAt <= end);
    const groups = Object.entries(
      before.reduce((acc, row) => ({ ...acc, [row.kind]: (acc[row.kind] ?? 0) + row.value }), {}),
    ).map(([kind, value]) => ({ kind, _sum: { value } }));
    // Before the opening date the account did not exist: no point, not 0.
    return { month: end.toISOString().slice(0, 7), solde: end < account.openingDate ? null : accountBalance(account, groups) };
  });
  return { account: { id: account.id, label: account.label, currency: account.currency }, points };
}

// ---- transfers ---------------------------------------------------------------

/**
 * One transfer, written as two movements sharing one `transferId` (PB-PR-06),
 * in a single database transaction: either both sides exist or neither does.
 */
export async function createTransfer(prisma, userId, body) {
  if (body.fromAccountId === body.toAccountId) throw new HttpError(422, 'Same account', { reason: 'sameAccount' });
  const [from, to] = await Promise.all([ownAccount(prisma, userId, body.fromAccountId), ownAccount(prisma, userId, body.toAccountId)]);
  if (from.archivedAt || to.archivedAt) throw new HttpError(422, 'Archived account', { reason: 'archivedAccount' });
  // « Pas de conversion implicite »: a transfer between two currencies would
  // need a dated rate, which the engine never invents.
  if (from.currency !== to.currency) throw new HttpError(422, 'Accounts in different currencies', { reason: 'accountCurrency' });

  const planned = body.planned ?? false;
  // Only a planned transfer may be dated ahead: a realised one has happened.
  if (!planned && body.occurredAt.getTime() > Date.now()) throw new HttpError(422, 'Future date', { reason: 'futureDate' });
  const transferId = randomUUID();
  const side = (kind, accountId) => ({
    userId,
    kind,
    accountId,
    transferId,
    value: body.value,
    currency: from.currency,
    occurredAt: body.occurredAt,
    note: body.note ?? null,
    planned,
    source: 'manual',
    status: planned ? 'declared' : 'real',
  });

  // « Frais » (COM-04): a real expense on the source account, in the client's
  // « Frais de transfert » category — fees are spending, the transfer is not.
  const feeCategory = body.fee
    ? await prisma.finCategory.findFirst({ where: { key: 'variable.frais_de_transfert', userId: null, deletedAt: null }, select: { id: true } })
    : null;

  return prisma.$transaction(async (tx) => {
    await tx.finTransaction.create({ data: side('transfer_out', from.id) });
    await tx.finTransaction.create({ data: side('transfer_in', to.id) });
    if (body.fee) {
      await tx.finTransaction.create({
        data: {
          userId,
          kind: 'expense',
          accountId: from.id,
          value: body.fee,
          currency: from.currency,
          occurredAt: body.occurredAt,
          categoryId: feeCategory?.id ?? null,
          note: body.note ?? null,
          planned,
          source: 'manual',
          status: planned ? 'declared' : 'real',
        },
      });
    }
    await recordChange(tx, {
      userId,
      entity: TRANSFER_ENTITY,
      entityId: transferId,
      action: 'create',
      after: { from: from.id, to: to.id, value: body.value, currency: from.currency },
    });
    return { transferId, from: from.id, to: to.id, value: body.value, currency: from.currency, occurredAt: body.occurredAt, planned };
  });
}

// Both sides together, logically: deleting one side only would leave money
// that left an account and arrived nowhere.
export async function deleteTransfer(prisma, userId, transferId, { reason } = {}) {
  const sides = await prisma.finTransaction.findMany({ where: { userId, transferId, deletedAt: null, kind: { in: TRANSFER_KINDS } }, select: { id: true } });
  if (sides.length === 0) throw new HttpError(404, 'Transfer not found');
  await prisma.$transaction(async (tx) => {
    await tx.finTransaction.updateMany({ where: { userId, transferId }, data: { deletedAt: new Date() } });
    await recordChange(tx, { userId, entity: TRANSFER_ENTITY, entityId: transferId, action: 'delete', field: 'deletedAt', after: true, reason: reason ?? null });
  });
  return { transferId };
}
