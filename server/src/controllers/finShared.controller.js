import { prisma } from '../config/prisma.js';
import {
  BALANCE_SIGN,
  BALANCE_SIGN_TEXT,
  INCOME_SPLIT_REQUIRES_SHARING,
  PARTICIPANTS_MAX,
  PERCENT_SCALE,
  ROUNDING_RULE,
  ROUNDING_RULE_TEXT,
  SETTLEMENTS_ARE_DECLARATIVE,
  SPLIT_MODES,
} from '../constants/finShared.js';
import { listChanges } from '../services/finChange.service.js';
import {
  SETTLEMENT_ENTITY,
  SHARED_EXPENSE_ENTITY,
  confirmSharedRecurrence,
  createSettlement,
  createSharedExpense,
  deleteSettlement,
  deleteSharedExpense,
  detectSharedRecurrences,
  listSettlements,
  listSharedExpenses,
  loadSharedData,
} from '../services/finShared.service.js';
import { buildBalances, settlementPlan } from '../services/finSharedView.service.js';
import { ownMembership } from '../services/finSpace.service.js';
import { describeFormula } from '../services/finance/describe.js';

// Shared expenses and settlements (P6-14), screens P02 and P03.
//
// Every route is scoped to one space, and membership is checked by P6-13's own
// helpers: a space the caller is not in answers 404, never 403.

export function getSharedReferences(req, res) {
  res.json({
    splitModes: SPLIT_MODES,
    participantsMax: PARTICIPANTS_MAX,
    percentScale: PERCENT_SCALE,
    // The client asks for the rounding rule to be documented and for the sign
    // convention to be documented IN THE API. Both are published here, in
    // words, rather than left in a comment somebody would have to find.
    roundingRule: ROUNDING_RULE,
    roundingRuleText: ROUNDING_RULE_TEXT,
    balanceSign: BALANCE_SIGN,
    balanceSignText: BALANCE_SIGN_TEXT,
    // Said out loud: nothing here moves money.
    settlementsAreDeclarative: SETTLEMENTS_ARE_DECLARATIVE,
    // And the one thing the income split needs from P6-13's matrix.
    incomeSplitRequiresSharing: INCOME_SPLIT_REQUIRES_SHARING,
    formulas: ['F041', 'F042', 'F043', 'ALG-02'].map(describeFormula),
  });
}

// ---- shared expenses -------------------------------------------------------

export async function getSharedExpenses(req, res) {
  const result = await listSharedExpenses(prisma, req.user.id, req.params.id, req.query);
  // The names the screen needs, joined here so the interface never has to guess
  // who a member id is.
  const names = await memberNames(req.params.id);
  res.json({
    ...result,
    expenses: result.expenses.map((expense) => ({
      ...expense,
      payer: names.get(expense.payerId) ?? null,
      recordedBy: names.get(expense.recordedById) ?? null,
      shares: expense.shares.map((share) => ({ ...share, name: names.get(share.memberId) ?? null })),
    })),
  });
}

async function memberNames(spaceId) {
  const members = await prisma.finSpaceMember.findMany({
    where: { spaceId },
    select: { id: true, displayName: true, user: { select: { name: true } } },
  });
  return new Map(members.map((member) => [member.id, member.displayName ?? member.user.name]));
}

export async function postSharedExpense(req, res) {
  res.status(201).json({ expense: await createSharedExpense(prisma, req.user.id, req.params.id, req.body) });
}

export async function removeSharedExpense(req, res) {
  res.json(await deleteSharedExpense(prisma, req.user.id, req.params.id, req.params.expenseId, { reason: req.body?.reason }));
}

export async function getSharedExpenseHistory(req, res) {
  // Membership first, then the trail of that one expense.
  await ownMembership(prisma, req.user.id, req.params.id);
  const expense = await prisma.finSharedExpense.findFirst({ where: { id: req.params.expenseId, spaceId: req.params.id }, select: { id: true } });
  if (!expense) {
    res.status(404).json({ error: { message: 'Shared expense not found' } });
    return;
  }
  // The journal of a shared expense is the SPACE's history, not one account's:
  // any member may read it, which is why this does not filter by userId.
  const changes = await listChanges(prisma, { entity: SHARED_EXPENSE_ENTITY, entityId: req.params.expenseId });
  res.json({ changes });
}

// ---- settlements -----------------------------------------------------------

export async function getSettlements(req, res) {
  const result = await listSettlements(prisma, req.user.id, req.params.id, req.query);
  const names = await memberNames(req.params.id);
  res.json({
    ...result,
    settlements: result.settlements.map((settlement) => ({
      ...settlement,
      fromName: names.get(settlement.fromId) ?? null,
      toName: names.get(settlement.toId) ?? null,
      recordedBy: names.get(settlement.recordedById) ?? null,
    })),
  });
}

export async function postSettlement(req, res) {
  res.status(201).json({ settlement: await createSettlement(prisma, req.user.id, req.params.id, req.body) });
}

export async function removeSettlement(req, res) {
  res.json(await deleteSettlement(prisma, req.user.id, req.params.id, req.params.settlementId, { reason: req.body?.reason }));
}

export async function getSettlementHistory(req, res) {
  await ownMembership(prisma, req.user.id, req.params.id);
  const settlement = await prisma.finSettlement.findFirst({ where: { id: req.params.settlementId, spaceId: req.params.id }, select: { id: true } });
  if (!settlement) {
    res.status(404).json({ error: { message: 'Settlement not found' } });
    return;
  }
  const changes = await listChanges(prisma, { entity: SETTLEMENT_ENTITY, entityId: req.params.settlementId });
  res.json({ changes });
}

// ---- balances and the settlement plan --------------------------------------

/**
 * Who owes what, and the shortest way to settle it.
 *
 * Both in one answer, because they are one question: a list of balances
 * without "so who pays whom" leaves the person to work out the transfers by
 * hand, which is exactly what ALG-02 is for.
 */
export async function getBalances(req, res) {
  const me = await ownMembership(prisma, req.user.id, req.params.id);
  const { members, expenses, settlements } = await loadSharedData(prisma, req.params.id);
  const balances = buildBalances({ members, expenses, settlements, currency: me.space.currency });
  const plan = settlementPlan(balances, { currency: me.space.currency });

  const names = new Map(members.map((member) => [member.id, member.displayName ?? member.user?.name ?? null]));
  res.json({
    espace: me.space,
    // The convention, repeated in the answer itself: a reader must never have
    // to guess what the sign of a balance means.
    conventionSigne: { code: BALANCE_SIGN, texte: BALANCE_SIGN_TEXT },
    regleArrondi: { code: ROUNDING_RULE, texte: ROUNDING_RULE_TEXT },
    soldes: balances,
    plan: {
      ...plan,
      transferts:
        plan.transferts === null
          ? null
          : plan.transferts.map((transfer) => ({ ...transfer, fromName: names.get(transfer.from) ?? null, toName: names.get(transfer.to) ?? null })),
    },
    // Said in the answer, so no screen can present this as a payment button.
    reglementsDeclaratifs: SETTLEMENTS_ARE_DECLARATIVE,
  });
}

// ---- recurring common bills (P6-15) ----------------------------------------

export async function getSharedRecurrences(req, res) {
  res.json({ candidates: await detectSharedRecurrences(prisma, req.user.id, req.params.id) });
}

export async function postConfirmRecurrence(req, res) {
  res.status(201).json({ expense: await confirmSharedRecurrence(prisma, req.user.id, req.params.id, req.body) });
}
