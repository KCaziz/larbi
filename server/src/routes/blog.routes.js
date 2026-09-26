import { Router } from 'express';
import { getArticle, getCover, getMedia, listArticles, listCategories, listTags, recommendations } from '../controllers/blog.controller.js';
import { optionalAuth } from '../middleware/auth.js';
import { publicReadLimiter } from '../middleware/rateLimit.js';
import { validateQuery } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import { HttpError } from '../utils/httpError.js';
import { blogLangQuerySchema, blogListQuerySchema } from '../validation/blog.schemas.js';

// PUBLIC blog API (no session): only published content is ever returned.
const router = Router();
router.use(publicReadLimiter);
// Public, but premium content depends on who asks: the session is read when present.
router.use(optionalAuth);

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
router.param('slug', (req, res, next, value) =>
  value.length <= 80 && SLUG.test(value) ? next() : next(new HttpError(404, 'Not found')),
);
router.param('id', uuidParam);

router.get('/articles', validateQuery(blogListQuerySchema), asyncRoute(listArticles));
router.get('/articles/:slug', validateQuery(blogLangQuerySchema), asyncRoute(getArticle));
router.get('/articles/:slug/cover', asyncRoute(getCover));
router.get('/recommendations', validateQuery(blogLangQuerySchema), asyncRoute(recommendations));
router.get('/categories', asyncRoute(listCategories));
router.get('/tags', asyncRoute(listTags));
router.get('/media/:id', asyncRoute(getMedia));

export default router;
