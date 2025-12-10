import cron from 'node-cron';
import discoveryService from '@/services/discovery.service';
import { logger } from '@/utils/logger';

export class Scheduler {
  private jobs: cron.ScheduledTask[] = [];

  start() {
    logger.info('Starting scheduler...');

    // Run trending scan every day at 2:00 AM
    this.schedule('0 2 * * *', async () => {
      logger.info('Running daily trending projects scan');
      await discoveryService.scanTrendingProjects();
    });

    // Run popular scan every Sunday at 3:00 AM
    this.schedule('0 3 * * 0', async () => {
      logger.info('Running weekly popular projects scan');
      await discoveryService.scanPopularProjects();
    });

    logger.info(`Scheduler started with ${this.jobs.length} jobs`);
  }

  stop() {
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    logger.info('Scheduler stopped');
  }

  private schedule(cronExpression: string, task: () => Promise<void>) {
    const job = cron.schedule(cronExpression, async () => {
      try {
        await task();
      } catch (error) {
        logger.error('Scheduled task failed', { error });
      }
    });
    this.jobs.push(job);
  }
}

export default new Scheduler();





