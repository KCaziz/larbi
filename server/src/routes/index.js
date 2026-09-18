import { Router } from 'express';
import healthRoutes from './health.routes.js';
import accountTypesRoutes from './accountTypes.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/account-types', accountTypesRoutes);

export default router;
