// The common pot of a space and the contribution it asks for (P9-09, COL-F08,
// the client's rule A1):
//
//   common resources = opening balance + confirmed contributions
//                      + other confirmed entries
//   group balance    = common resources - realised expenses
//
// A PLANNED contribution counts for nothing: it is a promise, and the balance
// is only ever made of money that came in. The required contribution (COL-F08)
// is a PROPOSAL: it says what each member would put in to cover a need, by the
// space's rule, and writes nothing — least of all in a personal account.
import { SPACE_WRITE_MIN_ROLE } from '../constants/finSpaceGoal.js';
import { HttpError } from '../utils/httpError.js';
import { recordChange } from './finChange.service.js';
import { incomesForSplit, liveMembers } from './finShared.service.js';
import { ownMembership, requireRole } from './finSpace.service.js';
import { computed } from './finance/contract.js';
import { requiredContribution } from './finance/collective.js';

export const SPACE_INFLOW_ENTITY = 'spaceInflow';
export const INFLOW_KINDS = ['opening', 'contribution', 'other'];

const INFLOW_SELECT = { id: true, spaceId: true, kind: true, memberId: true, value: true, occurredAt: true, status: true, note: true, recordedById: true, version: true };

/** The pot of a space: what came in, what went out, what is left. */
export async function spaceResources(prisma, userId, spaceId) {
  const me = await ownMembership(prisma, userId, spaceId);
  const currency = me.space.currency;
  const [inflows, spent] = await Promise.all([
    prisma.finSpaceInflow.findMany({ where: { spaceId, deletedAt: null }, select: INFLOW_SELECT, orderBy: { occurredAt: 'desc' } }),
    prisma.finSharedExpense.aggregate({ where: { spaceId, deletedAt: null, lifecycle: 'done' }, _sum: { value: true } }),
  ]);
  const confirmed = inflows.filter((row) => row.status === 'confirmed');
  const sum = (kind) => confirmed.filter((row) => row.kind === kind).reduce((total, row) => total + row.value, 0);
  const planned = inflows.filter((row) => row.status === 'planned').reduce((total, row) => total + row.value, 0);
  const resources = sum('opening') + sum('contribution') + sum('other');
  const realised = spent._sum.value ?? 0;
  const now = new Date();
  const inputs = { solde_initial: sum('opening'), contributions_confirmees: sum('contribution'), autres_entrees_confirmees: sum('other'), depenses_realisees: realised };
  return {
    currency,
    inflows,
    resources: { montant: resources, detail: inputs },
    // Said apart: promised, not counted.
    contributionsPrevues: planned,
    depensesRealisees: realised,
    soldeGroupe: { resultat: resources - realised, unite: currency, entrees_snapshot: inputs, calcule_le: now.toISOString() },
  };
}

export async function addSpaceInflow(prisma, userId, spaceId, body) {
  const me = await requireRole(prisma, userId, spaceId, SPACE_WRITE_MIN_ROLE);
  const members = await liveMembers(prisma, spaceId);
  if (body.memberId && !members.some((member) => member.id === body.memberId)) {
    throw new HttpError(422, 'The contributor is not a member of this space', { reason: 'unknownMember' });
  }
  if (body.kind === 'contribution' && !body.memberId) throw new HttpError(422, 'A contribution says who makes it', { reason: 'memberRequired' });
  // Only an admin sets the opening balance: it is the figure everything starts from.
  if (body.kind === 'opening' && !['owner', 'admin'].includes(me.role)) throw new HttpError(403, 'Only an administrator sets the opening balance', { reason: 'adminOnly' });
  // A member puts money in for themselves; an admin may record it for another.
  if (body.kind === 'contribution' && body.memberId !== me.id && !['owner', 'admin'].includes(me.role)) {
    throw new HttpError(403, 'You can only record your own contribution', { reason: 'notYours' });
  }
  return prisma.$transaction(async (tx) => {
    const inflow = await tx.finSpaceInflow.create({
      data: {
        spaceId,
        kind: body.kind,
        memberId: body.kind === 'contribution' ? body.memberId : null,
        value: body.value,
        occurredAt: body.occurredAt,
        status: body.planned ? 'planned' : 'confirmed',
        note: body.note ?? null,
        recordedById: me.id,
      },
      select: INFLOW_SELECT,
    });
    await recordChange(tx, { userId, entity: SPACE_INFLOW_ENTITY, entityId: inflow.id, action: 'create', after: { spaceId, kind: inflow.kind, value: inflow.value, status: inflow.status } });
    return inflow;
  });
}

