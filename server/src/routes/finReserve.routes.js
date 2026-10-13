import { Router } from 'express';
import { getReserve, getReserveReferences, putReserveTarget } from '../controllers/finReserve.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { asyncRoute } from '../utils/asyncRoute.js';
import { reserveTargetSchema } from '../validation/finReserve.schemas.js';

// Safety reserve (P6-09), screen C12.
const router = Router();
router.use(requireAuth);

router.get('/reserve/references', getReserveReferences);
router.get('/reserve', asyncRoute(getReserve));
router.put('/reserve/cible', validateBody(reserveTargetSchema), asyncRoute(putReserveTarget));

export default router;
