// A household's children (P6-15, famille): minimal data, by design — a first
// name and a birth year, nothing that identifies the child outside this one
// household's planning.
import { CHILDREN_MAX, SPACE_WRITE_MIN_ROLE } from '../constants/finSpaceGoal.js';
import { HttpError } from '../utils/httpError.js';
import { recordChange, recordCorrection } from './finChange.service.js';
import { ownMembership, requireRole } from './finSpace.service.js';

export const CHILD_ENTITY = 'child';

const CHILD_SELECT = { id: true, spaceId: true, firstName: true, birthYear: true, note: true, archivedAt: true };

export async function listChildren(prisma, userId, spaceId) {
  await ownMembership(prisma, userId, spaceId);
  return prisma.finChild.findMany({ where: { spaceId, deletedAt: null, archivedAt: null }, select: CHILD_SELECT, orderBy: { createdAt: 'asc' } });
}

async function ownChild(prisma, userId, spaceId, id) {
  await ownMembership(prisma, userId, spaceId);
  const row = await prisma.finChild.findFirst({ where: { id, spaceId, deletedAt: null }, select: CHILD_SELECT });
  if (!row) throw new HttpError(404, 'Child not found');
  return row;
}

export async function createChild(prisma, userId, spaceId, body) {
  await requireRole(prisma, userId, spaceId, SPACE_WRITE_MIN_ROLE);
  const count = await prisma.finChild.count({ where: { spaceId, deletedAt: null } });
  if (count >= CHILDREN_MAX) throw new HttpError(422, 'Too many children', { reason: 'tooManyChildren' });
  return prisma.$transaction(async (tx) => {
    const child = await tx.finChild.create({ data: { spaceId, firstName: body.firstName, birthYear: body.birthYear, note: body.note ?? null }, select: CHILD_SELECT });
    await recordChange(tx, { userId, entity: CHILD_ENTITY, entityId: child.id, action: 'create', after: { spaceId, firstName: child.firstName } });
    return child;
  });
}

export async function updateChild(prisma, userId, spaceId, id, body) {
  await requireRole(prisma, userId, spaceId, SPACE_WRITE_MIN_ROLE);
  const before = await ownChild(prisma, userId, spaceId, id);
  return prisma.$transaction(async (tx) => {
    const after = await tx.finChild.update({ where: { id }, data: body, select: CHILD_SELECT });
    await recordCorrection(tx, { userId, entity: CHILD_ENTITY, entityId: id, before, after, reason: null });
    return after;
  });
}

export async function deleteChild(prisma, userId, spaceId, id) {
  await requireRole(prisma, userId, spaceId, SPACE_WRITE_MIN_ROLE);
  await ownChild(prisma, userId, spaceId, id);
  await prisma.$transaction(async (tx) => {
    await tx.finChild.update({ where: { id }, data: { deletedAt: new Date() } });
    await recordChange(tx, { userId, entity: CHILD_ENTITY, entityId: id, action: 'delete', field: 'deletedAt', after: true });
  });
  return { id };
}
