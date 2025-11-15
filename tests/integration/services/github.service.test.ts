// GitHub Service integration tests
import { mockGitHubResponses } from '../../fixtures/github-responses';

// Mock the entire Octokit client before importing the service
const mockOctokit = {
  repos: {
    get: jest.fn(),
    getAllTopics: jest.fn(),
  },
  search: {
    repos: jest.fn(),
  },
  rateLimit: {
    get: jest.fn(),
  },
};

const mockCheckRateLimit = jest.fn();
const mockHandleGitHubError = jest.fn((error) => {
  throw error;
});

jest.mock('@/config/github', () => ({
  octokit: mockOctokit,
  checkRateLimit: mockCheckRateLimit,
  handleGitHubError: mockHandleGitHubError,
  delay: jest.fn(),
}));

// Import service AFTER mocking
import githubService from '@/services/github.service';

describe('GitHubService Integration Tests', () => {
  // Reset all mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRepository()', () => {
    it('should fetch repository data successfully', async () => {
      // Arrange: Mock Octokit response
      const owner = 'tensorflow';
      const repo = 'tensorflow';
      mockOctokit.repos.get.mockResolvedValue({
        data: mockGitHubResponses.tensorflow,
      });

      // Act: Fetch repository
      const result = await githubService.getRepository(owner, repo);

      // Assert: Repository data returned
      expect(result).toBeDefined();
      expect(result.full_name).toBe('tensorflow/tensorflow');
      expect(result.stargazers_count).toBe(175000);
      expect(result.language).toBe('Python');
      expect(result.topics).toContain('machine-learning');

      // Verify mock was called correctly
      expect(mockOctokit.repos.get).toHaveBeenCalledWith({ owner, repo });
    });

    it('should handle 404 not found', async () => {
      // Arrange: Mock 404 error
      const owner = 'nonexistent';
      const repo = 'repo';
      const notFoundError = {
        status: 404,
        message: 'Not Found',
      };
      
      mockOctokit.repos.get.mockRejectedValue(notFoundError);
      mockHandleGitHubError.mockImplementation(() => {
        throw new Error('GitHub resource not found');
      });

      // Act & Assert: Should throw error
      await expect(githubService.getRepository(owner, repo)).rejects.toThrow('GitHub resource not found');
      expect(mockOctokit.repos.get).toHaveBeenCalledWith({ owner, repo });
    });

    it('should handle rate limit exceeded (403)', async () => {
      // Arrange: Mock rate limit error
      const rateLimitError = {
        status: 403,
        message: 'API rate limit exceeded',
      };
      
      mockOctokit.repos.get.mockRejectedValue(rateLimitError);
      mockHandleGitHubError.mockImplementation(() => {
        throw new Error('GitHub API rate limit exceeded');
      });

      // Act & Assert: Should throw rate limit error
      await expect(
        githubService.getRepository('any', 'repo')
      ).rejects.toThrow(/rate limit/i);
    });

    it('should parse dates correctly', async () => {
      // Arrange: Mock Octokit response
      mockOctokit.repos.get.mockResolvedValue({
        data: mockGitHubResponses.pytorch,
      });

      // Act: Fetch repository
      const result = await githubService.getRepository('pytorch', 'pytorch');

      // Assert: Dates are returned as strings
      expect(result.created_at).toBeTruthy();
      expect(result.updated_at).toBeTruthy();
      expect(typeof result.created_at).toBe('string');
    });

    it('should handle null/optional fields', async () => {
      // Arrange: Mock response with null fields
      const mockData = {
        ...mockGitHubResponses.langchain,
        homepage: null,
        license: null,
      };
      mockOctokit.repos.get.mockResolvedValue({ data: mockData });

      // Act: Fetch repository
      const result = await githubService.getRepository('langchain-ai', 'langchain');

      // Assert: Null fields handled
      expect(result.homepage).toBeNull();
      expect(result.license).toBeNull();
    });
  });

  describe('searchAIRepositories()', () => {
    it('should search for AI repositories', async () => {
      // Arrange: Mock Octokit search response
      const searchResponse = {
        data: {
          total_count: 3,
          incomplete_results: false,
          items: [
            mockGitHubResponses.tensorflow,
            mockGitHubResponses.pytorch,
            mockGitHubResponses.langchain,
          ],
        },
      };

      mockOctokit.search.repos.mockResolvedValue(searchResponse);

      // Act: Search for AI repositories
      const result = await githubService.searchAIRepositories(1, 100);

      // Assert: Results returned
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0].full_name).toBe('tensorflow/tensorflow');
      expect(mockOctokit.search.repos).toHaveBeenCalledWith(
        expect.objectContaining({
          per_page: 100,
          page: 1,
        })
      );
    });

    it('should handle pagination correctly', async () => {
      // Arrange: Mock paginated responses
      mockOctokit.search.repos
        .mockResolvedValueOnce({
          data: {
            total_count: 100,
            incomplete_results: false,
            items: [mockGitHubResponses.tensorflow],
          },
        })
        .mockResolvedValueOnce({
          data: {
            total_count: 100,
            incomplete_results: false,
            items: [mockGitHubResponses.pytorch],
          },
        });

      // Act: Fetch multiple pages
      const results1 = await githubService.searchAIRepositories(1, 1);
      const results2 = await githubService.searchAIRepositories(2, 1);

      // Assert: Different results per page
      expect(results1[0].full_name).toBe('tensorflow/tensorflow');
      expect(results2[0].full_name).toBe('pytorch/pytorch');
      expect(results1[0].full_name).not.toBe(results2[0].full_name);
    });

    it('should handle empty results', async () => {
      // Arrange: Mock empty Octokit response
      mockOctokit.search.repos.mockResolvedValue({
        data: {
          total_count: 0,
          incomplete_results: false,
          items: [],
        },
      });

      // Act: Search with no results
      const result = await githubService.searchAIRepositories(1, 100);

      // Assert: Empty results
      expect(result).toEqual([]);
    });
  });

  describe('getRepositoryTopics()', () => {
    it('should fetch repository topics', async () => {
      // Arrange: Mock Octokit topics response
      mockOctokit.repos.getAllTopics.mockResolvedValue({
        data: {
          names: ['machine-learning', 'deep-learning', 'tensorflow'],
        },
      });

      // Act: Fetch topics
      const topics = await githubService.getRepositoryTopics('tensorflow', 'tensorflow');

      // Assert: Topics returned
      expect(topics).toHaveLength(3);
      expect(topics).toContain('machine-learning');
      expect(mockOctokit.repos.getAllTopics).toHaveBeenCalledWith({
        owner: 'tensorflow',
        repo: 'tensorflow',
      });
    });

    it('should handle repositories without topics', async () => {
      // Arrange: Mock empty topics response
      mockOctokit.repos.getAllTopics.mockResolvedValue({
        data: { names: [] },
      });

      // Act: Fetch topics
      const topics = await githubService.getRepositoryTopics('test', 'repo');

      // Assert: Empty array
      expect(topics).toEqual([]);
    });
  });

  describe('getRateLimit()', () => {
    it('should fetch rate limit information', async () => {
      // Arrange: Mock rate limit response
      const mockRateLimit = {
        remaining: 4999,
        limit: 5000,
        reset: new Date('2025-11-15T13:00:00Z'),
      };
      mockCheckRateLimit.mockResolvedValue(mockRateLimit);

      // Act: Fetch rate limit
      const rateLimit = await githubService.getRateLimit();

      // Assert: Rate limit info returned with correct structure
      expect(rateLimit).toBeDefined();
      expect(rateLimit.remaining).toBe(4999);
      expect(rateLimit.limit).toBe(5000);
      expect(rateLimit.reset).toBeInstanceOf(Date);
      expect(mockCheckRateLimit).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle server errors gracefully', async () => {
      // Arrange: Mock server error
      const serverError = new Error('Internal Server Error');
      mockOctokit.repos.get.mockRejectedValue(serverError);
      mockHandleGitHubError.mockImplementation(() => {
        throw new Error('GitHub API request failed');
      });

      // Act & Assert: Should throw error
      await expect(
        githubService.getRepository('tensorflow', 'tensorflow')
      ).rejects.toThrow('GitHub API request failed');
      
      // Verify error handler was called
      expect(mockHandleGitHubError).toHaveBeenCalledWith(serverError);
    });

    it('should handle network errors', async () => {
      // Arrange: Mock network error
      const networkError = new Error('Network error');
      mockOctokit.repos.get.mockRejectedValue(networkError);
      mockHandleGitHubError.mockImplementation(() => {
        throw new Error('Network error - GitHub API request failed');
      });

      // Act & Assert: Should throw network error
      await expect(
        githubService.getRepository('tensorflow', 'tensorflow')
      ).rejects.toThrow(/network/i);
      
      // Verify error handler was called
      expect(mockHandleGitHubError).toHaveBeenCalledWith(networkError);
    });
    
    it('should handle search errors', async () => {
      // Arrange: Mock search error
      const searchError = new Error('Search failed');
      mockOctokit.search.repos.mockRejectedValue(searchError);
      mockHandleGitHubError.mockImplementation(() => {
        throw new Error('GitHub search failed');
      });

      // Act & Assert: Should throw error
      await expect(
        githubService.searchAIRepositories(1, 100)
      ).rejects.toThrow('GitHub search failed');
    });
  });
});

