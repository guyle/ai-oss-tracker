// Database test helpers
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import path from 'path';

let testPool: Pool | null = null;

/**
 * Create test database connection pool
 */
export function createTestPool(): Pool {
  if (!testPool) {
    testPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return testPool;
}

/**
 * Close test database connection pool
 */
export async function closeTestPool(): Promise<void> {
  if (testPool) {
    await testPool.end();
    testPool = null;
  }
}

/**
 * Initialize test database schema
 */
export async function initTestDatabase(): Promise<void> {
  const pool = createTestPool();
  const schemaPath = path.join(__dirname, '../../src/db/schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  
  try {
    // Drop existing tables
    await pool.query(`
      DROP TABLE IF EXISTS project_metrics CASCADE;
      DROP TABLE IF EXISTS projects CASCADE;
    `);
    
    // Run schema creation
    await pool.query(schema);
  } catch (error) {
    console.error('Failed to initialize test database:', error);
    throw error;
  }
}

/**
 * Truncate all tables (fast reset between tests)
 */
export async function truncateTables(): Promise<void> {
  const pool = createTestPool();
  await pool.query(`
    TRUNCATE TABLE project_metrics CASCADE;
    TRUNCATE TABLE projects CASCADE;
  `);
}

/**
 * Seed projects into test database
 */
export async function seedProjects(projects: Array<{
  github_id: number;
  full_name: string;
  name: string;
  description?: string;
  html_url: string;
  language?: string;
  topics?: string[];
  created_at?: Date;
  updated_at?: Date;
}>): Promise<void> {
  const pool = createTestPool();
  
  for (const project of projects) {
    await pool.query(
      `INSERT INTO projects (
        github_id, full_name, name, description, html_url, 
        language, topics, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (github_id) DO NOTHING`,
      [
        project.github_id,
        project.full_name,
        project.name,
        project.description || null,
        project.html_url,
        project.language || null,
        project.topics || [],
        project.created_at || new Date(),
        project.updated_at || new Date(),
      ]
    );
  }
}

/**
 * Seed metrics into test database
 */
export async function seedMetrics(metrics: Array<{
  project_id: number;
  stars_count: number;
  forks_count: number;
  open_issues_count: number;
  watchers_count: number;
  recorded_at?: Date;
}>): Promise<void> {
  const pool = createTestPool();
  
  for (const metric of metrics) {
    await pool.query(
      `INSERT INTO project_metrics (
        project_id, stars_count, forks_count, 
        open_issues_count, watchers_count, recorded_at
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        metric.project_id,
        metric.stars_count,
        metric.forks_count,
        metric.open_issues_count,
        metric.watchers_count,
        metric.recorded_at || new Date(),
      ]
    );
  }
}

/**
 * Get project by full name (for assertions)
 */
export async function getProjectByFullName(fullName: string): Promise<any> {
  const pool = createTestPool();
  const result = await pool.query(
    'SELECT * FROM projects WHERE full_name = $1',
    [fullName]
  );
  return result.rows[0] || null;
}

/**
 * Get project metrics count (for assertions)
 */
export async function getMetricsCount(projectId: number): Promise<number> {
  const pool = createTestPool();
  const result = await pool.query(
    'SELECT COUNT(*) FROM project_metrics WHERE project_id = $1',
    [projectId]
  );
  return parseInt(result.rows[0].count, 10);
}

/**
 * Check if test database is accessible
 */
export async function checkTestDatabase(): Promise<boolean> {
  try {
    const pool = createTestPool();
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Test database not accessible:', error);
    return false;
  }
}

