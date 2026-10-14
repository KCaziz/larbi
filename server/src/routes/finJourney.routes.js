import { Router } from 'express';
import { getJourney, getJourneyMap } from '../controllers/finJourney.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncRoute } from '../utils/asyncRoute.js';

// The journey map of the 8 publics (P6-17), from the client's tab
// `19_Cartes_Parcours`. Read-only: it describes what a public may open, and
// the protection itself is `requireAdult` on the routes behind the
// adults-only screens — never this answer.
const router = Router();
router.use(requireAuth);

// The whole map, which doubles as the provenance matrix of P6-21. Declared
// before `/parcours` so the word is never read as something else.
router.get('/parcours/carte', asyncRoute(getJourneyMap));
router.get('/parcours', getJourney);

export default router;
