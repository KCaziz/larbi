import { prisma } from '../config/prisma.js';
import { GOAL_TEMPLATES, MAX_GOALS } from '../constants/finGoal.js';
import { listChanges } from '../services/finChange.service.js';
import {
  GOAL_ENTITY,
  buildGoalView,
  createGoal,
  deleteGoal,
  listGoals,
  ownGoal,
  setGoalArchived,
  updateGoal,
} from '../services/finGoal.service.js';
import { describeFormula } from '../services/finance/describe.js';
import { HttpError } from '../utils/httpError.js';

// Financial goals (P6-08), screens C09-C11. Session required everywhere; every
// read and write is scoped to the caller's own rows, exactly like budgets.

export function getGoalReferences(req, res) {
  res.json({ templates: GOAL_TEMPLATES, formulas: ['F025', 'F026', 'F027', 'F028', 'F032', 'ALG-03'].map(describeFormula) });
}

export async function getGoals(req, res) {
  const goals = await listGoals(prisma, req.user.id, { includeArchived: req.query.includeArchived === 'true' });
  res.json({ goals: goals.map((goal) => ({ ...goal, vue: buildGoalView(goal) })) });
}

export async function postGoal(req, res) {
  const count = await prisma.finGoal.count({ where: { userId: req.user.id, deletedAt: null } });
  if (count >= MAX_GOALS) throw new HttpError(422, 'Too many goals', { reason: 'tooManyGoals' });
  const goal = await createGoal(prisma, req.user.id, req.body);
  res.status(201).json({ goal: { ...goal, vue: buildGoalView(goal) } });
}

export async function getGoal(req, res) {
  const goal = await ownGoal(prisma, req.user.id, req.params.id);
  res.json({ goal: { ...goal, vue: buildGoalView(goal) } });
}

export async function patchGoal(req, res) {
  const goal = await updateGoal(prisma, req.user.id, req.params.id, req.body);
  res.json({ goal: { ...goal, vue: buildGoalView(goal) } });
}

export async function putGoalArchived(req, res) {
  const { archived, reason } = req.body;
  const goal = await setGoalArchived(prisma, req.user.id, req.params.id, archived, { reason });
  res.json({ goal: { ...goal, vue: buildGoalView(goal) } });
}

export async function removeGoal(req, res) {
  res.json(await deleteGoal(prisma, req.user.id, req.params.id, { reason: req.body?.reason }));
}

export async function getGoalHistory(req, res) {
  await ownGoal(prisma, req.user.id, req.params.id);
  const changes = await listChanges(prisma, { userId: req.user.id, entity: GOAL_ENTITY, entityId: req.params.id });
  res.json({ changes });
}
