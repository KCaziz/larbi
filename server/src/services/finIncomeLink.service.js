import { createRecurrence, deleteRecurrence, setRecurrenceArchived, updateRecurrence } from './finCalendar.service.js';
import { recordOccurrence } from './finOccurrence.service.js';

// Recette R10-05 — a declared income and the recurrence that brings it in are
// ONE thing for the person. A declared income on its own was counted nowhere
// but « revenus prévus »: it never reached an account, never appeared to be
// confirmed, so the salary looked missing and was typed again (duplicates).
// Now every declared income has its recurrence (« à confirmer » by default, on
// the account chosen, « Espèces » when none), and correcting, archiving or
// deleting the income does the same to it. The money is credited only when the
// person confirms it (or on its own in « auto » mode): never twice.

export function linkedRecurrences(prisma, userId, incomeId) {
  return prisma.finRecurrence.findMany({ where: { userId, incomeId, deletedAt: null }, select: { id: true, archivedAt: true } });
}

// The recurrence of a new (or not yet linked) income.
export async function attachRecurrence(prisma, userId, income, { accountId = null, nextDate = null, received = false, creationMode = 'confirm' } = {}) {
  const first = nextDate ?? income.startDate;
  const recurrence = await createRecurrence(prisma, userId, {
    label: income.label,
    categoryId: income.categoryId ?? null,
    kind: 'income',
    value: income.value,
    currency: income.currency,
    frequency: income.frequency,
    nextDate: first,
    endDate: income.endDate ?? null,
    accountId,
    creationMode,
    weekendRule: 'previous',
    incomeId: income.id,
  });
  // « Je l'ai déjà reçu »: the first payment, on or before today, confirmed at
  // once — the same confirmation as « Reçu », so never credited twice.
  if (received && first <= new Date()) {
    try {
      await recordOccurrence(prisma, userId, { recurrenceId: recurrence.id, dueDate: first, action: 'confirm' });
    } catch (err) {
      if (err.details?.reason !== 'futureDate') throw err;
    }
  }
  return recurrence;
}

// After an income is corrected: its recurrence follows. An income that had
// none gets one when the person now gives an account or a date.
export async function syncRecurrence(prisma, userId, income, { accountId, nextDate } = {}) {
  const linked = await linkedRecurrences(prisma, userId, income.id);
  if (linked.length === 0) {
    if (accountId === undefined && nextDate === undefined) return null;
    return attachRecurrence(prisma, userId, income, { accountId: accountId ?? null, nextDate: nextDate ?? null });
  }
  const fields = {
    label: income.label,
    value: income.value,
    frequency: income.frequency,
    endDate: income.endDate ?? null,
    ...(accountId !== undefined ? { accountId } : {}),
    ...(nextDate ? { nextDate } : {}),
  };
  for (const row of linked) await updateRecurrence(prisma, userId, row.id, fields);
  return linked[0];
}

export async function archiveRecurrences(prisma, userId, incomeId, archived) {
  for (const row of await linkedRecurrences(prisma, userId, incomeId)) {
    if (Boolean(row.archivedAt) !== archived) await setRecurrenceArchived(prisma, userId, row.id, archived);
  }
}

export async function deleteRecurrences(prisma, userId, incomeId) {
  for (const row of await linkedRecurrences(prisma, userId, incomeId)) await deleteRecurrence(prisma, userId, row.id, { reason: 'income deleted' });
}
