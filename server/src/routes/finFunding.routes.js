import { Router } from 'express';
import { getFundingReadiness, getFundingReferences, postFundingExport } from '../controllers/finFunding.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncRoute } from '../utils/asyncRoute.js';
import { exportConsentSchema } from '../validation/finFunding.schemas.js';

// Funding readiness (P6-16), screens JA08 / SA05.
const router = Router();
router.use(requireAuth);

router.get('/financement/references', getFundingReferences);
router.get('/financement/preparation', asyncRoute(getFundingReadiness));
router.post('/financement/export', validateBody(exportConsentSchema), asyncRoute(postFundingExport));

export default router;
