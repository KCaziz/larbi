import { prisma } from '../config/prisma.js';
import {
  SPACE_GOAL_ENTITY,
  addContribution,
  buildFairShare,
  buildSpaceGoalView,
  createSpaceGoal,
  deleteContribution,
  deleteSpaceGoal,
  listSpaceGoals,
  ownSpaceGoalWithContributions,
  updateSpaceGoal,
} from '../services/finSpaceGoal.service.js';
import { listChanges } from '../services/finChange.service.js';

// Common goals and envelopes (P6-15), screens P05, CO02-CO06, CP02-CP04.

async function withNames(prisma, spaceId, goal) {
  const members = await prisma.finSpaceMember.findMany({ where: { spaceId }, select: { id: true, displayName: true, user: { select: { name: true } } } });
  const names = new Map(members.map((m) => [m.id, m.displayName ?? m.user.name]));
  const view = buildSpaceGoalView(goal);
  // F044: what each member's "fair share" of what's left would be by income —
  // a comparison shown beside the actual contributions, never a bill.
  const partEquitable = await buildFairShare(prisma, spaceId, goal, view.allocated);
  return {
    ...goal,
    vue: {
      ...view,
      parMembre: view.parMembre.map((row) => ({ ...row, name: names.get(row.memberId) ?? null })),
      partEquitable,
    },
  };
}

export async function getSpaceGoals(req, res) {
  const goals = await listSpaceGoals(prisma, req.user.id, req.params.id, { includeArchived: req.query.includeArchived === 'true' });
  res.json({ goals: await Promise.all(goals.map((goal) => withNames(prisma, req.params.id, goal))) });
}

export async function postSpaceGoal(req, res) {
  const goal = await createSpaceGoal(prisma, req.user.id, req.params.id, req.body);
  res.status(201).json({ goal: await withNames(prisma, req.params.id, { ...goal, contributions: [] }) });
}

export async function patchSpaceGoal(req, res) {
  await updateSpaceGoal(prisma, req.user.id, req.params.id, req.params.goalId, req.body);
  const full = await ownSpaceGoalWithContributions(prisma, req.user.id, req.params.id, req.params.goalId);
  res.json({ goal: await withNames(prisma, req.params.id, full) });
}

export async function removeSpaceGoal(req, res) {
  res.json(await deleteSpaceGoal(prisma, req.user.id, req.params.id, req.params.goalId, { reason: req.body?.reason }));
}

export async function getSpaceGoalHistory(req, res) {
  const changes = await listChanges(prisma, { entity: SPACE_GOAL_ENTITY, entityId: req.params.goalId });
  res.json({ changes });
}

export async function postContribution(req, res) {
  res.status(201).json({ contribution: await addContribution(prisma, req.user.id, req.params.id, req.params.goalId, req.body) });
}

export async function removeContribution(req, res) {
  res.json(await deleteContribution(prisma, req.user.id, req.params.id, req.params.goalId, req.params.contributionId, { reason: req.body?.reason }));
}
