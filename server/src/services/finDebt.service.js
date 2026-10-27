// Debts (P6-10): the writes, the synthesis (F017-F019) and the avalanche /
// snowball comparison (ALG-01), screens C13-C14. Scoped to one account.
import { accountType } from '../constants/finAccounts.js';
import { createTransfer, ownAccount } from './finAccount.service.js';
import { debtPayoffPlan } from './finance/algorithms.js';
import { computed } from './finance/contract.js';
import { debtEffortRate, debtToAnnualIncome, monthlyDebtService, periodicRate } from './finance/formulas.js';
import { HttpError } from '../utils/httpError.js';
import { recordChange, recordCorrection } from './finChange.service.js';

export const DEBT_ENTITY = 'debt';
export const DEBT_PAYMENT_ENTITY = 'debtPayment';

const DEBT_SELECT = {
  id: true,
  label: true,
  lender: true,
  purpose: true,
  assetFinanced: true,
  outstandingPrincipal: true,
  monthlyInstalment: true,
  currency: true,
  rate: true,
  knownTotalCost: true,
  dueDate: true,
  direction: true,
  debtType: true,
  accountId: true,
  note: true,
  scope: true,
  source: true,
  status: true,
  confidence: true,
  consentUses: true,
  version: true,
  archivedAt: true,
};

export function listDebts(prisma, userId, { includeArchived = false } = {}) {
  return prisma.finDebt.findMany({
    where: { userId, deletedAt: null, ...(includeArchived ? {} : { archivedAt: null }) },
    select: DEBT_SELECT,
    orderBy: [{ archivedAt: 'asc' }, { outstandingPrincipal: 'desc' }],
  });
}

export async function ownDebt(prisma, userId, id) {
  const row = await prisma.finDebt.findFirst({ where: { id, userId, deletedAt: null }, select: { ...DEBT_SELECT, userId: true } });
  if (!row) throw new HttpError(404, 'Debt not found');
  return row;
}

export async function createDebt(prisma, userId, body) {
  return prisma.$transaction(async (tx) => {
    const debt = await tx.finDebt.create({
      data: {
        userId,
        label: body.label,
        lender: body.lender ?? null,
        purpose: body.purpose ?? null,
        assetFinanced: body.assetFinanced ?? null,
        outstandingPrincipal: body.outstandingPrincipal,
        monthlyInstalment: body.monthlyInstalment,
        currency: body.currency,
        rate: body.rate ?? null,
        knownTotalCost: body.knownTotalCost ?? null,
        dueDate: body.dueDate ?? null,
        direction: body.direction ?? 'owed',
        debtType: body.debtType ?? null,
        note: body.note ?? null,
        scope: body.scope ?? 'personal',
        consentUses: body.consentUses ?? [],
        source: 'manual',
        status: body.status ?? 'declared',
      },
      select: DEBT_SELECT,
    });
    await recordChange(tx, {
      userId,
      entity: DEBT_ENTITY,
      entityId: debt.id,
      action: 'create',
      after: { label: debt.label, outstandingPrincipal: debt.outstandingPrincipal, currency: debt.currency },
    });
    return debt;
  });
}

export async function updateDebt(prisma, userId, id, body) {
  const before = await ownDebt(prisma, userId, id);
  const { reason, ...fields } = body;
  return prisma.$transaction(async (tx) => {
    const after = await tx.finDebt.update({ where: { id }, data: { ...fields, version: { increment: 1 } }, select: DEBT_SELECT });
    await recordCorrection(tx, { userId, entity: DEBT_ENTITY, entityId: id, before, after, reason: reason ?? null });
    return after;
  });
}

export async function setDebtArchived(prisma, userId, id, archived, { reason } = {}) {
  const before = await ownDebt(prisma, userId, id);
  const archivedAt = archived ? new Date() : null;
  return prisma.$transaction(async (tx) => {
    const after = await tx.finDebt.update({ where: { id }, data: { archivedAt }, select: DEBT_SELECT });
    await recordChange(tx, { userId, entity: DEBT_ENTITY, entityId: id, action: archived ? 'archive' : 'restore', field: 'archivedAt', before: before.archivedAt, after: archivedAt, reason: reason ?? null });
    return after;
  });
}

