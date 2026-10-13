import { Router } from 'express';
import {
  getCalendar,
  getCalendarReferences,
  getDetection,
  getProvisionHistory,
  getProvisions,
  getRecurrenceHistory,
  getRecurrences,
  getSubscriptionCost,
  patchProvision,
  patchRecurrence,
  postCopyPlan,
  postMarkPaid,
  postProvision,
  postRecurrence,
  postRecurrenceConfirmed,
  putRecurrenceArchived,
  removeProvision,
  removeRecurrence,
} from '../controllers/finCalendar.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import { archiveSchema, deleteSchema } from '../validation/finMoney.schemas.js';
import {
  calendarQuerySchema,
  confirmRecurrenceSchema,
  copyPlanSchema,
  createProvisionSchema,
  createRecurrenceSchema,
  detectionQuerySchema,
  markPaidSchema,
  subscriptionsQuerySchema,
  updateProvisionSchema,
  updateRecurrenceSchema,
} from '../validation/finCalendar.schemas.js';

// Financial calendar and recurring expenses (P6-07), screens C23 / SA03 / SA04
// / ET04 / FA04. Every route needs a session and only ever touches the caller's
// own rows: what somebody pays every month is private data.
const router = Router();
router.use(requireAuth);
router.param('id', uuidParam);

router.get('/calendrier/references', getCalendarReferences);
router.get('/calendrier', validateQuery(calendarQuerySchema), asyncRoute(getCalendar));
// « Plan du mois » (SA03): copy the planned movements of the month before.
router.post('/calendrier/plan', validateBody(copyPlanSchema), asyncRoute(postCopyPlan));

// Recurrences. `detection` and `abonnements` are declared BEFORE `/:id` so
// neither is ever read as an identifier.
router.get('/recurrences/detection', validateQuery(detectionQuerySchema), asyncRoute(getDetection));
router.get('/recurrences/abonnements', validateQuery(subscriptionsQuerySchema), asyncRoute(getSubscriptionCost));
router.get('/recurrences', asyncRoute(getRecurrences));
router.post('/recurrences', validateBody(createRecurrenceSchema), asyncRoute(postRecurrence));
// Confirming a detected candidate: the ONLY way a detection becomes a row.
router.post('/recurrences/confirmer', validateBody(confirmRecurrenceSchema), asyncRoute(postRecurrenceConfirmed));
router.patch('/recurrences/:id', validateBody(updateRecurrenceSchema), asyncRoute(patchRecurrence));
router.put('/recurrences/:id/archive', validateBody(archiveSchema), asyncRoute(putRecurrenceArchived));
router.delete('/recurrences/:id', validateBody(deleteSchema), asyncRoute(removeRecurrence));
router.get('/recurrences/:id/historique', asyncRoute(getRecurrenceHistory));

// Provisions.
router.get('/provisions', asyncRoute(getProvisions));
router.post('/provisions', validateBody(createProvisionSchema), asyncRoute(postProvision));
router.patch('/provisions/:id', validateBody(updateProvisionSchema), asyncRoute(patchProvision));
router.delete('/provisions/:id', validateBody(deleteSchema), asyncRoute(removeProvision));
router.get('/provisions/:id/historique', asyncRoute(getProvisionHistory));

// « Marquer payé »: the planned movement becomes real IN PLACE, so there is
// never a second row to count twice.
router.post('/transactions/:id/payer', validateBody(markPaidSchema), asyncRoute(postMarkPaid));

export default router;
