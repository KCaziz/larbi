import { Router } from 'express';
import { listPublicChatbotEntries } from '../controllers/chatbot.controller.js';
import { publicReadLimiter } from '../middleware/rateLimit.js';
import { validateQuery } from '../middleware/validate.js';
import { asyncRoute } from '../utils/asyncRoute.js';
import { chatbotLangQuerySchema } from '../validation/chatbot.schemas.js';

// PUBLIC guided assistant (P3-07): read-only, published entries only.
const router = Router();
router.use(publicReadLimiter);

router.get('/entries', validateQuery(chatbotLangQuerySchema), asyncRoute(listPublicChatbotEntries));

export default router;
