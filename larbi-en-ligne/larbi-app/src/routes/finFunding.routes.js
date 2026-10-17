import { Router } from 'express';
import { getFundingReadiness, getFundingReferences, postFundingExport } from '../controllers/finFunding.controller.js';
import { requireAdult, requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncRoute } from '../utils/asyncRoute.js';
import { exportConsentSchema } from '../validation/finFunding.schemas.js';

// Funding readiness (P6-16), screens JA08 / SA05.
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
router.use('/financement', requireAdult);

router.get('/financement/references', getFundingReferences);
router.get('/financement/preparation', asyncRoute(getFundingReadiness));
router.post('/financement/export', validateBody(exportConsentSchema), asyncRoute(postFundingExport));

export default router;
