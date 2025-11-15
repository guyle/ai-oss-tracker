// Script to seed initial projects from GitHub
import githubService from '../src/services/github.service';
import projectService from '../src/services/project.service';
import metricsService from '../src/services/metrics.service';
import { logger } from '../src/utils/logger';
import { delay } from '../src/config/github';

async function seedProjects() {
  try {
    logger.info('Starting project seeding from GitHub...');

    // Search for AI repositories
    const repos = await githubService.searchAIRepositories(1, 500);
    logger.info(`Found ${repos.length} repositories`);

    let created = 0;
    let updated = 0;

    for (const repo of repos) {
      try {
        logger.info(`Processing: ${repo.full_name}`);

        // Create/update project
        const project = await projectService.createProjectFromGitHub(repo);

        // Record initial metrics
        await metricsService.recordMetrics(project.id, repo);

        if (project.first_tracked_at === project.last_synced_at) {
          created++;
        } else {
          updated++;
        }

        logger.info(`✓ ${repo.full_name} - Stars: ${repo.stargazers_count}`);

        // Delay to respect rate limits
        await delay(200);
      } catch (error) {
        logger.error(`Failed to process ${repo.full_name}`, { error });
      }
    }

    logger.info('Seeding completed!');
    logger.info(`Created: ${created}, Updated: ${updated}`);
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed', { error });
    process.exit(1);
  }
}

// Run seeding
seedProjects();

