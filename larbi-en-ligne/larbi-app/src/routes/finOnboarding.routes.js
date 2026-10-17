import { Router } from 'express';
import { getState, postComplete, putAnswers } from '../controllers/finOnboarding.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncRoute } from '../utils/asyncRoute.js';
import { saveOnboardingSchema } from '../validation/finOnboarding.schemas.js';

// Progressive financial onboarding (P6-03). Session required: the questions are
// financial, and the client's own rule is that nothing financial is asked
// before there is an account and its consents (P3-18).
const router = Router();
router.use(requireAuth);

router.get('/', asyncRoute(getState));
// One route for « Passer », « Enregistrer et quitter » and a full answer: they
// are the same write, with different amounts of it filled in.
router.put('/', validateBody(saveOnboardingSchema), asyncRoute(putAnswers));
router.post('/terminer', asyncRoute(postComplete));

export default router;
