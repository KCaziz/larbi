import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import learnRoutes from './learn.routes.js';
import adminRoutes from './admin.routes.js';
import contactRoutes from './contact.routes.js';
import certificatesRoutes from './certificates.routes.js';
import blogRoutes from './blog.routes.js';
import newsletterRoutes from './newsletter.routes.js';
import accountTypesRoutes from './accountTypes.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/learn', learnRoutes);
router.use('/contact', contactRoutes);
router.use('/certificates', certificatesRoutes);
router.use('/blog', blogRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/account-types', accountTypesRoutes);

export default router;
