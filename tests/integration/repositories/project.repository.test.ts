// Project Repository integration tests
import projectRepository from '@/repositories/project.repository';
import {
  initTestDatabase,
  truncateTables,
  seedProjects,
  closeTestPool,
  getProjectByFullName,
} from '../../helpers/database.helper';
import { mockProjects } from '../../fixtures/projects';
import { Project } from '@/models/types';

describe('ProjectRepository Integration Tests', () => {
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

  describe('findById()', () => {
    it('should return project by id', async () => {
      // Arrange: Seed project
      await seedProjects([mockProjects.tensorflow]);
      const seededProject = await getProjectByFullName('tensorflow/tensorflow');

      // Act: Find by ID
      const result = await projectRepository.findById(seededProject.id);

      // Assert: Project returned
      expect(result).not.toBeNull();
      expect(result?.id).toBe(seededProject.id);
      expect(result?.full_name).toBe('tensorflow/tensorflow');
      expect(result?.language).toBe('Python');
    });

    it('should return null for non-existent id', async () => {
      // Act: Try to find non-existent project
      const result = await projectRepository.findById(99999);

      // Assert: Null returned
      expect(result).toBeNull();
    });

    it('should map database columns to model correctly', async () => {
      // Arrange: Seed project
      await seedProjects([mockProjects.pytorch]);
      const seededProject = await getProjectByFullName('pytorch/pytorch');

      // Act: Find project
      const result = await projectRepository.findById(seededProject.id);

      // Assert: All fields mapped correctly
      expect(result).toMatchObject({
        github_id: String(mockProjects.pytorch.github_id),
        full_name: mockProjects.pytorch.full_name,
        name: mockProjects.pytorch.name,
        description: mockProjects.pytorch.description,
        html_url: mockProjects.pytorch.html_url,
        language: mockProjects.pytorch.language,
        topics: mockProjects.pytorch.topics,
        is_fork: mockProjects.pytorch.is_fork,
        is_archived: mockProjects.pytorch.is_archived,
        license: mockProjects.pytorch.license,
      });
      expect(result?.created_at).toBeInstanceOf(Date);
      expect(result?.updated_at).toBeInstanceOf(Date);
    });
  });

  describe('findByGitHubId()', () => {
    it('should return project by GitHub ID', async () => {
      // Arrange: Seed project
      await seedProjects([mockProjects.langchain]);

      // Act: Find by GitHub ID
      const result = await projectRepository.findByGitHubId(
        mockProjects.langchain.github_id
      );

      // Assert: Project returned
      expect(result).not.toBeNull();
      expect(result?.github_id).toBe(String(mockProjects.langchain.github_id));
      expect(result?.full_name).toBe('langchain-ai/langchain');
    });

    it('should return null for non-existent GitHub ID', async () => {
      // Act: Try to find non-existent GitHub ID
      const result = await projectRepository.findByGitHubId(99999999);

      // Assert: Null returned
      expect(result).toBeNull();
    });
  });

  describe('findByFullName()', () => {
    it('should return project by full name', async () => {
      // Arrange: Seed project
      await seedProjects([mockProjects.huggingface]);

      // Act: Find by full name
      const result = await projectRepository.findByFullName(
        'huggingface/transformers'
      );

      // Assert: Project returned
      expect(result).not.toBeNull();
      expect(result?.full_name).toBe('huggingface/transformers');
    });

    it('should return null for non-existent full name', async () => {
      // Act: Try to find non-existent project
      const result = await projectRepository.findByFullName('nonexistent/repo');

      // Assert: Null returned
      expect(result).toBeNull();
    });

    it('should be case-sensitive', async () => {
      // Arrange: Seed project
      await seedProjects([mockProjects.tensorflow]);

      // Act: Try with wrong case
      const result = await projectRepository.findByFullName('TensorFlow/TensorFlow');

      // Assert: Not found (case-sensitive)
      expect(result).toBeNull();
    });
  });

  describe('upsert()', () => {
    it('should insert new project', async () => {
      // Arrange: Project data
      const projectData: Partial<Project> = {
        github_id: 12345,
        full_name: 'test/new-project',
        name: 'new-project',
        description: 'Test project',
        html_url: 'https://github.com/test/new-project',
        language: 'TypeScript',
        topics: ['ai', 'test'],
      };

      // Act: Insert project
      const result = await projectRepository.upsert(projectData);

      // Assert: Project created
      expect(result.id).toBeDefined();
      expect(result.github_id).toBe('12345');
      expect(result.full_name).toBe('test/new-project');

      // Verify in database
      const dbProject = await getProjectByFullName('test/new-project');
      expect(dbProject).not.toBeNull();
      expect(dbProject.github_id).toBe('12345');
    });

    it('should update existing project on conflict', async () => {
      // Arrange: Seed project
      await seedProjects([mockProjects.tensorflow]);
      const original = await getProjectByFullName('tensorflow/tensorflow');

      // Act: Upsert with same GitHub ID but updated data
      const updatedData: Partial<Project> = {
        github_id: mockProjects.tensorflow.github_id,
        full_name: 'tensorflow/tensorflow',
        name: 'tensorflow',
        description: 'Updated description',
        html_url: 'https://github.com/tensorflow/tensorflow',
        language: 'Python',
        topics: ['machine-learning', 'updated'],
      };

      const result = await projectRepository.upsert(updatedData);

      // Assert: Project updated (same ID)
      expect(result.id).toBe(original.id);
      expect(result.description).toBe('Updated description');
      expect(result.topics).toContain('updated');

      // Verify only one project exists
      const allProjects = await projectRepository.findAll({}, { page: 1, limit: 100 });
      expect(allProjects.length).toBe(1);
    });

    it('should handle NULL values correctly', async () => {
      // Arrange: Project with null fields
      const projectData: Partial<Project> = {
        github_id: 54321,
        full_name: 'test/null-fields',
        name: 'null-fields',
        description: null,
        html_url: 'https://github.com/test/null-fields',
        homepage: null,
        language: null,
        topics: [],
        license: null,
      };

      // Act: Insert project
      const result = await projectRepository.upsert(projectData);

      // Assert: NULL fields handled
      expect(result.description).toBeNull();
      expect(result.homepage).toBeNull();
      expect(result.language).toBeNull();
      expect(result.license).toBeNull();
    });
  });

  describe('findAll()', () => {
    beforeEach(async () => {
      // Seed multiple projects for filtering tests
      await seedProjects([
        mockProjects.tensorflow,
        mockProjects.pytorch,
        mockProjects.langchain,
        mockProjects.huggingface,
      ]);
    });

    it('should return all projects without filters', async () => {
      // Act: Get all projects
      const results = await projectRepository.findAll({}, { page: 1, limit: 100 });

      // Assert: All projects returned
      expect(results.length).toBe(4);
    });

    it('should apply language filter', async () => {
      // Act: Filter by Python
      const results = await projectRepository.findAll(
        { language: 'Python' },
        { page: 1, limit: 100 }
      );

      // Assert: Only Python projects
      expect(results.length).toBe(4); // All test projects are Python
      expect(results.every(p => p.language === 'Python')).toBe(true);
    });

    it('should apply topics filter (array contains)', async () => {
      // Act: Filter by 'llm' topic
      const results = await projectRepository.findAll(
        { topics: ['llm'] },
        { page: 1, limit: 100 }
      );

      // Assert: Only projects with 'llm' topic
      expect(results.length).toBe(1);
      expect(results[0].full_name).toBe('langchain-ai/langchain');
    });

    it('should apply multiple filters', async () => {
      // Act: Filter by language AND topic
      const results = await projectRepository.findAll(
        {
          language: 'Python',
          topics: ['machine-learning'],
        },
        { page: 1, limit: 100 }
      );

      // Assert: Projects matching both filters
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(p => p.language === 'Python')).toBe(true);
      expect(results.every(p => p.topics?.includes('machine-learning'))).toBe(true);
    });

    it('should apply pagination', async () => {
      // Act: Get first page
      const page1 = await projectRepository.findAll({}, { page: 1, limit: 2, offset: 0 });

      // Act: Get second page
      const page2 = await projectRepository.findAll({}, { page: 2, limit: 2, offset: 2 });

      // Assert: Different projects on each page
      expect(page1.length).toBe(2);
      expect(page2.length).toBe(2);
      expect(page1[0].id).not.toBe(page2[0].id);
    });

    // Note: Archived filtering would need to be added to ProjectFilters type if needed
    // This test is commented out until the feature is implemented
    // it('should respect archived filter', async () => {
    //   // Arrange: Add archived project
    //   await seedProjects([mockProjects.archived]);
    //
    //   // Act: Get non-archived projects
    //   const results = await projectRepository.findAll(
    //     { is_archived: false },
    //     { page: 1, limit: 100 }
    //   );
    //
    //   // Assert: Archived project excluded
    //   expect(results.every(p => !p.is_archived)).toBe(true);
    //   expect(results.find(p => p.full_name === 'old/archived-ai')).toBeUndefined();
    // });
  });

  describe('count()', () => {
    beforeEach(async () => {
      await seedProjects([
        mockProjects.tensorflow,
        mockProjects.pytorch,
        mockProjects.langchain,
      ]);
    });

    it('should count all projects without filters', async () => {
      // Act: Count all
      const count = await projectRepository.count({});

      // Assert: Correct count
      expect(count).toBe(3);
    });

    it('should count with filters', async () => {
      // Act: Count Python projects
      const count = await projectRepository.count({ language: 'Python' });

      // Assert: Correct filtered count
      expect(count).toBe(3);
    });

    it('should return 0 for no matches', async () => {
      // Act: Count with no matches
      const count = await projectRepository.count({ language: 'Rust' });

      // Assert: Zero count
      expect(count).toBe(0);
    });
  });

  describe('update()', () => {
    it('should update project fields', async () => {
      // Arrange: Seed project
      await seedProjects([mockProjects.tensorflow]);
      const original = await getProjectByFullName('tensorflow/tensorflow');

      // Act: Update project
      const updated = await projectRepository.update(original.id, {
        description: 'Updated via test',
        topics: ['updated', 'test'],
      });

      // Assert: Fields updated
      expect(updated).not.toBeNull();
      expect(updated?.description).toBe('Updated via test');
      expect(updated?.topics).toEqual(['updated', 'test']);
      
      // Other fields unchanged
      expect(updated?.full_name).toBe(original.full_name);
      expect(updated?.github_id).toBe(original.github_id);
    });

    it('should return null for non-existent project', async () => {
      // Act: Try to update non-existent project
      const result = await projectRepository.update(99999, {
        description: 'Should fail',
      });

      // Assert: Null returned
      expect(result).toBeNull();
    });
  });

  describe('delete()', () => {
    it('should delete project successfully', async () => {
      // Arrange: Seed project
      await seedProjects([mockProjects.langchain]);
      const project = await getProjectByFullName('langchain-ai/langchain');

      // Act: Delete project
      const deleted = await projectRepository.delete(project.id);

      // Assert: Delete successful
      expect(deleted).toBe(true);

      // Verify project no longer exists
      const found = await projectRepository.findById(project.id);
      expect(found).toBeNull();
    });

    it('should return false for non-existent project', async () => {
      // Act: Try to delete non-existent project
      const deleted = await projectRepository.delete(99999);

      // Assert: Delete failed
      expect(deleted).toBe(false);
    });

    it('should cascade delete to metrics', async () => {
      // This test would require metrics to be seeded
      // and then verify they're deleted when project is deleted
      // Implementation depends on database schema CASCADE settings
    });
  });
});

