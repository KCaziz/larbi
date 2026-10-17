import { Router } from 'express';
import {
  getSpaceGoalHistory,
  getSpaceGoals,
  patchSpaceGoal,
  postContribution,
  postSpaceGoal,
  removeContribution,
  removeSpaceGoal,
} from '../controllers/finSpaceGoal.controller.js';
import { getChildren, patchChild, postChild, removeChild } from '../controllers/finChild.controller.js';
import { getProvisionReferences, getProvisions, patchProvision, postProvision, removeProvision } from '../controllers/finSpaceProvision.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import { deleteSchema } from '../validation/finMoney.schemas.js';
import {
  createChildSchema,
  createContributionSchema,
  createProvisionSchema,
  createSpaceGoalSchema,
  updateChildSchema,
  updateProvisionSchema,
  updateSpaceGoalSchema,
} from '../validation/finSpaceGoal.schemas.js';

// Common goals/envelopes, children and annual provisions (P6-15), screens P05,
// CO02-CO06, CP02-CP04, FA02-FA06. Every route is scoped to one space, and
// membership is checked by P6-13's own helpers.
const router = Router();
router.use(requireAuth);
router.param('id', uuidParam);
router.param('goalId', uuidParam);
router.param('contributionId', uuidParam);
router.param('childId', uuidParam);
router.param('provisionId', uuidParam);

// ---- common goals / envelopes ----------------------------------------------
router.get('/espaces/:id/objectifs-communs', asyncRoute(getSpaceGoals));
router.post('/espaces/:id/objectifs-communs', validateBody(createSpaceGoalSchema), asyncRoute(postSpaceGoal));
router.patch('/espaces/:id/objectifs-communs/:goalId', validateBody(updateSpaceGoalSchema), asyncRoute(patchSpaceGoal));
router.delete('/espaces/:id/objectifs-communs/:goalId', validateBody(deleteSchema), asyncRoute(removeSpaceGoal));
router.get('/espaces/:id/objectifs-communs/:goalId/historique', asyncRoute(getSpaceGoalHistory));
router.post('/espaces/:id/objectifs-communs/:goalId/contributions', validateBody(createContributionSchema), asyncRoute(postContribution));
router.delete('/espaces/:id/objectifs-communs/:goalId/contributions/:contributionId', validateBody(deleteSchema), asyncRoute(removeContribution));

// ---- children ---------------------------------------------------------------
router.get('/espaces/:id/enfants', asyncRoute(getChildren));
router.post('/espaces/:id/enfants', validateBody(createChildSchema), asyncRoute(postChild));
router.patch('/espaces/:id/enfants/:childId', validateBody(updateChildSchema), asyncRoute(patchChild));
router.delete('/espaces/:id/enfants/:childId', asyncRoute(removeChild));

// ---- annual provisions -------------------------------------------------------
router.get('/espaces/references-provisions', getProvisionReferences);
router.get('/espaces/:id/provisions', asyncRoute(getProvisions));
router.post('/espaces/:id/provisions', validateBody(createProvisionSchema), asyncRoute(postProvision));
router.patch('/espaces/:id/provisions/:provisionId', validateBody(updateProvisionSchema), asyncRoute(patchProvision));
router.delete('/espaces/:id/provisions/:provisionId', validateBody(deleteSchema), asyncRoute(removeProvision));

export default router;
