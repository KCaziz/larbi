// The correction trail (P6-02): « suppression logique et correction traçable
// lorsqu'une donnée alimente un historique ».
//
// Every financial object of Phase 6 writes here, in the same transaction as the
// change itself, so a row and the reason it looks like that can never be out of
// step. Nothing is ever erased in place: a value is corrected and the previous
// one stays readable in `before`.

import { CHANGE_ACTIONS } from '../constants/finData.js';

// The fields whose change is worth keeping, per entity. A field nobody declared
// is not journalled: that is how a future table says what matters, instead of
// dumping whole rows (which would also copy data the trail does not need).
export const JOURNALLED_FIELDS = {
  category: ['family', 'label', 'essential', 'scope', 'consentUses', 'archivedAt', 'deletedAt'],
  // "Mon argent" (P6-04). The amount, the date and the category are what a
  // person actually corrects, and what an old total was built from.
  income: ['label', 'categoryId', 'value', 'currency', 'frequency', 'startDate', 'endDate', 'scope', 'consentUses', 'archivedAt', 'deletedAt'],
  // Accounts (P8-03): what changes a balance or where it is counted.
  account: ['label', 'type', 'openingBalance', 'openingDate', 'includeInTotal', 'includeInNetWorth', 'overdraftAllowed', 'archivedAt', 'deletedAt'],
  tag: ['name', 'color', 'autoCategoryId', 'archivedAt', 'deletedAt'],
  transaction: [
    'kind',
    'accountId',
    'tagId',
    'payer',
    'place',
    'clearing',
    'value',
    'currency',
    'occurredAt',
    'categoryId',
    'subcategory',
    'paymentMethod',
    'note',
    'shared',
    'planned',
    'receiptId',
    'scope',
    'consentUses',
    'archivedAt',
    'deletedAt',
  ],
  // The onboarding keeps its answers in one JSON column, so what is worth
  // journalling is that the answers changed, and whether it went fictional.
  onboarding: ['answers', 'fictional', 'currency', 'completedAt'],
  // Budgets and envelopes (P6-05). A budget's PERIOD is journalled as much as
  // its amounts: moving a period changes which movements a figure was built
  // from, which is exactly what a trail is for.
  budget: ['label', 'periodStart', 'periodEnd', 'currency', 'recurrence', 'alertThresholds', 'note', 'scope', 'consentUses', 'archivedAt', 'deletedAt'],
  envelope: ['categoryId', 'kind', 'value', 'currency', 'cap', 'recurring', 'note', 'scope', 'consentUses', 'archivedAt', 'deletedAt'],
  // Calendar and recurring expenses (P6-07). The DATE is journalled as much as
  // the amount: moving a due date changes which period a figure belongs to.
  recurrence: ['label', 'categoryId', 'kind', 'value', 'currency', 'frequency', 'nextDate', 'endDate', 'reminderDays', 'note', 'scope', 'consentUses', 'archivedAt', 'deletedAt'],
  provision: ['label', 'categoryId', 'value', 'currency', 'provisioned', 'targetDate', 'reminderDays', 'note', 'scope', 'consentUses', 'archivedAt', 'deletedAt'],
  // Goals (P6-08) and debts (P6-10). Both services already call
  // recordCorrection, but without their fields declared here `diffFields`
  // returned an empty list and NOTHING was traced: a corrected target or a
  // changed outstanding balance left no trail at all, which is the one thing
  // P6-02 requires of a figure that feeds a history.
  goal: ['label', 'target', 'currency', 'targetDate', 'allocated', 'monthlyContribution', 'rate', 'priority', 'note', 'scope', 'consentUses', 'archivedAt', 'deletedAt'],
  debt: [
    'label',
    'lender',
    'purpose',
    'assetFinanced',
    'outstandingPrincipal',
    'monthlyInstalment',
    'currency',
    'rate',
    'knownTotalCost',
    'dueDate',
    'note',
    'scope',
    'consentUses',
    'archivedAt',
    'deletedAt',
  ],
  debtPayment: ['amount', 'currency', 'paidAt', 'note', 'deletedAt'],
  // Real patrimony (P6-11). `valuedAt` is journalled next to `value`, which is
  // what makes the valuation history readable from the trail instead of from a
  // second table of the same facts.
  asset: ['label', 'kind', 'categoryId', 'value', 'currency', 'valuedAt', 'liquidity', 'holder', 'note', 'scope', 'consentUses', 'confidence', 'status', 'archivedAt', 'deletedAt'],
};

// What actually changed between two versions of a row, field by field. Values
// are compared by their JSON form so an array (consentUses) and a date behave
// like any other value.
export function diffFields(entity, before, after) {
  const fields = JOURNALLED_FIELDS[entity] ?? [];
  const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
  return fields
    .filter((field) => !same(before?.[field], after?.[field]))
    .map((field) => ({ field, before: before?.[field] ?? null, after: after?.[field] ?? null }));
}

// One journal row. `tx` is the transaction the caller is already in: the trail
// is part of the change, not a best-effort log written afterwards.
export function recordChange(tx, { userId, entity, entityId, action, field = null, before = null, after = null, reason = null }) {
  if (!CHANGE_ACTIONS.includes(action)) throw new Error(`unknown change action ${action}`);
  return tx.finChange.create({
    data: {
      userId,
      entity,
      entityId,
      action,
      field,
      // Prisma distinguishes JSON null from SQL NULL; these columns are
      // nullable, so an absent value is stored as SQL NULL.
      before: before === null ? undefined : before,
      after: after === null ? undefined : after,
      reason,
    },
  });
}

// One journal row per field that moved, for a correction. A correction that
// changed nothing writes nothing: an empty trail entry would only add noise.
export async function recordCorrection(tx, { userId, entity, entityId, before, after, reason = null }) {
  const changes = diffFields(entity, before, after);
  for (const change of changes) {
    await recordChange(tx, { userId, entity, entityId, action: 'correct', reason, ...change });
  }
  return changes.length;
}

// The trail of one object, oldest first: that is the order someone reads a
// history in. Only the owner's own rows are ever returned — `userId` is part of
// the filter, never only of the object's identity.
export function listChanges(prisma, { userId, entity, entityId }) {
  return prisma.finChange.findMany({
    where: { userId, entity, entityId },
    orderBy: { createdAt: 'asc' },
    select: { id: true, action: true, field: true, before: true, after: true, reason: true, createdAt: true },
  });
}
