import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import {
  SPACE_TASK_CATEGORIES,
  SPACE_TASK_CHECKLIST_MAX,
  SPACE_TASK_PRIORITIES,
  SPACE_TASK_RECURRENCES,
  SPACE_TASK_STATUSES,
  SPACE_TASK_WEIGHTS,
} from '../constants/finSpaceTask.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import {
  TASK_VOCABULARY,
  completeSpaceTask,
  createSpaceTask,
  deleteSpaceTask,
  listSpaceTasks,
  spaceTaskStats,
  updateSpaceTask,
} from '../services/finSpaceTask.service.js';
import { describeFormula } from '../services/finance/describe.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import { reasonSchema } from '../validation/finData.schemas.js';

// Tasks of a space (P9-06). Scoped to one space like every route of Gestion
// commune: a space the caller is not in answers 404.
const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const checklist = z
  .array(z.object({ label: z.string().trim().min(1).max(120), done: z.boolean().default(false) }).strict())
  .max(SPACE_TASK_CHECKLIST_MAX);

const fields = {
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500).nullable(),
  category: z.enum(SPACE_TASK_CATEGORIES),
  assigneeId: z.string().uuid(),
  participants: z.array(z.string().uuid()).max(12),
  dueDate: z.coerce.date().nullable(),
  priority: z.enum(SPACE_TASK_PRIORITIES),
  recurrence: z.enum(SPACE_TASK_RECURRENCES),
  checklist,
  weight: z.number().int().refine((value) => SPACE_TASK_WEIGHTS.includes(value), 'The weight of a task is 1, 2 or 3'),
  status: z.enum(SPACE_TASK_STATUSES),
  reminderDays: z.number().int().min(0).max(60).nullable(),
  linkedExpenseId: z.string().uuid().nullable(),
};

const createSchema = z
  .object({ title: fields.title, category: fields.category, assigneeId: fields.assigneeId })
  .extend({
    description: fields.description.optional(),
    participants: fields.participants.optional(),
    dueDate: fields.dueDate.optional(),
    priority: fields.priority.optional(),
    recurrence: fields.recurrence.optional(),
    checklist: fields.checklist.optional(),
    weight: fields.weight.optional(),
    reminderDays: fields.reminderDays.optional(),
    linkedExpenseId: fields.linkedExpenseId.optional(),
  })
  .strict()
  // A recurring task needs a date to recur from.
  .refine((body) => body.recurrence === undefined || body.recurrence === 'none' || body.dueDate, { message: 'A recurring task needs a due date', path: ['dueDate'] });

const updateSchema = z
  .object({ ...Object.fromEntries(Object.entries(fields).map(([key, schema]) => [key, schema.optional()])), reason: reasonSchema.optional() })
  .strict()
  .refine((body) => Object.keys(body).some((key) => key !== 'reason'), { message: 'Nothing to change' });

const listQuery = z.object({ mois: month.optional(), statut: z.enum(SPACE_TASK_STATUSES).optional() }).strict();
const statsQuery = z.object({ mois: month.optional() }).strict();
const deleteSchema = z.object({ reason: reasonSchema.optional() }).strict();

const currentMonth = () => new Date().toISOString().slice(0, 7);

const router = Router();
router.use(requireAuth);
router.param('id', uuidParam);
router.param('taskId', uuidParam);

router.get('/espaces/references-taches', (req, res) => {
  res.json({ ...TASK_VOCABULARY, weights: SPACE_TASK_WEIGHTS, formulas: ['COL-F11', 'COL-F12', 'ALG-C04'].map(describeFormula) });
});
router.get(
  '/espaces/:id/taches',
  validateQuery(listQuery),
  asyncRoute(async (req, res) => {
    res.json({ tasks: await listSpaceTasks(prisma, req.user.id, req.params.id, { month: req.query.mois, status: req.query.statut }) });
  }),
);
router.get(
  '/espaces/:id/taches-synthese',
  validateQuery(statsQuery),
  asyncRoute(async (req, res) => {
    res.json({ synthese: await spaceTaskStats(prisma, req.user.id, req.params.id, req.query.mois ?? currentMonth()) });
  }),
);
router.post(
  '/espaces/:id/taches',
  validateBody(createSchema),
  asyncRoute(async (req, res) => {
    res.status(201).json({ task: await createSpaceTask(prisma, req.user.id, req.params.id, req.body) });
  }),
);
router.patch(
  '/espaces/:id/taches/:taskId',
  validateBody(updateSchema),
  asyncRoute(async (req, res) => {
    res.json({ task: await updateSpaceTask(prisma, req.user.id, req.params.id, req.params.taskId, req.body) });
  }),
);
router.post(
  '/espaces/:id/taches/:taskId/terminer',
  asyncRoute(async (req, res) => {
    res.json(await completeSpaceTask(prisma, req.user.id, req.params.id, req.params.taskId));
  }),
);
router.delete(
  '/espaces/:id/taches/:taskId',
  validateBody(deleteSchema),
  asyncRoute(async (req, res) => {
    res.json(await deleteSpaceTask(prisma, req.user.id, req.params.id, req.params.taskId, { reason: req.body?.reason }));
  }),
);

export default router;
