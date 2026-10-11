import { Router } from 'express';
import { getFlow, listIntentsPublic, resolve } from '../controllers/finAssistant.controller.js';
import { optionalAuth } from '../middleware/auth.js';
import { publicReadLimiter } from '../middleware/rateLimit.js';
import { validateBody } from '../middleware/validate.js';
import { asyncRoute } from '../utils/asyncRoute.js';
import { HttpError } from '../utils/httpError.js';
import { resolveQuerySchema } from '../validation/finAssistant.schemas.js';

// PUBLIC FINCLUDIA deterministic assistant (P3-19). No session required; when
// one is present (optionalAuth) it is recorded in the audit log.
const router = Router();
router.use(publicReadLimiter);
router.use(optionalAuth);
router.param('key', (req, res, next, value) => (/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value) ? next() : next(new HttpError(404, 'Not found'))));

router.get('/intents', asyncRoute(listIntentsPublic));
router.post('/resolve', validateBody(resolveQuerySchema), asyncRoute(resolve));
router.get('/flows/:key', asyncRoute(getFlow));

export default router;
