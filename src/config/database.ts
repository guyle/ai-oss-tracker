// PostgreSQL database configuration
import { Pool, QueryResult, QueryResultRow } from 'pg';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { DatabaseError } from '@/utils/errors';

// Create connection pool
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Handle pool errors
pool.on('error', (err) => {
  logger.error('Unexpected database pool error', { error: err.message });
});

// Query helper with logging and error handling
export const query = async <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> => {
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    logger.debug('Database query executed', {
      query: text.substring(0, 100),
      duration: `${duration}ms`,
      rows: result.rowCount,
    });

    return result;
  } catch (error) {
    logger.error('Database query error', {
      query: text,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new DatabaseError('Database query failed', {
      query: text.substring(0, 100),
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

// Get a client from the pool for transactions
export const getClient = async () => {
  try {
    return await pool.connect();
  } catch (error) {
    logger.error('Failed to get database client', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new DatabaseError('Failed to connect to database');
  }
};

// Health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await query('SELECT 1');
    return true;
  } catch (error) {
    logger.error('Database health check failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
};

// Graceful shutdown
export const closeDatabasePool = async (): Promise<void> => {
  try {
    await pool.end();
    logger.info('Database pool closed');
  } catch (error) {
    logger.error('Error closing database pool', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export default pool;

