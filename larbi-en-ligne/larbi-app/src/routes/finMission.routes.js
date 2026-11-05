import { Router } from 'express';
import { prisma } from '../config/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { certificationFor } from '../services/finCertification.service.js';
import { getMissionFor, listMissionsFor, playMission } from '../services/finMission.service.js';
import { asyncRoute } from '../utils/asyncRoute.js';
import { HttpError } from '../utils/httpError.js';
import { playMissionSchema } from '../validation/finMissions.schemas.js';

// Pedagogical missions (P8-17), the learner's side. Session required: an
// attempt belongs to a person. The slug is checked like every address.
const router = Router();
router.use(requireAuth);
router.param('slug', (req, res, next, value) => (/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value) ? next() : next(new HttpError(404, 'Not found'))));

// Where the person stands towards the certificate of their parcours (P8-34).
router.get('/missions/certification', asyncRoute(async (req, res) => res.json({ certification: await certificationFor(prisma, req.user) })));
router.get('/missions', asyncRoute(async (req, res) => res.json({ missions: await listMissionsFor(prisma, req.user) })));
router.get('/missions/:slug', asyncRoute(async (req, res) => res.json({ mission: await getMissionFor(prisma, req.user, req.params.slug) })));
router.post(
  '/missions/:slug/jouer',
  validateBody(playMissionSchema),
  asyncRoute(async (req, res) => res.status(201).json(await playMission(prisma, req.user, req.params.slug, req.body.choices))),
);

export default router;