export async function deleteDebt(prisma, userId, id, { reason } = {}) {
  await ownDebt(prisma, userId, id);
  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.finDebtPayment.updateMany({ where: { debtId: id, deletedAt: null }, data: { deletedAt: now } });
    await tx.finDebt.update({ where: { id }, data: { deletedAt: now } });
    await recordChange(tx, { userId, entity: DEBT_ENTITY, entityId: id, action: 'delete', field: 'deletedAt', after: true, reason: reason ?? null });
  });
  return { id };
}

// A payment pays the principal DOWN: it is a fact, logged, and it reduces
// `outstandingPrincipal` by the same transaction — the figure is never left to
// drift from the sum of what was actually paid.
export async function recordDebtPayment(prisma, userId, debtId, body) {
  const debt = await ownDebt(prisma, userId, debtId);
  if (body.currency !== debt.currency) throw new HttpError(422, "A payment must be in the debt's own currency", { reason: 'currencyMismatch' });
  const amount = Math.min(body.amount, debt.outstandingPrincipal);
  // P8-13: a debt carried by an account is repaid by a REAL transfer — from
  // the person's account to the loan, or, for a receivable, from the
  // receivable back to the person's account. The movement and the remaining
  // principal stay in step.
  if (debt.accountId && body.accountId) {
    const lent = debt.direction === 'lent';
    await createTransfer(prisma, userId, {
      fromAccountId: lent ? debt.accountId : body.accountId,
      toAccountId: lent ? body.accountId : debt.accountId,
      value: amount,
      occurredAt: body.paidAt,
      note: debt.label,
    });
  }
  return prisma.$transaction(async (tx) => {
    const payment = await tx.finDebtPayment.create({
      data: { userId, debtId, amount: body.amount, currency: body.currency, paidAt: body.paidAt, note: body.note ?? null },
    });
    const after = await tx.finDebt.update({ where: { id: debtId }, data: { outstandingPrincipal: debt.outstandingPrincipal - amount, version: { increment: 1 } }, select: DEBT_SELECT });
    await recordChange(tx, { userId, entity: DEBT_PAYMENT_ENTITY, entityId: payment.id, action: 'create', after: { debtId, amount: body.amount } });
    await recordCorrection(tx, { userId, entity: DEBT_ENTITY, entityId: debtId, before: debt, after, reason: 'paiement enregistré' });
    return { payment, debt: after };
  });
}

export function listDebtPayments(prisma, userId, debtId) {
  return prisma.finDebtPayment.findMany({ where: { debtId, userId, deletedAt: null }, orderBy: { paidAt: 'desc' } });
}

/**
 * The synthesis (F017-F019), screen C13: monthly service, effort rate — a
 * PEDAGOGICAL indicator, never a verdict — and debt-to-annual-income. The
 * qualification "productive / neutre / sous pression" the client asks for is
 * deliberately absent: its thresholds are still "à valider" (P6-01 point 5),
 * and showing one without them would be inventing a verdict.
 */
export function buildDebtSynthesis(debts, { netMonthlyIncome = null, currency, now = new Date() } = {}) {
  // What I owe only: a receivable (« J'ai prêté », D-01) is money owed TO me,
  // always kept apart (P8-13) and summed in `creances`.
  const receivables = debts.filter((debt) => debt.direction === 'lent' && debt.currency === currency);
  const active = debts.filter((debt) => debt.currency === currency && debt.direction !== 'lent');
  const warnings = debts.length !== active.length ? ["Des dettes dans une autre devise ne sont pas comptées : convertir sans taux daté donnerait un chiffre faux."] : [];
  const instalments = active.map((debt) => ({ amount: debt.monthlyInstalment, currency }));
  const inputs = { nombre_dettes: active.length };
  const answer = (id, result, extra = {}) => computed(id, result, { inputs, currency, warnings, now, ...extra });

  const service = monthlyDebtService(instalments, { currency });
  const annualIncome = netMonthlyIncome === null ? null : netMonthlyIncome * 12;
  return {
    serviceMenuel: answer('F017', service),
    // F018 is shown only once a monthly instalment has actually been declared
    // — a rate of 0 % would otherwise read as "no debt", an answer nobody gave.
    // PB-F020 — the client's final rule for the debt-to-income ratio.
    tauxEffort: active.length === 0 ? null : answer('PB-F020', debtEffortRate(service, netMonthlyIncome)),
    detteRevenuAnnuel: answer('F019', debtToAnnualIncome(active.reduce((sum, debt) => sum + debt.outstandingPrincipal, 0), annualIncome)),
    encours: active.reduce((sum, debt) => sum + debt.outstandingPrincipal, 0),
    creances: { nombre: receivables.length, encours: receivables.reduce((sum, debt) => sum + debt.outstandingPrincipal, 0) },
    avertissements: warnings,
  };
}

