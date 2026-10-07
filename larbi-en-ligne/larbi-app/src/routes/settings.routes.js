import { Router } from 'express';
import { getPublicSettingsRoute } from '../controllers/settings.controller.js';
import { asyncRoute } from '../utils/asyncRoute.js';
import { publicReadLimiter } from '../middleware/rateLimit.js';

// Public: read-only platform settings safe to show before login.
const router = Router();

router.get('/public', publicReadLimiter, asyncRoute(getPublicSettingsRoute));

export default router;