/** A promised contribution that has arrived: it starts to count. */
export async function confirmSpaceInflow(prisma, userId, spaceId, id) {
  const me = await requireRole(prisma, userId, spaceId, SPACE_WRITE_MIN_ROLE);
  const inflow = await prisma.finSpaceInflow.findFirst({ where: { id, spaceId, deletedAt: null }, select: INFLOW_SELECT });
  if (!inflow) throw new HttpError(404, 'Entry not found');
  if (inflow.status !== 'planned') throw new HttpError(409, 'This entry is already confirmed', { reason: 'alreadyConfirmed' });
  if (inflow.memberId !== me.id && !['owner', 'admin'].includes(me.role)) throw new HttpError(403, 'Only the contributor or an administrator confirms it', { reason: 'notYours' });
  return prisma.$transaction(async (tx) => {
    const updated = await tx.finSpaceInflow.update({ where: { id }, data: { status: 'confirmed', version: { increment: 1 } }, select: INFLOW_SELECT });
    await recordChange(tx, { userId, entity: SPACE_INFLOW_ENTITY, entityId: id, action: 'correct', field: 'status', before: 'planned', after: 'confirmed' });
    return updated;
  });
}

export async function deleteSpaceInflow(prisma, userId, spaceId, id, { reason } = {}) {
  const me = await requireRole(prisma, userId, spaceId, SPACE_WRITE_MIN_ROLE);
  const inflow = await prisma.finSpaceInflow.findFirst({ where: { id, spaceId, deletedAt: null }, select: INFLOW_SELECT });
  if (!inflow) throw new HttpError(404, 'Entry not found');
  if (inflow.recordedById !== me.id && !['owner', 'admin'].includes(me.role)) throw new HttpError(403, 'Only whoever recorded it or an administrator removes it', { reason: 'notYours' });
  await prisma.$transaction(async (tx) => {
    await tx.finSpaceInflow.update({ where: { id }, data: { deletedAt: new Date() } });
    await recordChange(tx, { userId, entity: SPACE_INFLOW_ENTITY, entityId: id, action: 'delete', field: 'deletedAt', after: true, reason: reason ?? null });
  });
  return { id };
}

/**
 * COL-F08 as a proposal: what a collective need asks of each member, beyond
 * the common resources, by the space's rule (equal shares, or in proportion to
 * the incomes the members agreed to share). Nothing is written.
 */
export async function proposeContribution(prisma, userId, spaceId, { need }) {
  const me = await ownMembership(prisma, userId, spaceId);
  const currency = me.space.currency;
  const members = await liveMembers(prisma, spaceId);
  const { resources } = await spaceResources(prisma, userId, spaceId);

  let weights = members.map(() => 1);
  let rule = 'equal';
  if (me.space.splitRule === 'income_proportional') {
    // The same consent as the split of an expense: refused, naming the members, if one withholds.
    const incomes = await incomesForSplit(prisma, members, currency);
    weights = members.map((member) => incomes.get(member.id) ?? 0);
    rule = 'income_proportional';
    if (weights.reduce((sum, weight) => sum + weight, 0) === 0) weights = members.map(() => 1);
  }

  const result = requiredContribution(need, resources.montant, weights);
  const inputs = { besoin_collectif: need, ressources_communes: resources.montant, regle_active: rule };
  const now = new Date();
  return {
    proposition: true,
    regle: rule,
    besoin: need,
    ressourcesCommunes: resources.montant,
    contributionRequise: computed('COL-F08', result?.required ?? null, { inputs, currency, now }),
    parts: result
      ? members.map((member, index) => ({ memberId: member.id, name: member.displayName ?? member.user?.name ?? null, part: result.shares[index] }))
      : [],
  };
}
