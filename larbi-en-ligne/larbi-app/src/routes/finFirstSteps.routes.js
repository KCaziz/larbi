import { Router } from 'express';
import { getFirstSteps, postFirstIncome, putStep } from '../controllers/finFirstSteps.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncRoute } from '../utils/asyncRoute.js';
import { firstIncomeSchema, stepSchema } from '../validation/finFirstSteps.schemas.js';

// « Premiers pas » (P8-23): the state of the eight steps, setting one aside,
// and the first income. Every read and write is the session's own.
const router = Router();
router.use(requireAuth);

router.get('/premiers-pas', asyncRoute(getFirstSteps));
router.put('/premiers-pas/etape', validateBody(stepSchema), asyncRoute(putStep));
router.post('/premiers-pas/revenu', validateBody(firstIncomeSchema), asyncRoute(postFirstIncome));

export default router;
