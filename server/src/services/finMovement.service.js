// Movements (P8-07, screens TRX-01 to TRX-04): tags, clearing (« pointage »,
// tab 08C) and its rate (AN-F004). The movement itself — create, correct,
// delete — stays in finMoney.service.js; this file holds what P8-07 adds
// around it.
import { CLEARING_STATES, TRANSFER_KINDS } from '../constants/finMoney.js';
import { HttpError } from '../utils/httpError.js';
import { computed } from './finance/contract.js';
import { recordChange, recordCorrection } from './finChange.service.js';

export const TAG_ENTITY = 'tag';

const TAG_SELECT = { id: true, name: true, color: true, autoCategoryId: true, archivedAt: true, version: true };

// A person keeps a short list of tags; an unbounded one is also an unbounded
// write surface.
export const MAX_TAGS = 50;

export function listTags(prisma, userId) {
  return prisma.finTag.findMany({ where: { userId, deletedAt: null }, select: TAG_SELECT, orderBy: { name: 'asc' } });
}

async function ownTag(prisma, userId, id) {
  const tag = await prisma.finTag.findFirst({ where: { id, userId, deletedAt: null }, select: TAG_SELECT });
  if (!tag) throw new HttpError(404, 'Tag not found');
  return tag;
}

// The tag a NEW movement may carry: this person's, not archived.
export async function usableTag(prisma, userId, id) {
  if (id === null || id === undefined) return null;
  const tag = await ownTag(prisma, userId, id);
  if (tag.archivedAt) throw new HttpError(422, 'Archived tag', { reason: 'archivedTag' });
  return tag.id;
}

// « Appliquer automatiquement aux nouveaux enregistrements similaires »: a
// movement entered without a tag, in a category one of the person's tags is
// set to follow, receives that tag.
export async function automaticTag(prisma, userId, categoryId) {
  if (!categoryId) return null;
  const tag = await prisma.finTag.findFirst({
    where: { userId, deletedAt: null, archivedAt: null, autoCategoryId: categoryId },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });
  return tag?.id ?? null;
}

async function usableCategoryForTag(prisma, userId, categoryId) {
  if (categoryId === null || categoryId === undefined) return null;
  const row = await prisma.finCategory.findFirst({ where: { id: categoryId, deletedAt: null, OR: [{ userId: null }, { userId }] }, select: { id: true } });
  if (!row) throw new HttpError(422, 'Unknown category', { reason: 'unknownCategory' });
  return row.id;
}

export async function createTag(prisma, userId, body) {
  const count = await prisma.finTag.count({ where: { userId, deletedAt: null } });
  if (count >= MAX_TAGS) throw new HttpError(422, 'Too many tags', { reason: 'tooMany', limit: MAX_TAGS });
  const autoCategoryId = await usableCategoryForTag(prisma, userId, body.autoCategoryId);
  return prisma.$transaction(async (tx) => {
    const tag = await tx.finTag.create({
      data: { userId, name: body.name, color: body.color, autoCategoryId, source: 'manual', status: 'declared' },
      select: TAG_SELECT,
    });
    await recordChange(tx, { userId, entity: TAG_ENTITY, entityId: tag.id, action: 'create', after: { name: tag.name } });
    return tag;
  });
}

export async function updateTag(prisma, userId, id, body) {
  const before = await ownTag(prisma, userId, id);
  const { reason, ...fields } = body;
  if (fields.autoCategoryId !== undefined) fields.autoCategoryId = await usableCategoryForTag(prisma, userId, fields.autoCategoryId);
  if (fields.archived !== undefined) {
    fields.archivedAt = fields.archived ? new Date() : null;
    delete fields.archived;
  }
  return prisma.$transaction(async (tx) => {
    const after = await tx.finTag.update({ where: { id }, data: { ...fields, version: { increment: 1 } }, select: TAG_SELECT });
    await recordCorrection(tx, { userId, entity: TAG_ENTITY, entityId: id, before, after, reason: reason ?? null });
    return after;
  });
}

// Logical: the movements that carried it keep their history, and simply lose
// the mark (the foreign key is SET NULL only on a real deletion, which never
// happens here).
export async function deleteTag(prisma, userId, id, { reason } = {}) {
  await ownTag(prisma, userId, id);
  await prisma.$transaction(async (tx) => {
    await tx.finTag.update({ where: { id }, data: { deletedAt: new Date() } });
    await tx.finTransaction.updateMany({ where: { userId, tagId: id }, data: { tagId: null } });
    await recordChange(tx, { userId, entity: TAG_ENTITY, entityId: id, action: 'delete', field: 'deletedAt', after: true, reason: reason ?? null });
  });
  return { id };
}

// ---- clearing (« pointage ») ------------------------------------------------

/**
 * Sets the clearing state of a movement. Allowed on EVERY movement, a transfer
 * side included: clearing is a check of what happened, it never changes an
 * amount or a balance (tab 08C, « ne change pas le solde »). Both sides of a
 * transfer are cleared together — they are one operation.
 */
export async function setClearing(prisma, userId, id, clearing) {
  const row = await prisma.finTransaction.findFirst({ where: { id, userId, deletedAt: null }, select: { id: true, clearing: true, transferId: true } });
  if (!row) throw new HttpError(404, 'Transaction not found');
  await prisma.$transaction(async (tx) => {
    const where = row.transferId ? { userId, transferId: row.transferId } : { id };
    await tx.finTransaction.updateMany({ where, data: { clearing } });
    await recordChange(tx, { userId, entity: 'transaction', entityId: id, action: 'correct', field: 'clearing', before: row.clearing, after: clearing });
  });
  return { id, clearing };
}

/**
 * The clearing screen (TRX-04): AN-F004 — movements checked or reconciled over
 * the real movements eligible — the counts per state, and the movements still
 * to check, oldest first. Over a period when one is given.
 */
export async function clearingView(prisma, userId, { from = null, to = null, now = new Date() } = {}) {
  const where = {
    userId,
    deletedAt: null,
    status: 'real',
    planned: false,
    // One transfer is one operation: only its outgoing side is counted.
    kind: { not: TRANSFER_KINDS[1] },
    ...(from || to ? { occurredAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
  };
  const [groups, pending] = await Promise.all([
    prisma.finTransaction.groupBy({ by: ['clearing'], where, _count: { _all: true } }),
    prisma.finTransaction.findMany({
      where: { ...where, clearing: { in: ['unchecked', 'to_verify'] } },
      select: { id: true, kind: true, value: true, currency: true, occurredAt: true, note: true, categoryId: true, accountId: true, clearing: true },
      orderBy: { occurredAt: 'asc' },
      take: 50,
    }),
  ]);
  const counts = Object.fromEntries(CLEARING_STATES.map((state) => [state, groups.find((group) => group.clearing === state)?._count._all ?? 0]));
  const eligible = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const cleared = counts.checked + counts.reconciled;
  return {
    taux: computed('AN-F004', eligible === 0 ? null : cleared / eligible, {
      inputs: { pointees_ou_rapprochees: cleared, eligibles: eligible, periode: from || to ? { debut: from, fin: to } : null },
      now,
    }),
    counts,
    pending,
  };
}
