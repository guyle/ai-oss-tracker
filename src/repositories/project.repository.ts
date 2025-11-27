// Project repository - Database queries for projects
import { query } from '@/config/database';
import { Project, ProjectFilters, PaginationParams } from '@/models/types';
import { logger } from '@/utils/logger';

export class ProjectRepository {
  async findById(id: number): Promise<Project | null> {
    const sql = 'SELECT * FROM projects WHERE id = $1';
    const result = await query<Project>(sql, [id]);
    return result.rows[0] || null;
  }

  async findByFullName(fullName: string): Promise<Project | null> {
    const sql = 'SELECT * FROM projects WHERE full_name = $1';
    const result = await query<Project>(sql, [fullName]);
    return result.rows[0] || null;
  }

  async findByGitHubId(githubId: number): Promise<Project | null> {
    const sql = 'SELECT * FROM projects WHERE github_id = $1';
    const result = await query<Project>(sql, [githubId]);
    return result.rows[0] || null;
  }

  async findAll(
    filters: ProjectFilters = {},
    pagination: PaginationParams
  ): Promise<Project[]> {
    // Map frontend sort fields to valid database columns or queries
    const sortByMapping: Record<string, string> = {
      stars: '(SELECT COALESCE(MAX(stars_count), 0) FROM project_metrics WHERE project_id = projects.id)',
      velocity: '(SELECT COALESCE(stars_velocity, 0) FROM project_metrics WHERE project_id = projects.id AND recorded_at = (SELECT MAX(recorded_at) FROM project_metrics WHERE project_id = projects.id))',
      created: 'created_at',
      id: 'id',
    };

    let sql = 'SELECT * FROM projects WHERE 1=1';
    const params: unknown[] = [];
    let paramCount = 1;

    // Apply filters
    if (filters.language) {
      sql += ` AND language = $${paramCount}`;
      params.push(filters.language);
      paramCount++;
    }

    if (filters.topics && filters.topics.length > 0) {
      sql += ` AND topics @> $${paramCount}::text[]`;
      params.push(filters.topics);
      paramCount++;
    }

    if (filters.minStars) {
      sql += ` AND id IN (
        SELECT project_id FROM project_metrics 
        WHERE stars_count >= $${paramCount}
        ORDER BY recorded_at DESC
        LIMIT 1
      )`;
      params.push(filters.minStars);
      paramCount++;
    }

    // Sorting - use mapping to handle stars/velocity sorting
    const requestedSort = filters.sortBy || 'id';
    const sortExpression = sortByMapping[requestedSort] || sortByMapping['id'];
    const order = filters.order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortExpression} ${order}`;

    // Pagination
    sql += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(pagination.limit, pagination.offset || 0);

    const result = await query<Project>(sql, params);
    return result.rows;
  }

  async count(filters: ProjectFilters = {}): Promise<number> {
    let sql = 'SELECT COUNT(*) as count FROM projects WHERE 1=1';
    const params: unknown[] = [];
    let paramCount = 1;

    if (filters.language) {
      sql += ` AND language = $${paramCount}`;
      params.push(filters.language);
      paramCount++;
    }

    if (filters.topics && filters.topics.length > 0) {
      sql += ` AND topics @> $${paramCount}::text[]`;
      params.push(filters.topics);
      paramCount++;
    }

    const result = await query<{ count: string }>(sql, params);
    return parseInt(result.rows[0].count, 10);
  }

  async create(projectData: Partial<Project>): Promise<Project> {
    const sql = `
      INSERT INTO projects (
        github_id, full_name, name, description, html_url,
        homepage, language, topics, created_at, updated_at,
        pushed_at, is_fork, is_archived, license
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      projectData.github_id,
      projectData.full_name,
      projectData.name,
      projectData.description,
      projectData.html_url,
      projectData.homepage,
      projectData.language,
      projectData.topics || [],
      projectData.created_at || new Date(),
      projectData.updated_at || new Date(),
      projectData.pushed_at,
      projectData.is_fork || false,
      projectData.is_archived || false,
      projectData.license,
    ];

    const result = await query<Project>(sql, values);
    logger.info('Project created', { projectId: result.rows[0].id });
    return result.rows[0];
  }

  async upsert(projectData: Partial<Project>): Promise<Project> {
    const sql = `
      INSERT INTO projects (
        github_id, full_name, name, description, html_url,
        homepage, language, topics, created_at, updated_at,
        pushed_at, is_fork, is_archived, license
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (github_id) 
      DO UPDATE SET
        updated_at = EXCLUDED.updated_at,
        description = EXCLUDED.description,
        topics = EXCLUDED.topics,
        language = EXCLUDED.language,
        is_archived = EXCLUDED.is_archived,
        last_synced_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const values = [
      projectData.github_id,
      projectData.full_name,
      projectData.name,
      projectData.description,
      projectData.html_url,
      projectData.homepage,
      projectData.language,
      projectData.topics || [],
      projectData.created_at || new Date(),
      projectData.updated_at || new Date(),
      projectData.pushed_at,
      projectData.is_fork || false,
      projectData.is_archived || false,
      projectData.license,
    ];

    const result = await query<Project>(sql, values);
    return result.rows[0];
  }

  async update(id: number, updates: Partial<Project>): Promise<Project | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const sql = `
      UPDATE projects 
      SET ${fields.join(', ')}, last_synced_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query<Project>(sql, values);
    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const sql = 'DELETE FROM projects WHERE id = $1';
    const result = await query(sql, [id]);
    return (result.rowCount || 0) > 0;
  }
}

export default new ProjectRepository();

