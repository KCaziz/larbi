import { Router } from 'express';
import {
  confirmSubscription,
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
} from '../controllers/newsletter.controller.js';
import { newsletterLimiter, newsletterLinkLimiter } from '../middleware/rateLimit.js';
import { validateBody } from '../middleware/validate.js';
import { asyncRoute } from '../utils/asyncRoute.js';
import { subscribeSchema, tokenSchema } from '../validation/newsletter.schemas.js';

// PUBLIC newsletter routes. Confirming and unsubscribing are POSTs on purpose: mail
// scanners and link previews open every link of a message with a GET, and must not be
// able to confirm or cancel anything on the person's behalf.
const router = Router();

router.post('/subscribe', newsletterLimiter, validateBody(subscribeSchema), asyncRoute(subscribeToNewsletter));
router.post('/confirm', newsletterLinkLimiter, validateBody(tokenSchema), asyncRoute(confirmSubscription));
router.post('/unsubscribe', newsletterLinkLimiter, validateBody(tokenSchema), asyncRoute(unsubscribeFromNewsletter));

export default router;
