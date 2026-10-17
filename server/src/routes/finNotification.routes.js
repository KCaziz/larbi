import { Router } from 'express';
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
router.get('/notifications/parametres', asyncRoute(getSettings));
router.put('/notifications/parametres', validateBody(settingsSchema), asyncRoute(putSettings));
router.post('/notifications/tout-lire', validateBody(emptyBodySchema), asyncRoute(postMarkAllRead));

router.get('/notifications', validateQuery(listQuerySchema), asyncRoute(getNotifications));
router.put('/notifications/:id/lu', validateBody(readSchema), asyncRoute(putNotificationRead));

export default router;
