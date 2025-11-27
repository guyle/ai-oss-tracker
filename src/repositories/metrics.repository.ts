// Metrics repository - Database queries for project metrics
import { query } from '@/config/database';
import { ProjectMetrics } from '@/models/types';
import { logger } from '@/utils/logger';

export class MetricsRepository {
  async create(
    projectId: number,
    metricsData: Partial<ProjectMetrics>
  ): Promise<ProjectMetrics> {
    const sql = `
      INSERT INTO project_metrics (
        project_id, stars_count, forks_count, watchers_count,
        open_issues_count, stars_gained_24h, stars_gained_7d, stars_velocity
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      projectId,
      metricsData.stars_count,
      metricsData.forks_count,
      metricsData.watchers_count,
      metricsData.open_issues_count,
      metricsData.stars_gained_24h || 0,
      metricsData.stars_gained_7d || 0,
      metricsData.stars_velocity || 0,
    ];

    const result = await query<ProjectMetrics>(sql, values);
    logger.debug('Metrics recorded', { projectId, metricsId: result.rows[0].id });
    return result.rows[0];
  }

  async getLatest(projectId: number): Promise<ProjectMetrics | null> {
    const sql = `
      SELECT * FROM project_metrics
      WHERE project_id = $1
      ORDER BY recorded_at DESC
      LIMIT 1
    `;
    const result = await query<ProjectMetrics>(sql, [projectId]);
    return result.rows[0] || null;
  }

  async getHistory(
    projectId: number,
    fromDate?: Date,
    toDate?: Date,
    limit?: number
  ): Promise<ProjectMetrics[]> {
    let sql = 'SELECT * FROM project_metrics WHERE project_id = $1';
    const params: unknown[] = [projectId];
    let paramCount = 2;

    if (fromDate) {
      sql += ` AND recorded_at >= $${paramCount}`;
      params.push(fromDate);
      paramCount++;
    }

    if (toDate) {
      sql += ` AND recorded_at <= $${paramCount}`;
      params.push(toDate);
      paramCount++;
    }

    sql += ' ORDER BY recorded_at ASC';

    if (limit) {
      sql += ` LIMIT $${paramCount}`;
      params.push(limit);
    }

    const result = await query<ProjectMetrics>(sql, params);
    return result.rows;
  }

  async calculateVelocity(projectId: number, days = 7): Promise<number> {
    const sql = `
      SELECT 
        (MAX(stars_count) - MIN(stars_count))::float / 
        GREATEST(EXTRACT(EPOCH FROM (MAX(recorded_at) - MIN(recorded_at))) / 86400, 1) 
        as velocity
      FROM project_metrics
      WHERE project_id = $1
        AND recorded_at > NOW() - INTERVAL '${days} days'
    `;

    const result = await query<{ velocity: number }>(sql, [projectId]);
    return result.rows[0]?.velocity || 0;
  }

  async getStarsGained(projectId: number, hours = 24): Promise<number> {
    const sql = `
      SELECT 
        (MAX(stars_count) - MIN(stars_count)) as gained
      FROM project_metrics
      WHERE project_id = $1
        AND recorded_at > NOW() - INTERVAL '${hours} hours'
    `;

    const result = await query<{ gained: number }>(sql, [projectId]);
    return result.rows[0]?.gained || 0;
  }
}

export default new MetricsRepository();

