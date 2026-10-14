// Annual or irregular household expenses, provisioned month by month (F045,
// P6-15 famille): school fees, an insurance renewal, a family trip.
import { PROVISIONS_MAX, SPACE_WRITE_MIN_ROLE } from '../constants/finSpaceGoal.js';
import { HttpError } from '../utils/httpError.js';
import { recordChange, recordCorrection } from './finChange.service.js';
import { ownMembership, requireRole } from './finSpace.service.js';
import { monthlyProvision } from './finance/formulas.js';
import { computed } from './finance/contract.js';

export const PROVISION_ENTITY = 'spaceProvision';

const PROVISION_SELECT = {
  id: true,
  spaceId: true,
  label: true,
  plannedAmount: true,
  alreadyProvisioned: true,
  currency: true,
  targetDate: true,
  note: true,
  version: true,
  archivedAt: true,
};

export async function listProvisions(prisma, userId, spaceId, { includeArchived = false } = {}) {
  await ownMembership(prisma, userId, spaceId);
  return prisma.finSpaceProvision.findMany({
    where: { spaceId, deletedAt: null, ...(includeArchived ? {} : { archivedAt: null }) },
    select: PROVISION_SELECT,
    orderBy: { targetDate: 'asc' },
  });
}

async function ownProvision(prisma, userId, spaceId, id) {
  await ownMembership(prisma, userId, spaceId);
  const row = await prisma.finSpaceProvision.findFirst({ where: { id, spaceId, deletedAt: null }, select: PROVISION_SELECT });
  if (!row) throw new HttpError(404, 'Provision not found');
  return row;
}

export async function createProvision(prisma, userId, spaceId, body) {
  const me = await requireRole(prisma, userId, spaceId, SPACE_WRITE_MIN_ROLE);
  const count = await prisma.finSpaceProvision.count({ where: { spaceId, deletedAt: null } });
  if (count >= PROVISIONS_MAX) throw new HttpError(422, 'Too many provisions', { reason: 'tooManyProvisions' });
  if (body.targetDate.getTime() <= Date.now()) throw new HttpError(422, 'A provision needs a future date', { reason: 'pastDate' });
  return prisma.$transaction(async (tx) => {
    const provision = await tx.finSpaceProvision.create({
      data: {
        spaceId,
        label: body.label,
        plannedAmount: body.plannedAmount,
        alreadyProvisioned: body.alreadyProvisioned ?? 0,
        currency: me.space.currency,
        targetDate: body.targetDate,
        note: body.note ?? null,
      },
      select: PROVISION_SELECT,
    });
    await recordChange(tx, { userId, entity: PROVISION_ENTITY, entityId: provision.id, action: 'create', after: { spaceId, label: provision.label, plannedAmount: provision.plannedAmount } });
    return provision;
  });
}

export async function updateProvision(prisma, userId, spaceId, id, body) {
  await requireRole(prisma, userId, spaceId, SPACE_WRITE_MIN_ROLE);
  const before = await ownProvision(prisma, userId, spaceId, id);
  const { reason, ...fields } = body;
  return prisma.$transaction(async (tx) => {
    const after = await tx.finSpaceProvision.update({ where: { id }, data: { ...fields, version: { increment: 1 } }, select: PROVISION_SELECT });
    await recordCorrection(tx, { userId, entity: PROVISION_ENTITY, entityId: id, before, after, reason: reason ?? null });
    return after;
  });
}

export async function deleteProvision(prisma, userId, spaceId, id, { reason } = {}) {
  await requireRole(prisma, userId, spaceId, SPACE_WRITE_MIN_ROLE);
  await ownProvision(prisma, userId, spaceId, id);
  await prisma.$transaction(async (tx) => {
    await tx.finSpaceProvision.update({ where: { id }, data: { deletedAt: new Date() } });
    await recordChange(tx, { userId, entity: PROVISION_ENTITY, entityId: id, action: 'delete', field: 'deletedAt', after: true, reason: reason ?? null });
  });
  return { id };
}

// F045: provision mensuelle = (montant prévu - déjà provisionné) / mois restants.
export function buildProvisionView(provision, { now = new Date() } = {}) {
  const monthsLeft = Math.max(0, (provision.targetDate.getUTCFullYear() - now.getUTCFullYear()) * 12 + (provision.targetDate.getUTCMonth() - now.getUTCMonth()));
  const inputs = { montant_prevu: provision.plannedAmount, deja_provisionne: provision.alreadyProvisioned, mois_restants: monthsLeft };
  return {
    monthsLeft,
    mensuelle: computed(
      'F045',
      monthlyProvision({ plannedAmount: provision.plannedAmount, alreadyProvisioned: provision.alreadyProvisioned, monthsLeft }),
      { inputs, currency: provision.currency, now },
    ),
  };
}
