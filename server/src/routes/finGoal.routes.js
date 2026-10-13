import { Router } from 'express';
import {
  getGoal,
  getGoalHistory,
  getGoalReferences,
  getGoals,
  patchGoal,
  postGoal,
  putGoalArchived,
  removeGoal,
} from '../controllers/finGoal.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import { archiveSchema, deleteSchema } from '../validation/finMoney.schemas.js';
import { createGoalSchema, updateGoalSchema } from '../validation/finGoal.schemas.js';

// Financial goals (P6-08), screens C09-C11. Private data, no admin side.
const router = Router();
router.use(requireAuth);
router.param('id', uuidParam);

router.get('/goals/references', getGoalReferences);
router.get('/goals', asyncRoute(getGoals));
router.post('/goals', validateBody(createGoalSchema), asyncRoute(postGoal));
router.get('/goals/:id', asyncRoute(getGoal));
router.patch('/goals/:id', validateBody(updateGoalSchema), asyncRoute(patchGoal));
router.put('/goals/:id/archive', validateBody(archiveSchema), asyncRoute(putGoalArchived));
router.delete('/goals/:id', validateBody(deleteSchema), asyncRoute(removeGoal));
router.get('/goals/:id/historique', asyncRoute(getGoalHistory));

export default router;
