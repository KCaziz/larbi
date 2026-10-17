import { Router } from 'express';
import { getFinProfile, listFinTransitions, updateFinProfile } from '../controllers/finProfile.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncRoute } from '../utils/asyncRoute.js';
import { updateFinProfileSchema } from '../validation/finProfile.schemas.js';

// FINCLUDIA onboarding and profile (P3-18). Self-service only, needs a session.
const router = Router();
router.use(requireAuth);

router.get('/', asyncRoute(getFinProfile));
router.put('/', validateBody(updateFinProfileSchema), asyncRoute(updateFinProfile));
router.get('/transitions', asyncRoute(listFinTransitions));

export default router;
