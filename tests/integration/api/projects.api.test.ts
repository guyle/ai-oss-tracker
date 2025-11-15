// Projects API integration tests
import request from 'supertest';
import { getTestApp } from '../../helpers/app.helper';
import {
  initTestDatabase,
  truncateTables,
  seedProjects,
  seedMetrics,
  closeTestPool,
} from '../../helpers/database.helper';
import { mockProjects, mockMetrics } from '../../fixtures/projects';

describe('Projects API Integration Tests', () => {
  const app = getTestApp();

  // Setup test database
  beforeAll(async () => {
    await initTestDatabase();
  });

  // Clean up between tests
  beforeEach(async () => {
    await truncateTables();
  });

  // Close connections
  afterAll(async () => {
    await closeTestPool();
  });

  describe('GET /api/v1/projects', () => {
    it('should return paginated projects with default params', async () => {
      // Arrange: Seed test data
      await seedProjects([
        mockProjects.tensorflow,
        mockProjects.pytorch,
        mockProjects.langchain,
      ]);

      // Act: Make request
      const response = await request(app)
        .get('/api/v1/projects')
        .expect('Content-Type', /json/)
        .expect(200);

      // Assert: Verify response structure
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(3);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 50,
        total: 3,
      });
    });

    it('should filter projects by language', async () => {
      // Arrange: Seed projects with different languages
      await seedProjects([
        mockProjects.tensorflow, // Python
        mockProjects.pytorch,     // Python
        { ...mockProjects.langchain, language: 'JavaScript' },
      ]);

      // Act: Filter by Python
      const response = await request(app)
        .get('/api/v1/projects')
        .query({ language: 'Python' })
        .expect(200);

      // Assert: Only Python projects returned
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((p: any) => p.language === 'Python')).toBe(true);
    });

    it('should filter projects by min_stars', async () => {
      // Arrange: Seed projects
      await seedProjects([mockProjects.tensorflow]);
      const project = await request(app)
        .get('/api/v1/projects')
        .expect(200)
        .then((res: any) => res.body.data[0]);

      // Add metrics
      await seedMetrics([{
        project_id: project.id,
        stars_count: 100000,
        forks_count: 50000,
        open_issues_count: 100,
        watchers_count: 100000,
      }]);

      // Act: Filter by stars
      const response = await request(app)
        .get('/api/v1/projects')
        .query({ min_stars: 50000 })
        .expect(200);

      // Assert: High-star projects returned
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter projects by topics', async () => {
      // Arrange: Seed projects with topics
      await seedProjects([
        mockProjects.tensorflow,  // Has 'machine-learning'
        mockProjects.langchain,   // Has 'llm'
      ]);

      // Act: Filter by topic
      const response = await request(app)
        .get('/api/v1/projects')
        .query({ topics: 'machine-learning' })
        .expect(200);

      // Assert: Only projects with that topic
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].full_name).toBe('tensorflow/tensorflow');
    });

    it('should handle pagination correctly', async () => {
      // Arrange: Seed multiple projects
      await seedProjects([
        mockProjects.tensorflow,
        mockProjects.pytorch,
        mockProjects.langchain,
        mockProjects.huggingface,
      ]);

      // Act: Get page 1 with limit 2
      const page1 = await request(app)
        .get('/api/v1/projects')
        .query({ page: 1, limit: 2 })
        .expect(200);

      // Assert: First page
      expect(page1.body.data).toHaveLength(2);
      expect(page1.body.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: 4,
      });

      // Act: Get page 2
      const page2 = await request(app)
        .get('/api/v1/projects')
        .query({ page: 2, limit: 2 })
        .expect(200);

      // Assert: Second page has different projects
      expect(page2.body.data).toHaveLength(2);
      expect(page2.body.data[0].id).not.toBe(page1.body.data[0].id);
    });

    it('should return 400 for invalid pagination params', async () => {
      // Act & Assert: Invalid page
      await request(app)
        .get('/api/v1/projects')
        .query({ page: 0 })
        .expect(400);

      // Act & Assert: Invalid limit
      await request(app)
        .get('/api/v1/projects')
        .query({ limit: 1000 })
        .expect(400);
    });

    it('should return empty array when no matches', async () => {
      // Arrange: Seed projects
      await seedProjects([mockProjects.tensorflow]);

      // Act: Filter with no matches
      const response = await request(app)
        .get('/api/v1/projects')
        .query({ language: 'Rust' })
        .expect(200);

      // Assert: Empty results
      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination.total).toBe(0);
    });

    it('should sort projects by stars_count DESC by default', async () => {
      // Arrange: Seed projects
      await seedProjects([
        mockProjects.tensorflow,
        mockProjects.pytorch,
        mockProjects.langchain,
      ]);

      // Get project IDs
      const projects = await request(app)
        .get('/api/v1/projects')
        .expect(200)
        .then((res: any) => res.body.data);

      // Add metrics with different star counts
      await seedMetrics([
        { project_id: projects[0].id, ...mockMetrics.tensorflow },
        { project_id: projects[1].id, stars_count: 5000, forks_count: 100, open_issues_count: 10, watchers_count: 5000 },
        { project_id: projects[2].id, stars_count: 50000, forks_count: 1000, open_issues_count: 50, watchers_count: 50000 },
      ]);

      // Act: Get projects (should be sorted by stars)
      const response = await request(app)
        .get('/api/v1/projects')
        .query({ sort: 'stars' })
        .expect(200);

      // Assert: Sorted by stars DESC
      expect(response.body.data[0].id).toBe(projects[0].id); // tensorflow (highest stars)
    });
  });

  describe('GET /api/v1/projects/:id', () => {
    it('should return project with latest metrics', async () => {
      // Arrange: Seed project
      await seedProjects([mockProjects.tensorflow]);
      const project = await request(app)
        .get('/api/v1/projects')
        .expect(200)
        .then((res: any) => res.body.data[0]);

      // Add metrics
      await seedMetrics([{
        project_id: project.id,
        ...mockMetrics.tensorflow,
      }]);

      // Act: Get project by ID
      const response = await request(app)
        .get(`/api/v1/projects/${project.id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      // Assert: Project with metrics
      expect(response.body).toHaveProperty('id', project.id);
      expect(response.body).toHaveProperty('full_name', 'tensorflow/tensorflow');
      expect(response.body).toHaveProperty('current_metrics');
      expect(response.body.current_metrics).toMatchObject({
        stars_count: mockMetrics.tensorflow.stars_count,
        forks_count: mockMetrics.tensorflow.forks_count,
      });
    });

    it('should return 404 for non-existent project', async () => {
      // Act & Assert
      const response = await request(app)
        .get('/api/v1/projects/99999')
        .expect('Content-Type', /json/)
        .expect(404);

      // Assert: Error response
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid id format', async () => {
      // Act & Assert
      await request(app)
        .get('/api/v1/projects/invalid')
        .expect(400);
    });

    it('should return project without metrics if none exist', async () => {
      // Arrange: Seed project without metrics
      await seedProjects([mockProjects.langchain]);
      const project = await request(app)
        .get('/api/v1/projects')
        .expect(200)
        .then((res: any) => res.body.data[0]);

      // Act: Get project
      const response = await request(app)
        .get(`/api/v1/projects/${project.id}`)
        .expect(200);

      // Assert: Project without metrics
      expect(response.body).toHaveProperty('id', project.id);
      expect(response.body.current_metrics).toBeUndefined();
    });
  });

  describe('GET /api/v1/projects/:id/history', () => {
    it('should return metrics history with default timeframe', async () => {
      // Arrange: Seed project
      await seedProjects([mockProjects.tensorflow]);
      const project = await request(app)
        .get('/api/v1/projects')
        .expect(200)
        .then((res: any) => res.body.data[0]);

      // Add multiple metrics over time
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

      await seedMetrics([
        { project_id: project.id, stars_count: 170000, forks_count: 87000, open_issues_count: 2000, watchers_count: 170000, recorded_at: twoDaysAgo },
        { project_id: project.id, stars_count: 172000, forks_count: 87500, open_issues_count: 2050, watchers_count: 172000, recorded_at: oneDayAgo },
        { project_id: project.id, stars_count: 175000, forks_count: 88000, open_issues_count: 2100, watchers_count: 175000, recorded_at: now },
      ]);

      // Act: Get history
      const response = await request(app)
        .get(`/api/v1/projects/${project.id}/history`)
        .expect('Content-Type', /json/)
        .expect(200);

      // Assert: History returned
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);
      
      // Verify chronological order
      expect(response.body[0].stars_count).toBe(170000);
      expect(response.body[1].stars_count).toBe(172000);
      expect(response.body[2].stars_count).toBe(175000);
    });

    it('should filter history by date range', async () => {
      // Arrange: Seed project and metrics
      await seedProjects([mockProjects.pytorch]);
      const project = await request(app)
        .get('/api/v1/projects')
        .expect(200)
        .then((res: any) => res.body.data[0]);

      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      await seedMetrics([
        { project_id: project.id, stars_count: 70000, forks_count: 18000, open_issues_count: 3000, watchers_count: 70000, recorded_at: threeDaysAgo },
        { project_id: project.id, stars_count: 70500, forks_count: 18500, open_issues_count: 3200, watchers_count: 70500, recorded_at: oneDayAgo },
        { project_id: project.id, stars_count: 71000, forks_count: 19000, open_issues_count: 3500, watchers_count: 71000, recorded_at: now },
      ]);

      // Act: Get history with date filter
      const response = await request(app)
        .get(`/api/v1/projects/${project.id}/history`)
        .query({
          from: oneDayAgo.toISOString(),
          to: now.toISOString(),
        })
        .expect(200);

      // Assert: Filtered results
      expect(response.body.length).toBe(2);
    });

    it('should limit results correctly', async () => {
      // Arrange: Seed project with many metrics
      await seedProjects([mockProjects.langchain]);
      const project = await request(app)
        .get('/api/v1/projects')
        .expect(200)
        .then((res: any) => res.body.data[0]);

      // Add 10 metrics
      const metrics = Array.from({ length: 10 }, (_, i) => ({
        project_id: project.id,
        stars_count: 60000 + i * 1000,
        forks_count: 8000 + i * 100,
        open_issues_count: 1000 + i * 10,
        watchers_count: 60000 + i * 1000,
        recorded_at: new Date(Date.now() - i * 60 * 60 * 1000), // 1 hour apart
      }));
      await seedMetrics(metrics);

      // Act: Get history with limit
      const response = await request(app)
        .get(`/api/v1/projects/${project.id}/history`)
        .query({ limit: 5 })
        .expect(200);

      // Assert: Limited results
      expect(response.body.length).toBe(5);
    });

    it('should return 404 for non-existent project', async () => {
      // Act & Assert
      const response = await request(app)
        .get('/api/v1/projects/99999/history')
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return empty array when no metrics', async () => {
      // Arrange: Seed project without metrics
      await seedProjects([mockProjects.langchain]);
      const project = await request(app)
        .get('/api/v1/projects')
        .expect(200)
        .then((res: any) => res.body.data[0]);

      // Act: Get history
      const response = await request(app)
        .get(`/api/v1/projects/${project.id}/history`)
        .expect(200);

      // Assert: Empty array
      expect(response.body).toEqual([]);
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange: Close database pool to simulate error
      await closeTestPool();

      // Act: Try to get projects
      const response = await request(app)
        .get('/api/v1/projects')
        .expect(500);

      // Assert: Error response
      expect(response.body).toHaveProperty('error');
      expect(response.body.error.code).toBe('DATABASE_ERROR');

      // Cleanup: Reinitialize for other tests
      await initTestDatabase();
    });
  });
});

