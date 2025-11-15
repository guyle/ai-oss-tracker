// Project routes
import { Router } from 'express';
import { getProjects, getProjectById, getProjectHistory } from '@/controllers/projects.controller';

const router = Router();

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.get('/:id/history', getProjectHistory);

export default router;

