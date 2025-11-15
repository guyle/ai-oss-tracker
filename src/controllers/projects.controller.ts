// Projects controller - Handle HTTP requests for projects
import { Request, Response, NextFunction } from 'express';
import projectService from '@/services/project.service';
import metricsService from '@/services/metrics.service';
import { ValidationError } from '@/utils/errors';
import { ApiResponse, ProjectWithMetrics, ProjectMetrics } from '@/models/types';

/**
 * GET /projects
 * List all projects with pagination
 */
export const getProjects = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    if (page < 1) {
      throw new ValidationError('Page must be >= 1');
    }

    const offset = (page - 1) * limit;

    const filters = {
      language: req.query.language as string | undefined,
      topics: req.query.topics
        ? Array.isArray(req.query.topics)
          ? (req.query.topics as string[])
          : [req.query.topics as string]
        : undefined,
      sortBy: (req.query.sortBy as string) || 'id',
      order: (req.query.order as 'asc' | 'desc') || 'desc',
    };

    const { projects, total } = await projectService.getAllProjects(filters, {
      page,
      limit,
      offset,
    });

    // Transform projects to camelCase and add metrics
    const projectsWithMetrics = await Promise.all(
      projects.map(async (project) => {
        const metrics = await metricsService.getLatestMetrics(project.id);
        return {
          id: project.id,
          fullName: project.full_name,
          name: project.name,
          description: project.description,
          language: project.language,
          topics: project.topics,
          url: project.html_url,
          stars: metrics?.stars_count || 0,
          forks: metrics?.forks_count || 0,
          starsVelocity: metrics?.stars_velocity || null,
          starsGained7d: metrics?.stars_gained_7d || null,
          lastUpdated: project.last_synced_at || project.updated_at,
        };
      })
    );

    const response: ApiResponse<typeof projectsWithMetrics> = {
      data: projectsWithMetrics,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /projects/:id
 * Get project by ID with current metrics
 */
export const getProjectById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new ValidationError('Invalid project ID');
    }

    const project = await projectService.getProject(id);
    
    // Transform to camelCase for frontend
    const response = {
      id: project.id,
      fullName: project.full_name,
      name: project.name,
      description: project.description,
      language: project.language,
      homepage: project.homepage,
      license: project.license,
      topics: project.topics,
      isArchived: project.is_archived,
      createdAt: project.created_at,
      firstTrackedAt: project.first_tracked_at,
      url: project.html_url,
      currentMetrics: project.current_metrics ? {
        stars: project.current_metrics.stars_count,
        forks: project.current_metrics.forks_count,
        watchers: project.current_metrics.watchers_count,
        openIssues: project.current_metrics.open_issues_count,
        starsVelocity: project.current_metrics.stars_velocity,
        starsGained24h: project.current_metrics.stars_gained_24h,
        starsGained7d: project.current_metrics.stars_gained_7d,
      } : {
        stars: 0,
        forks: 0,
        watchers: 0,
        openIssues: 0,
        starsVelocity: null,
        starsGained24h: null,
        starsGained7d: null,
      },
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /projects/:id/history
 * Get metrics history for a project
 */
export const getProjectHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new ValidationError('Invalid project ID');
    }

    const fromDate = req.query.from ? new Date(req.query.from as string) : undefined;
    const toDate = req.query.to ? new Date(req.query.to as string) : undefined;

    const history = await metricsService.getMetricsHistory(id, fromDate, toDate);

    const project = await projectService.getProject(id);

    // Transform to camelCase for frontend
    res.json({
      projectId: id,
      fullName: project.full_name,
      history: history.map((metric) => ({
        recordedAt: metric.recorded_at,
        stars: metric.stars_count,
        forks: metric.forks_count,
        watchers: metric.watchers_count,
        starsGained: metric.stars_gained_24h || 0,
      })),
    });
  } catch (error) {
    next(error);
  }
};

