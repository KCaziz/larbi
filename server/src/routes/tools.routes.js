import { Router } from 'express';
import { getSegment, getSummary, getTheme, listTools } from '../controllers/comparator.controller.js';
import { EXPLICIT_SEGMENTS, themeByKey } from '../constants/comparator.js';
import { publicReadLimiter } from '../middleware/rateLimit.js';
import { toolAccess } from '../middleware/toolAccess.js';
import { asyncRoute } from '../utils/asyncRoute.js';
import { HttpError } from '../utils/httpError.js';

// Tools API (P4-01). Every tool is mounted behind toolAccess(<its key>): who may
// use it is decided once, in constants/tools.js, and enforced here.
const router = Router();
router.use(publicReadLimiter);

router.get('/', listTools);

// Bank comparator (P4-06). Unknown rubric or segment: 404, like an unknown page.
const comparator = Router();
comparator.param('theme', (req, res, next, value) => (themeByKey(value) ? next() : next(new HttpError(404, 'Not found'))));
comparator.param('segment', (req, res, next, value) => (EXPLICIT_SEGMENTS.includes(value) ? next() : next(new HttpError(404, 'Not found'))));
comparator.get('/', asyncRoute(getSummary));
comparator.get('/themes/:theme', asyncRoute(getTheme));
comparator.get('/segments/:segment', asyncRoute(getSegment));
router.use('/comparator', ...toolAccess('comparateur-bancaire'), comparator);

export default router;
