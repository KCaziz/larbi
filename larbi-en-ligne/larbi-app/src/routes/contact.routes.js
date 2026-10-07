import { Router } from 'express';
import { createContactMessage } from '../controllers/contact.controller.js';
import { contactLimiter } from '../middleware/rateLimit.js';
import { validateBody } from '../middleware/validate.js';
import { contactSchema } from '../validation/contact.schemas.js';

const router = Router();

router.post('/', contactLimiter, validateBody(contactSchema), createContactMessage);

export default router;
