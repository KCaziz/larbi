import { Router } from 'express';
import { getGuide, getTerm, search } from '../controllers/apprendre.controller.js';
import { publicReadLimiter } from '../middleware/rateLimit.js';
import { validateQuery } from '../middleware/validate.js';
import { asyncRoute } from '../utils/asyncRoute.js';
import { HttpError } from '../utils/httpError.js';
import { learnSearchQuerySchema } from '../validation/glossary.schemas.js';

// PUBLIC "Apprendre" (P2-08): glossary + mini-guides, published only.
const router = Router();
router.use(publicReadLimiter);

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
router.param('slug', (req, res, next, value) => (value.length <= 80 && SLUG.test(value) ? next() : next(new HttpError(404, 'Not found'))));

router.get('/', validateQuery(learnSearchQuerySchema), asyncRoute(search));
router.get('/termes/:slug', asyncRoute(getTerm));
router.get('/guides/:slug', asyncRoute(getGuide));

export default router;
