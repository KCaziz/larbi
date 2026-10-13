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
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import { archiveSchema, deleteSchema } from '../validation/finMoney.schemas.js';
import { createAssetSchema, updateAssetSchema, wealthQuerySchema } from '../validation/finWealth.schemas.js';

// Real patrimony (P6-11), screens C16 and JA07. Every route needs a session and
// only ever touches the caller's own rows: what somebody owns is the most
// private figure in the platform, and no administrator has a screen onto it.
const router = Router();
router.use(requireAuth);
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
