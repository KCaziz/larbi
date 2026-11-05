import { prisma } from '../config/prisma.js';
import { GOAL_CATALOG, GOAL_PROGRESS_STATUSES, GOAL_TEMPLATES, MAX_GOALS } from '../constants/finGoal.js';
import { listChanges } from '../services/finChange.service.js';
import {
  GOAL_ENTITY,
  addGoalContribution,
  buildGoalView,
  goalScenario,
  goalsWithCapital,
  listGoalContributions,
  createGoal,
  deleteGoal,
  listGoals,
  ownGoal,
  setGoalArchived,
  updateGoal,
} from '../services/finGoal.service.js';
import { describeFormula } from '../services/finance/describe.js';
import { createNotification } from '../services/finNotification.service.js';
import { HttpError } from '../utils/httpError.js';

// Financial goals (P6-08), screens C09-C11. Session required everywhere; every
// read and write is scoped to the caller's own rows, exactly like budgets.

export function getGoalReferences(req, res) {
  res.json({
    templates: GOAL_TEMPLATES,
    // The catalogue since P8-12: GO-01 to GO-11 and six kept models (17).
    catalogue: GOAL_CATALOG,
    progressStatuses: GOAL_PROGRESS_STATUSES,
    formulas: ['PB-F014', 'PB-F015', 'PB-F016', 'F028', 'F032', 'ALG-03'].map(describeFormula),
  });
}

export async function getGoals(req, res) {
  const goals = await goalsWithCapital(prisma, req.user.id, await listGoals(prisma, req.user.id, { includeArchived: req.query.includeArchived === 'true' }));
  const withViews = goals.map((goal) => ({ ...goal, vue: buildGoalView(goal) }));

  // P6-18: a goal past its own target date, not reached, is a one-off fact —
  // created once per goal, never repeated once the person has seen it.
  for (const goal of withViews) {
    if (goal.archivedAt || !goal.targetDate || goal.targetDate.getTime() >= Date.now()) continue;
    if ((goal.vue.progres.resultat ?? 0) >= 1) continue;
    await createNotification(prisma, req.user.id, {
      type: 'goal_overdue',
      params: { label: goal.label },
      link: '/app/objectifs',
      referenceId: goal.id,
      dedupeBy: 'reference',
    });
  }

  res.json({ goals: withViews });
}

export async function postGoal(req, res) {
  const count = await prisma.finGoal.count({ where: { userId: req.user.id, deletedAt: null } });
  if (count >= MAX_GOALS) throw new HttpError(422, 'Too many goals', { reason: 'tooManyGoals' });
  const goal = await createGoal(prisma, req.user.id, req.body);
  res.status(201).json({ goal: { ...goal, vue: buildGoalView(goal) } });
}

export async function getGoal(req, res) {
  const [goal] = await goalsWithCapital(prisma, req.user.id, [await ownGoal(prisma, req.user.id, req.params.id)]);
  res.json({ goal: { ...goal, vue: buildGoalView(goal) }, contributions: await listGoalContributions(prisma, req.user.id, req.params.id) });
}

export async function postGoalContribution(req, res) {
  res.status(201).json(await addGoalContribution(prisma, req.user.id, req.params.id, req.body));
}

export async function postGoalScenario(req, res) {
  const [goal] = await goalsWithCapital(prisma, req.user.id, [await ownGoal(prisma, req.user.id, req.params.id)]);
  res.json({ scenario: goalScenario(goal, req.body) });
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
