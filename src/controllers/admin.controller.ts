// Admin controller - Handle admin/system endpoints
import { Request, Response, NextFunction } from 'express';
import { checkDatabaseHealth } from '@/config/database';
import githubService from '@/services/github.service';
import projectRepository from '@/repositories/project.repository';

/**
 * GET /admin/health
 * System health check
 */
export const getHealth = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const dbHealthy = await checkDatabaseHealth();
    let githubHealthy = true;
    let rateLimit;

    try {
      rateLimit = await githubService.getRateLimit();
    } catch (error) {
      githubHealthy = false;
    }

    const health = {
      status: dbHealthy && githubHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        github: githubHealthy ? 'healthy' : 'unhealthy',
      },
      rateLimit: rateLimit || null,
    };

    res.json(health);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/stats
 * System statistics
 */
export const getStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const totalProjects = await projectRepository.count();
    const rateLimit = await githubService.getRateLimit();
    const dbHealthy = await checkDatabaseHealth();

    res.json({
      totalProjects,
      apiQuota: {
        remaining: rateLimit.remaining,
        limit: rateLimit.limit,
        resetAt: rateLimit.reset,
      },
      health: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        github: 'healthy',
      },
    });
  } catch (error) {
    next(error);
  }
};

