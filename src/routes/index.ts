// Route aggregator
import { Router } from 'express';
import projectsRoutes from './projects.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/projects', projectsRoutes);
router.use('/admin', adminRoutes);

export default router;

