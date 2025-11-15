// GitHub service - Interact with GitHub API
import { octokit, handleGitHubError, checkRateLimit, delay } from '@/config/github';
import { GitHubRepoData, RateLimitInfo } from '@/models/types';
import { logger } from '@/utils/logger';

export class GitHubService {
  /**
   * Search for AI-related repositories
   */
  async searchAIRepositories(page = 1, perPage = 100): Promise<GitHubRepoData[]> {
    try {
      // Use a simpler query that GitHub accepts
      // Search for repos with "machine learning" or "artificial intelligence" in description
      const query = 'artificial intelligence OR ai OR mcp OR agents OR llm';

      logger.info('Searching GitHub repositories', { page, perPage });

      const { data } = await octokit.search.repos({
        q: `${query} stars:>1000 archived:false`,
        sort: 'stars',
        order: 'desc',
        per_page: perPage,
        page,
      });

      logger.info('GitHub search completed', {
        totalCount: data.total_count,
        itemsReturned: data.items.length,
      });

      return data.items as unknown as GitHubRepoData[];
    } catch (error) {
      logger.error('GitHub search failed', { error });
      return handleGitHubError(error);
    }
  }

  /**
   * Get repository details
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepoData> {
    try {
      logger.debug('Fetching repository', { owner, repo });

      const { data } = await octokit.repos.get({ owner, repo });

      return data as unknown as GitHubRepoData;
    } catch (error) {
      logger.error('Failed to get repository', { owner, repo, error });
      return handleGitHubError(error);
    }
  }

  /**
   * Get repository topics
   */
  async getRepositoryTopics(owner: string, repo: string): Promise<string[]> {
    try {
      const { data } = await octokit.repos.getAllTopics({ owner, repo });
      return data.names;
    } catch (error) {
      logger.error('Failed to get repository topics', { owner, repo, error });
      return [];
    }
  }

  /**
   * Get multiple repositories with rate limiting
   */
  async getRepositoriesBatch(
    repos: Array<{ owner: string; repo: string }>
  ): Promise<GitHubRepoData[]> {
    const results: GitHubRepoData[] = [];

    for (const { owner, repo } of repos) {
      try {
        const data = await this.getRepository(owner, repo);
        results.push(data);

        // Add small delay to respect rate limits
        await delay(100);
      } catch (error) {
        logger.error('Failed to fetch repository in batch', { owner, repo, error });
      }
    }

    return results;
  }

  /**
   * Check current rate limit
   */
  async getRateLimit(): Promise<RateLimitInfo> {
    return checkRateLimit();
  }
}

export default new GitHubService();

