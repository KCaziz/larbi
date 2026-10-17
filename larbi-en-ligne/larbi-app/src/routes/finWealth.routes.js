import { Router } from 'express';
import {
  getAssetHistory,
  getAssetValuations,
  getAssets,
  getWealth,
  getWealthReferences,
  patchAsset,
  postAsset,
  putAssetArchived,
  removeAsset,
} from '../controllers/finWealth.controller.js';
import { requireAdult, requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import { archiveSchema, deleteSchema } from '../validation/finMoney.schemas.js';
import { createAssetSchema, updateAssetSchema, wealthQuerySchema } from '../validation/finWealth.schemas.js';

// Real patrimony (P6-11), screens C16 and JA07. Every route needs a session and
// only ever touches the caller's own rows: what somebody owns is the most
// private figure in the platform, and no administrator has a screen onto it.
const router = Router();
router.use(requireAuth);
// Reserved to 18+ (P6-17, the client's rule: a lycéen is never shown a debt, a
// real patrimony or a credit offer). Refused SERVER-SIDE and not merely hidden
// in the navigation — `requireAdult` existed and guarded nothing until this
// task, which meant a minor could reach this through the API directly.
//
// Bound to THIS router's own path(s), never `router.use(requireAdult)`: every
// financial router is mounted on the same `/fin` prefix, so a pathless `use`
// would guard every route declared after it — reserve, calendar, notifications,
// the home screen — and lock a minor out of their own money. That mistake was
// made here first and caught by the journey route answering 403.
router.use(['/patrimoine', '/actifs'], requireAdult);
router.param('id', uuidParam);

router.get('/patrimoine/references', getWealthReferences);
router.get('/patrimoine', validateQuery(wealthQuerySchema), asyncRoute(getWealth));

router.get('/actifs', asyncRoute(getAssets));
router.post('/actifs', validateBody(createAssetSchema), asyncRoute(postAsset));
router.patch('/actifs/:id', validateBody(updateAssetSchema), asyncRoute(patchAsset));
router.put('/actifs/:id/archive', validateBody(archiveSchema), asyncRoute(putAssetArchived));
router.delete('/actifs/:id', validateBody(deleteSchema), asyncRoute(removeAsset));
router.get('/actifs/:id/historique', asyncRoute(getAssetHistory));
// The valuation series, read from the correction journal.
router.get('/actifs/:id/valeurs', asyncRoute(getAssetValuations));

export default router;
