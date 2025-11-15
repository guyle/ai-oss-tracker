// Project service - Business logic for projects
import projectRepository from '@/repositories/project.repository';
import metricsRepository from '@/repositories/metrics.repository';
import {
  Project,
  ProjectWithMetrics,
  ProjectFilters,
  PaginationParams,
  GitHubRepoData,
} from '@/models/types';
import { NotFoundError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export class ProjectService {
  /**
   * Get project by ID with latest metrics
   */
  async getProject(id: number): Promise<ProjectWithMetrics> {
    const project = await projectRepository.findById(id);

    if (!project) {
      throw new NotFoundError('Project not found', { projectId: id });
    }

    const metrics = await metricsRepository.getLatest(id);

    return {
      ...project,
      current_metrics: metrics || undefined,
    };
  }

  /**
   * Get all projects with pagination and filters
   */
  async getAllProjects(
    filters: ProjectFilters = {},
    pagination: PaginationParams
  ): Promise<{ projects: Project[]; total: number }> {
    const projects = await projectRepository.findAll(filters, pagination);
    const total = await projectRepository.count(filters);

    logger.debug('Retrieved projects', { count: projects.length, total });

    return { projects, total };
  }

  /**
   * Create project from GitHub data
   */
  async createProjectFromGitHub(githubData: GitHubRepoData): Promise<Project> {
    const projectData: Partial<Project> = {
      github_id: githubData.id,
      full_name: githubData.full_name,
      name: githubData.name,
      description: githubData.description,
      html_url: githubData.html_url,
      homepage: githubData.homepage,
      language: githubData.language,
      topics: githubData.topics || [],
      created_at: new Date(githubData.created_at),
      updated_at: new Date(githubData.updated_at),
      pushed_at: githubData.pushed_at ? new Date(githubData.pushed_at) : null,
      is_fork: githubData.fork,
      is_archived: githubData.archived,
      license: githubData.license?.spdx_id || null,
    };

    const project = await projectRepository.upsert(projectData);
    logger.info('Project created/updated from GitHub', { projectId: project.id });

    return project;
  }

  /**
   * Update project
   */
  async updateProject(id: number, updates: Partial<Project>): Promise<Project> {
    const project = await projectRepository.update(id, updates);

    if (!project) {
      throw new NotFoundError('Project not found', { projectId: id });
    }

    logger.info('Project updated', { projectId: id });
    return project;
  }

  /**
   * Delete project
   */
  async deleteProject(id: number): Promise<void> {
    const deleted = await projectRepository.delete(id);

    if (!deleted) {
      throw new NotFoundError('Project not found', { projectId: id });
    }

    logger.info('Project deleted', { projectId: id });
  }

  /**
   * Get project by full name (owner/repo)
   */
  async getProjectByFullName(fullName: string): Promise<Project | null> {
    return projectRepository.findByFullName(fullName);
  }

  /**
   * Check if project exists
   */
  async projectExists(githubId: number): Promise<boolean> {
    const project = await projectRepository.findByGitHubId(githubId);
    return project !== null;
  }
}

export default new ProjectService();

