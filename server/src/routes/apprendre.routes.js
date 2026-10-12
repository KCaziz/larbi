import { Router } from 'express';
import { addFavorite, getGuide, getTerm, listFavorites, removeFavorite, search } from '../controllers/apprendre.controller.js';
import { FAVORITE_KINDS } from '../constants/learning.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { publicReadLimiter } from '../middleware/rateLimit.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import { HttpError } from '../utils/httpError.js';
import { addFavoriteSchema, learnSearchQuerySchema } from '../validation/glossary.schemas.js';

// PUBLIC "Apprendre" (P2-08): courses, glossary, mini-guides and articles,
// published only. No session is required to search — but the answer depends on
// the session when there is one (`optionalAuth`): content aimed at the viewer's
// FINCLUDIA public comes first, and the text of a premium article is searched
// only for someone allowed to read it. Nothing is ever hidden because of who
// asks; it is only ordered.
const router = Router();
router.use(publicReadLimiter);

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
router.param('slug', (req, res, next, value) => (value.length <= 80 && SLUG.test(value) ? next() : next(new HttpError(404, 'Not found'))));

// Favourites belong to an account. They are a SUB-ROUTER with its own
// `requireAuth` rather than three routes guarded one by one: a parameter
// callback of this router would otherwise run first and answer 404 on a
// malformed id, when the honest answer to someone with no session is 401.
const favorites = Router();
favorites.use(requireAuth);
favorites.param('kind', (req, res, next, value) => (FAVORITE_KINDS.includes(value) ? next() : next(new HttpError(404, 'Not found'))));
favorites.param('refId', uuidParam);
favorites.get('/', asyncRoute(listFavorites));
favorites.post('/', validateBody(addFavoriteSchema), asyncRoute(addFavorite));
favorites.delete('/:kind/:refId', asyncRoute(removeFavorite));
router.use('/favoris', favorites);

router.get('/', optionalAuth, validateQuery(learnSearchQuerySchema), asyncRoute(search));
router.get('/termes/:slug', optionalAuth, asyncRoute(getTerm));
router.get('/guides/:slug', optionalAuth, asyncRoute(getGuide));

export default router;
