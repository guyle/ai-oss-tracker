import githubService from './github.service';
import projectService from './project.service';
import metricsService from './metrics.service';
import { logger } from '@/utils/logger';
import { delay } from '@/config/github';

export class DiscoveryService {
  /**
   * Scan for new trending projects and add them to the database
   */
  async scanTrendingProjects(): Promise<void> {
    try {
      logger.info('Starting trending projects scan...');
      
      // Search for repos created in the last 30 days with > 50 stars
      const repos = await githubService.searchTrendingRepos(30, 50);
      logger.info(`Found ${repos.length} trending repositories`);

      let created = 0;
      let updated = 0;

      for (const repo of repos) {
        try {
          const project = await projectService.createProjectFromGitHub(repo);
          
          // If it's a new project or we haven't tracked metrics recently
          await metricsService.recordMetrics(project.id, repo);

          if (project.first_tracked_at.getTime() === project.last_synced_at.getTime()) {
            created++;
            logger.info(`New project discovered: ${repo.full_name} (${repo.stargazers_count} stars)`);
          } else {
            updated++;
          }

          // Delay to respect rate limits
          await delay(200);
        } catch (error) {
          logger.error(`Failed to process ${repo.full_name}`, { error });
        }
      }

      logger.info('Trending scan completed', { created, updated });
    } catch (error) {
      logger.error('Trending scan failed', { error });
      throw error;
    }
  }

  /**
   * Full scan of popular AI projects to ensure we're not missing major ones
   */
  async scanPopularProjects(): Promise<void> {
    try {
      logger.info('Starting popular projects scan...');
      
      // Search for top rated AI repos
      const repos = await githubService.searchAIRepositories(1, 100);
      logger.info(`Found ${repos.length} popular repositories`);

      let created = 0;
      let updated = 0;

      for (const repo of repos) {
        try {
          const project = await projectService.createProjectFromGitHub(repo);
          await metricsService.recordMetrics(project.id, repo);

          if (project.first_tracked_at.getTime() === project.last_synced_at.getTime()) {
            created++;
          } else {
            updated++;
          }

          await delay(200);
        } catch (error) {
          logger.error(`Failed to process ${repo.full_name}`, { error });
        }
      }

      logger.info('Popular scan completed', { created, updated });
    } catch (error) {
      logger.error('Popular scan failed', { error });
      throw error;
    }
  }
}

export default new DiscoveryService();





