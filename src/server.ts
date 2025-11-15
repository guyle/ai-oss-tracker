// Server entry point
import app from './app';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { checkDatabaseHealth, closeDatabasePool } from '@/config/database';

const PORT = env.PORT;

// Start server
const server = app.listen(PORT, async () => {
  logger.info(`Server started on port ${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);

  // Check database connection
  const dbHealthy = await checkDatabaseHealth();
  if (dbHealthy) {
    logger.info('Database connection: healthy');
  } else {
    logger.error('Database connection: failed');
    logger.error('Please ensure PostgreSQL is running and DATABASE_URL is correct');
  }

  logger.info(`API available at http://localhost:${PORT}/api/v1`);
  logger.info(`Health check at http://localhost:${PORT}/health`);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, starting graceful shutdown`);

  server.close(async () => {
    logger.info('HTTP server closed');

    // Close database pool
    await closeDatabasePool();

    logger.info('All connections closed, exiting process');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forcefully shutting down after timeout');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
  gracefulShutdown('unhandledRejection');
});

export default server;

