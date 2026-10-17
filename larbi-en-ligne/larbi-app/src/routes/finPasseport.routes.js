import { Router } from 'express';
import { getPasseport, getPasseportReferences } from '../controllers/finPasseport.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncRoute } from '../utils/asyncRoute.js';

// Passeport de connaissances financières (P2-09), écrans LY11/LY12/ET09.
const router = Router();
router.use(requireAuth);

router.get('/passeport/references', getPasseportReferences);
router.get('/passeport', asyncRoute(getPasseport));

export default router;
