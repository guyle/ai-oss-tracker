// Admin routes
import { Router } from 'express';
import { getHealth, getStats } from '@/controllers/admin.controller';

const router = Router();

router.get('/health', getHealth);
router.get('/stats', getStats);

export default router;

