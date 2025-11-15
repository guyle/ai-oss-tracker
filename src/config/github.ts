// GitHub API client configuration
import { Octokit } from '@octokit/rest';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { RateLimitInfo } from '@/models/types';
import { GitHubApiError, RateLimitError } from '@/utils/errors';

// Create Octokit instance
export const octokit = new Octokit({
  auth: env.GITHUB_TOKEN,
  baseUrl: env.GITHUB_API_BASE_URL,
  log: {
    debug: (message: string) => logger.debug(message),
    info: (message: string) => logger.info(message),
    warn: (message: string) => logger.warn(message),
    error: (message: string) => logger.error(message),
  },
  request: {
    timeout: 10000, // 10 seconds
  },
});

// Check GitHub API rate limit status
export const checkRateLimit = async (): Promise<RateLimitInfo> => {
  try {
    const { data } = await octokit.rateLimit.get();
    const rateLimitInfo: RateLimitInfo = {
      remaining: data.rate.remaining,
      limit: data.rate.limit,
      reset: new Date(data.rate.reset * 1000),
    };

    logger.debug('GitHub API rate limit check', rateLimitInfo);

    // Warn if rate limit is low
    if (rateLimitInfo.remaining < 100) {
      logger.warn('GitHub API rate limit is low', rateLimitInfo);
    }

    return rateLimitInfo;
  } catch (error) {
    logger.error('Failed to check GitHub rate limit', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new GitHubApiError('Failed to check GitHub API rate limit');
  }
};

// Handle GitHub API errors
export const handleGitHubError = (error: unknown): never => {
  if (error && typeof error === 'object' && 'status' in error) {
    const apiError = error as { status: number; message: string };

    if (apiError.status === 403) {
      throw new RateLimitError('GitHub API rate limit exceeded');
    }

    if (apiError.status === 404) {
      throw new GitHubApiError('GitHub resource not found', { status: 404 });
    }

    throw new GitHubApiError(apiError.message || 'GitHub API request failed', {
      status: apiError.status,
    });
  }

  throw new GitHubApiError('Unknown GitHub API error', {
    error: error instanceof Error ? error.message : String(error),
  });
};

// Delay helper for respecting rate limits
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export default octokit;