/**
 * ALG-01, the avalanche / snowball comparison the person asked to run. Only
 * debts with a KNOWN rate can enter it — a rate guessed from the instalment
 * would invent a number nobody declared, so the comparison simply excludes
 * what it cannot honestly simulate and says so.
 */
export function buildPayoffComparison(debts, { extraPayment = 0, currency, now = new Date() } = {}) {
  const usable = debts.filter((debt) => debt.direction !== 'lent' && debt.currency === currency && debt.rate !== null && debt.rate !== undefined && debt.outstandingPrincipal > 0 && debt.monthlyInstalment > 0);
  const excluded = debts.length - usable.length;
  const warnings = excluded > 0 ? [`${excluded} dette(s) sans taux connu ou sans mensualité ne peuvent pas entrer dans cette comparaison.`] : [];
  if (usable.length === 0) return { avalanche: null, bouleDeNeige: null, avertissements: [...warnings, 'Aucune dette avec un taux connu : rien à comparer.'] };

  const prepared = usable.map((debt) => ({ id: debt.id, principal: debt.outstandingPrincipal, monthlyRate: periodicRate(debt.rate, 12), minimumPayment: debt.monthlyInstalment }));
  const inputs = { dettes: prepared.map((d) => d.id), versement_supplementaire: extraPayment };
  const answer = (result) => computed('ALG-01', result, { inputs, currency, warnings, now });

  return {
    avalanche: answer(debtPayoffPlan({ debts: prepared, extraPayment, strategy: 'avalanche' })),
    bouleDeNeige: answer(debtPayoffPlan({ debts: prepared, extraPayment, strategy: 'snowball' })),
    avertissements: warnings,
  };
}

/**
 * A simple loan between people (P8-13, tab 09_Dettes): « J'ai prêté » (D-01,
 * a receivable) or « On m'a prêté » (D-02, a simple debt). The money really
 * moves the day it happens: it leaves the person's account towards a
 * receivable account (AC-09), or arrives on it from a loan account (AC-08).
 * Neither is income nor spending — it is a transfer — and the debt or the
 * receivable is then followed apart, on its own account.
 */
export async function createSimpleLoan(prisma, userId, body) {
  const lent = body.direction === 'lent';
  const personal = await ownAccount(prisma, userId, body.accountId);
  const typeId = lent ? 'AC-09' : 'AC-08';
  const type = accountType(typeId);
  const label = lent ? `Prêt à ${body.counterparty}` : `Prêt de ${body.counterparty}`;
  const account = await prisma.finAccount.create({
    data: {
      userId,
      label: label.slice(0, 80),
      type: typeId,
      currency: personal.currency,
      openingDate: body.occurredAt,
      includeInTotal: type.includeInTotal,
      includeInNetWorth: type.includeInNetWorth,
      source: 'manual',
      status: 'declared',
    },
    select: { id: true },
  });
  await createTransfer(prisma, userId, {
    fromAccountId: lent ? personal.id : account.id,
    toAccountId: lent ? account.id : personal.id,
    value: body.value,
    occurredAt: body.occurredAt,
    note: body.note ?? label,
  });
  return createDebt(prisma, userId, {
    label: label.slice(0, 80),
    lender: lent ? null : body.counterparty,
    outstandingPrincipal: body.value,
    monthlyInstalment: body.monthlyInstalment ?? 0,
    currency: personal.currency,
    dueDate: body.dueDate ?? null,
    note: body.note ?? null,
    direction: lent ? 'lent' : 'owed',
    debtType: lent ? 'D-01' : 'D-02',
    accountId: account.id,
  }).then(async (debt) => {
    await prisma.finDebt.update({ where: { id: debt.id }, data: { accountId: account.id } });
    return { ...debt, accountId: account.id };
  });
}
