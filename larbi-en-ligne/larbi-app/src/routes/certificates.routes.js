import { Router } from 'express';
import { verifyCertificate } from '../controllers/certificates.controller.js';
import { certificateVerifyLimiter } from '../middleware/rateLimit.js';
import { asyncRoute } from '../utils/asyncRoute.js';

// Public: anyone holding a certificate number can check it.
const router = Router();

router.get('/:number', certificateVerifyLimiter, asyncRoute(verifyCertificate));

export default router;
