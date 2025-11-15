// Metrics service - Business logic for project metrics
import metricsRepository from '@/repositories/metrics.repository';
import { ProjectMetrics, GitHubRepoData } from '@/models/types';
import { logger } from '@/utils/logger';

export class MetricsService {
  /**
   * Record metrics for a project
   */
  async recordMetrics(projectId: number, githubData: GitHubRepoData): Promise<ProjectMetrics> {
    // Get previous metrics to calculate deltas
    const previousMetrics = await metricsRepository.getLatest(projectId);

    // Calculate stars gained in 24 hours
    const starsGained24h = previousMetrics
      ? githubData.stargazers_count - previousMetrics.stars_count
      : 0;

    // Calculate 7-day velocity
    const velocity = await metricsRepository.calculateVelocity(projectId, 7);

    // Get stars gained in 7 days
    const starsGained7d = await metricsRepository.getStarsGained(projectId, 168); // 7 days in hours

    const metricsData: Partial<ProjectMetrics> = {
      stars_count: githubData.stargazers_count,
      forks_count: githubData.forks_count,
      watchers_count: githubData.watchers_count,
      open_issues_count: githubData.open_issues_count,
      stars_gained_24h: starsGained24h,
      stars_gained_7d: starsGained7d || 0,
      stars_velocity: velocity,
    };

    const metrics = await metricsRepository.create(projectId, metricsData);

    logger.info('Metrics recorded', {
      projectId,
      stars: metrics.stars_count,
      velocity: metrics.stars_velocity,
    });

    return metrics;
  }

  /**
   * Get latest metrics for a project
   */
  async getLatestMetrics(projectId: number): Promise<ProjectMetrics | null> {
    return metricsRepository.getLatest(projectId);
  }

  /**
   * Get metrics history for a project
   */
  async getMetricsHistory(
    projectId: number,
    fromDate?: Date,
    toDate?: Date
  ): Promise<ProjectMetrics[]> {
    return metricsRepository.getHistory(projectId, fromDate, toDate);
  }

  /**
   * Calculate velocity for a project
   */
  async calculateVelocity(projectId: number, days = 7): Promise<number> {
    return metricsRepository.calculateVelocity(projectId, days);
  }

  /**
   * Get top gainers (projects with highest star velocity)
   */
  async getTopGainers(limit = 10, language?: string): Promise<ProjectMetrics[]> {
    // This would be implemented with a more complex query
    // For now, return empty array
    logger.debug('Getting top gainers', { limit, language });
    return [];
  }
}

export default new MetricsService();

