import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { listSubscriptions, publicKey, subscribe, unsubscribe } from '../services/finPush.service.js';
import {
  getNotificationReferences,
  getNotifications,
  getSettings,
  getUnreadCount,
  postMarkAllRead,
  putNotificationRead,
  putSettings,
} from '../controllers/finNotification.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { asyncRoute, uuidParam } from '../utils/asyncRoute.js';
import { emptyBodySchema, listQuerySchema, readSchema, settingsSchema } from '../validation/finNotification.schemas.js';

// Notifications and alerts (P6-18), screen C24.
const router = Router();
router.use(requireAuth);
router.param('id', uuidParam);

router.get('/notifications/references', getNotificationReferences);
router.get('/notifications/non-lues', asyncRoute(getUnreadCount));
// Web Push (P8-24): the public key, the person's browsers, subscribing with an
// explicit consent, and turning a browser off.
const subscribeSchema = z
  .object({ consent: z.literal(true), endpoint: z.string().url().max(700), keys: z.object({ p256dh: z.string().min(10).max(200), auth: z.string().min(10).max(100) }).strict() })
  .strict();
// Turned off from the browser itself (its endpoint) or from the list (its id).
const unsubscribeSchema = z
  .object({ endpoint: z.string().url().max(700).optional(), id: z.string().uuid().optional() })
  .strict()
  .refine((body) => (body.endpoint === undefined) !== (body.id === undefined), { message: 'Give an endpoint or an id' });
router.get('/notifications/push/cle', (req, res) => res.json({ publicKey: publicKey() }));
router.get('/notifications/push/navigateurs', asyncRoute(async (req, res) => res.json({ navigateurs: await listSubscriptions(prisma, req.user.id) })));
router.post('/notifications/push/abonnement', validateBody(subscribeSchema), asyncRoute(async (req, res) => res.status(201).json({ navigateur: await subscribe(prisma, req.user.id, req.body, req.get('user-agent')) })));
router.delete('/notifications/push/abonnement', validateBody(unsubscribeSchema), asyncRoute(async (req, res) => res.json(await unsubscribe(prisma, req.user.id, req.body))));
router.get('/notifications/parametres', asyncRoute(getSettings));
router.put('/notifications/parametres', validateBody(settingsSchema), asyncRoute(putSettings));
router.post('/notifications/tout-lire', validateBody(emptyBodySchema), asyncRoute(postMarkAllRead));

router.get('/notifications', validateQuery(listQuerySchema), asyncRoute(getNotifications));
router.put('/notifications/:id/lu', validateBody(readSchema), asyncRoute(putNotificationRead));

export default router;
