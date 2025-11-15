// GitHub API mocking helper
import nock from 'nock';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Mock GitHub API repository response
 */
export function mockGetRepository(owner: string, repo: string, data: any) {
  return nock(GITHUB_API_BASE)
    .get(`/repos/${owner}/${repo}`)
    .reply(200, data);
}

/**
 * Mock GitHub API repository not found
 */
export function mockGetRepositoryNotFound(owner: string, repo: string) {
  return nock(GITHUB_API_BASE)
    .get(`/repos/${owner}/${repo}`)
    .reply(404, {
      message: 'Not Found',
      documentation_url: 'https://docs.github.com/rest/repos/repos#get-a-repository',
    });
}

/**
 * Mock GitHub API rate limit exceeded
 */
export function mockRateLimitExceeded() {
  return nock(GITHUB_API_BASE)
    .get(/.*/)
    .reply(403, {
      message: 'API rate limit exceeded',
      documentation_url: 'https://docs.github.com/rest/overview/resources-in-the-rest-api#rate-limiting',
    });
}

/**
 * Mock GitHub API search repositories
 */
export function mockSearchRepositories(query: string, data: any) {
  return nock(GITHUB_API_BASE)
    .get('/search/repositories')
    .query(true) // Match any query params
    .reply(200, data);
}

/**
 * Mock GitHub API topics
 */
export function mockGetTopics(owner: string, repo: string, topics: string[]) {
  return nock(GITHUB_API_BASE)
    .get(`/repos/${owner}/${repo}/topics`)
    .reply(200, { names: topics });
}

/**
 * Clean all GitHub API mocks
 */
export function cleanGitHubMocks() {
  nock.cleanAll();
}

/**
 * Check if there are pending GitHub API mocks
 */
export function hasPendingGitHubMocks(): boolean {
  return !nock.isDone();
}

/**
 * Create a mock GitHub repository response
 */
export function createMockGitHubRepo(overrides: Partial<any> = {}) {
  return {
    id: 12345,
    node_id: 'MDEwOlJlcG9zaXRvcnkxMjM0NQ==',
    name: 'test-repo',
    full_name: 'test-owner/test-repo',
    private: false,
    owner: {
      login: 'test-owner',
      id: 1,
      avatar_url: 'https://avatars.githubusercontent.com/u/1',
      type: 'User',
    },
    html_url: 'https://github.com/test-owner/test-repo',
    description: 'A test repository',
    fork: false,
    url: 'https://api.github.com/repos/test-owner/test-repo',
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    pushed_at: '2023-06-01T00:00:00Z',
    homepage: 'https://test-repo.com',
    size: 1024,
    stargazers_count: 1000,
    watchers_count: 1000,
    language: 'TypeScript',
    has_issues: true,
    has_projects: true,
    has_downloads: true,
    has_wiki: true,
    has_pages: false,
    forks_count: 100,
    mirror_url: null,
    archived: false,
    disabled: false,
    open_issues_count: 50,
    license: {
      key: 'mit',
      name: 'MIT License',
      spdx_id: 'MIT',
      url: 'https://api.github.com/licenses/mit',
    },
    topics: ['typescript', 'nodejs', 'test'],
    forks: 100,
    open_issues: 50,
    watchers: 1000,
    default_branch: 'main',
    ...overrides,
  };
}

/**
 * Create a mock GitHub search response
 */
export function createMockGitHubSearchResponse(items: any[] = [], total_count?: number) {
  return {
    total_count: total_count !== undefined ? total_count : items.length,
    incomplete_results: false,
    items,
  };
}

