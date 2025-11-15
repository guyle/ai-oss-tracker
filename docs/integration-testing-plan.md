# Integration Testing Plan

## Overview

This document outlines the comprehensive integration testing strategy for the GitHub AI Trending Tracker application. Integration tests verify that different parts of the system work together correctly, including API endpoints, database operations, and external service integrations.

## Testing Principles

### 1. **Test Environment Isolation**
- Use a separate test database that mirrors production schema
- Reset database state between test suites
- Mock external APIs (GitHub API) to avoid rate limits and ensure predictable results
- Use environment-specific configurations

### 2. **Test Coverage Goals**
- **API Endpoints**: 100% of routes covered
- **Service Layer**: All business logic paths tested
- **Repository Layer**: All database operations verified
- **Error Handling**: All error scenarios tested
- **Authentication & Authorization**: When implemented

### 3. **Testing Layers**

```
┌─────────────────────────────────────┐
│   E2E Integration Tests             │  ← Full request/response cycle
│   (API → Controller → Service →     │
│    Repository → Database)            │
├─────────────────────────────────────┤
│   Service Integration Tests         │  ← Service + Repository + DB
│   (Service → Repository → Database) │
├─────────────────────────────────────┤
│   Repository Integration Tests      │  ← Direct database operations
│   (Repository → Database)            │
└─────────────────────────────────────┘
```

## Testing Stack

### Core Testing Libraries

```json
{
  "jest": "^29.7.0",           // Test framework
  "ts-jest": "^29.1.1",        // TypeScript support
  "supertest": "^6.3.3",       // HTTP testing
  "nock": "^13.5.0",           // HTTP mocking for GitHub API
  "@testcontainers/postgresql": "^10.0.0" // Database containers (optional)
}
```

### Supporting Tools
- **Docker Compose**: For test database
- **pg**: Database connection pooling
- **dotenv**: Test environment configuration

## Test Database Strategy

### Option A: Dedicated Test Database (Recommended for CI/CD)

**Setup:**
```yaml
# docker-compose.test.yml
version: '3.8'
services:
  postgres-test:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
      POSTGRES_DB: github_ai_tracker_test
    ports:
      - "5433:5432"
    tmpfs:
      - /var/lib/postgresql/data  # In-memory for speed
```

**Advantages:**
- Fast (in-memory tmpfs)
- Isolated from development database
- Parallel test execution
- Easy CI/CD integration

### Option B: TestContainers (Most Flexible)

**Setup:**
```typescript
// Automatically spins up/down PostgreSQL container per test suite
import { PostgreSqlContainer } from '@testcontainers/postgresql';
```

**Advantages:**
- True isolation per test suite
- No port conflicts
- Automatic cleanup
- Best for local development

### Database Lifecycle

```typescript
beforeAll(async () => {
  // 1. Start test database (if using containers)
  // 2. Run migrations (schema.sql)
  // 3. Create connection pool
});

beforeEach(async () => {
  // 4. Truncate all tables (fast reset)
  // 5. Insert seed data if needed
});

afterEach(async () => {
  // 6. Cleanup test data
});

afterAll(async () => {
  // 7. Close connections
  // 8. Stop test database (if using containers)
});
```

## Test Structure

```
tests/
├── integration/
│   ├── api/
│   │   ├── projects.api.test.ts        # API endpoint tests
│   │   ├── admin.api.test.ts
│   │   └── error-handling.api.test.ts
│   ├── services/
│   │   ├── project.service.test.ts     # Service + DB integration
│   │   ├── metrics.service.test.ts
│   │   └── github.service.test.ts
│   ├── repositories/
│   │   ├── project.repository.test.ts  # Direct DB tests
│   │   └── metrics.repository.test.ts
│   └── workflows/
│       ├── project-creation.test.ts    # End-to-end workflows
│       └── metrics-update.test.ts
├── unit/
│   ├── utils/
│   │   ├── errors.test.ts              # Pure unit tests
│   │   └── logger.test.ts
│   └── models/
│       └── types.test.ts
├── fixtures/
│   ├── github-responses.ts             # Mock GitHub API responses
│   ├── projects.ts                     # Test data
│   └── metrics.ts
├── helpers/
│   ├── database.helper.ts              # DB setup/teardown utilities
│   ├── app.helper.ts                   # Express app factory
│   ├── mock-github.helper.ts           # GitHub API mocking
│   └── assertions.helper.ts            # Custom matchers
└── setup/
    ├── setup.ts                        # Global test setup
    ├── teardown.ts                     # Global cleanup
    └── test-env.ts                     # Environment configuration
```

## Test Scenarios

### 1. API Integration Tests

#### 1.1 Projects API (`tests/integration/api/projects.api.test.ts`)

**Test Cases:**
```typescript
describe('GET /api/v1/projects', () => {
  it('should return paginated projects with default params');
  it('should filter projects by language');
  it('should filter projects by min stars');
  it('should filter projects by topics');
  it('should sort projects by stars_count DESC');
  it('should return 400 for invalid pagination params');
  it('should return empty array when no matches');
  it('should include pagination metadata');
  it('should respect rate limiting');
});

describe('GET /api/v1/projects/:id', () => {
  it('should return project with latest metrics');
  it('should return 404 for non-existent project');
  it('should return 400 for invalid id format');
  it('should include all project fields');
});

describe('GET /api/v1/projects/:id/history', () => {
  it('should return metrics history with default timeframe');
  it('should filter by date range');
  it('should limit results correctly');
  it('should return 404 for non-existent project');
  it('should return empty array when no metrics');
});
```

#### 1.2 Admin API (`tests/integration/api/admin.api.test.ts`)

**Test Cases:**
```typescript
describe('GET /api/v1/admin/health', () => {
  it('should return healthy status when DB connected');
  it('should return unhealthy status when DB disconnected');
  it('should include timestamp and version');
});

describe('GET /api/v1/admin/stats', () => {
  it('should return correct total counts');
  it('should return stats by language');
  it('should return stats by topic');
  it('should calculate growth metrics correctly');
});
```

### 2. Service Integration Tests

#### 2.1 Project Service (`tests/integration/services/project.service.test.ts`)

**Test Cases:**
```typescript
describe('ProjectService.getProject()', () => {
  it('should return project with latest metrics');
  it('should throw NotFoundError for invalid ID');
  it('should return project with null metrics if none exist');
});

describe('ProjectService.createProjectFromGitHub()', () => {
  it('should create new project from GitHub data');
  it('should update existing project on duplicate github_id');
  it('should handle missing optional fields');
  it('should parse dates correctly');
  it('should handle null license');
});

describe('ProjectService.getAllProjects()', () => {
  it('should apply multiple filters correctly');
  it('should return correct total count');
  it('should handle empty results');
});
```

#### 2.2 Metrics Service (`tests/integration/services/metrics.service.test.ts`)

**Test Cases:**
```typescript
describe('MetricsService.recordMetrics()', () => {
  it('should save metrics with all fields');
  it('should throw NotFoundError for invalid project');
  it('should handle metrics from GitHub API response');
  it('should record timestamp correctly');
});

describe('MetricsService.getHistory()', () => {
  it('should return metrics in chronological order');
  it('should filter by date range');
  it('should calculate growth rates');
  it('should aggregate daily metrics');
});
```

#### 2.3 GitHub Service (`tests/integration/services/github.service.test.ts`)

**Test Cases (with mocked GitHub API):**
```typescript
describe('GitHubService.getRepository()', () => {
  it('should fetch repository data successfully');
  it('should handle 404 not found');
  it('should handle rate limit exceeded (403)');
  it('should retry on transient failures');
  it('should throw after max retries');
});

describe('GitHubService.searchRepositories()', () => {
  it('should search with AI-related queries');
  it('should handle pagination correctly');
  it('should filter by min stars');
  it('should respect rate limits');
});
```

### 3. Repository Integration Tests

#### 3.1 Project Repository (`tests/integration/repositories/project.repository.test.ts`)

**Test Cases:**
```typescript
describe('ProjectRepository.findById()', () => {
  it('should return project by id');
  it('should return null for non-existent id');
  it('should map database columns to model correctly');
});

describe('ProjectRepository.upsert()', () => {
  it('should insert new project');
  it('should update existing project on conflict');
  it('should return inserted/updated project');
  it('should handle NULL values correctly');
});

describe('ProjectRepository.findAll()', () => {
  it('should apply language filter');
  it('should apply min_stars filter');
  it('should apply topics filter (array contains)');
  it('should apply pagination');
  it('should apply sorting');
});

describe('ProjectRepository.delete()', () => {
  it('should delete project and cascade to metrics');
  it('should return true on successful delete');
  it('should return false for non-existent project');
});
```

#### 3.2 Metrics Repository (`tests/integration/repositories/metrics.repository.test.ts`)

**Test Cases:**
```typescript
describe('MetricsRepository.create()', () => {
  it('should insert metrics record');
  it('should generate unique id');
  it('should set recorded_at timestamp');
  it('should handle NULL values');
});

describe('MetricsRepository.getLatest()', () => {
  it('should return most recent metrics');
  it('should return null when no metrics exist');
  it('should order by recorded_at DESC');
});

describe('MetricsRepository.getHistory()', () => {
  it('should return metrics within date range');
  it('should order chronologically');
  it('should limit results');
  it('should handle empty results');
});
```

### 4. End-to-End Workflow Tests

#### 4.1 Project Creation Workflow (`tests/integration/workflows/project-creation.test.ts`)

**Test Scenario:**
```typescript
describe('Complete project creation workflow', () => {
  it('should create project from GitHub → save to DB → record metrics', async () => {
    // 1. Mock GitHub API response
    // 2. Call POST /api/v1/admin/projects (when implemented)
    // 3. Verify project saved to database
    // 4. Verify initial metrics recorded
    // 5. Verify response includes all data
  });
});
```

#### 4.2 Metrics Update Workflow (`tests/integration/workflows/metrics-update.test.ts`)

**Test Scenario:**
```typescript
describe('Metrics update workflow', () => {
  it('should fetch from GitHub → update metrics → calculate growth', async () => {
    // 1. Create project with initial metrics
    // 2. Mock updated GitHub API response
    // 3. Trigger metrics update
    // 4. Verify new metrics recorded
    // 5. Verify growth calculated correctly
  });
});
```

### 5. Error Handling Tests

#### 5.1 API Error Responses (`tests/integration/api/error-handling.api.test.ts`)

**Test Cases:**
```typescript
describe('Error handling', () => {
  it('should return 400 for validation errors');
  it('should return 404 for not found errors');
  it('should return 500 for database errors');
  it('should return 503 for GitHub API errors');
  it('should return 429 for rate limit exceeded');
  it('should not expose stack traces in production');
  it('should log errors with context');
});
```

## Test Data Management

### 1. Fixtures

Create reusable test data:

```typescript
// tests/fixtures/projects.ts
export const mockProjects = {
  tensorflow: {
    github_id: 12345,
    full_name: 'tensorflow/tensorflow',
    name: 'tensorflow',
    description: 'An Open Source Machine Learning Framework',
    language: 'Python',
    topics: ['machine-learning', 'deep-learning', 'tensorflow'],
    html_url: 'https://github.com/tensorflow/tensorflow',
    // ... other fields
  },
  pytorch: { /* ... */ },
};

// tests/fixtures/github-responses.ts
export const mockGitHubResponses = {
  getRepository: (repoName: string) => ({
    id: 12345,
    full_name: repoName,
    stargazers_count: 150000,
    // ... full GitHub API response
  }),
};
```

### 2. Database Seeding

```typescript
// tests/helpers/database.helper.ts
export async function seedProjects(projects: Partial<Project>[]) {
  for (const project of projects) {
    await query(
      `INSERT INTO projects (...) VALUES (...) ON CONFLICT DO NOTHING`,
      [/* values */]
    );
  }
}

export async function truncateTables() {
  await query('TRUNCATE TABLE project_metrics CASCADE');
  await query('TRUNCATE TABLE projects CASCADE');
}
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: github_ai_tracker_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup test database
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/github_ai_tracker_test
        run: npm run db:init
      
      - name: Run integration tests
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/github_ai_tracker_test
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_ENV: test
        run: npm run test:integration
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Best Practices

### 1. **Test Isolation**
```typescript
// ✅ Good - Each test is independent
beforeEach(async () => {
  await truncateTables();
  await seedProjects([mockProjects.tensorflow]);
});

// ❌ Bad - Tests depend on each other
test('create project', async () => { /* creates project */ });
test('get project', async () => { /* assumes project exists */ });
```

### 2. **Clear Test Names**
```typescript
// ✅ Good - Describes what and why
it('should return 404 when project does not exist');

// ❌ Bad - Vague
it('should work');
```

### 3. **Arrange-Act-Assert Pattern**
```typescript
it('should create project from GitHub data', async () => {
  // Arrange
  const githubData = mockGitHubResponses.getRepository('test/repo');
  nock('https://api.github.com').get('/repos/test/repo').reply(200, githubData);
  
  // Act
  const result = await projectService.createProjectFromGitHub(githubData);
  
  // Assert
  expect(result.id).toBeDefined();
  expect(result.full_name).toBe('test/repo');
});
```

### 4. **Mock External Dependencies**
```typescript
// ✅ Good - Mock GitHub API
nock('https://api.github.com')
  .get('/repos/tensorflow/tensorflow')
  .reply(200, mockGitHubResponses.tensorflow);

// ❌ Bad - Real API calls (slow, rate limits, flaky)
const data = await fetch('https://api.github.com/repos/tensorflow/tensorflow');
```

### 5. **Test Error Paths**
```typescript
describe('Error scenarios', () => {
  it('should handle database connection errors');
  it('should handle GitHub API rate limits');
  it('should handle invalid input data');
  it('should rollback transactions on error');
});
```

## Performance Considerations

### 1. **Parallel Test Execution**
```javascript
// jest.config.js
module.exports = {
  maxWorkers: 4, // Run tests in parallel
  testTimeout: 10000, // 10s timeout per test
};
```

### 2. **Fast Database Resets**
```typescript
// Fast - TRUNCATE (preferred)
await query('TRUNCATE TABLE projects CASCADE');

// Slow - DELETE (avoid)
await query('DELETE FROM projects');
```

### 3. **Connection Pooling**
```typescript
// Reuse connection pool across tests
let pool: Pool;

beforeAll(() => {
  pool = new Pool({ /* config */ });
});

afterAll(() => {
  await pool.end();
});
```

## Monitoring & Reporting

### 1. **Coverage Reports**
- Aim for 80%+ coverage on critical paths
- 100% coverage on API endpoints
- Use `jest --coverage` to generate reports

### 2. **Test Execution Time**
- Flag tests taking > 1s
- Optimize slow database queries
- Mock expensive operations

### 3. **Flaky Test Detection**
- Run tests multiple times
- Identify non-deterministic failures
- Fix race conditions

## Implementation Timeline

### Phase 1: Foundation (Week 1)
- [ ] Set up test database infrastructure
- [ ] Create test helpers and utilities
- [ ] Configure Jest for integration tests
- [ ] Create mock fixtures

### Phase 2: Repository Tests (Week 2)
- [ ] Test ProjectRepository
- [ ] Test MetricsRepository
- [ ] Verify all CRUD operations

### Phase 3: Service Tests (Week 3)
- [ ] Test ProjectService
- [ ] Test MetricsService
- [ ] Test GitHubService with mocks

### Phase 4: API Tests (Week 4)
- [ ] Test Projects API endpoints
- [ ] Test Admin API endpoints
- [ ] Test error handling

### Phase 5: Workflows & CI/CD (Week 5)
- [ ] Create end-to-end workflow tests
- [ ] Set up GitHub Actions
- [ ] Configure coverage reporting
- [ ] Document testing procedures

## Maintenance

### Regular Tasks
- **Weekly**: Review test coverage metrics
- **Monthly**: Audit flaky tests
- **Per Feature**: Add integration tests
- **Per Bug Fix**: Add regression test

### Test Health Indicators
- ✅ All tests pass consistently
- ✅ Tests complete in < 2 minutes
- ✅ Coverage > 80% on critical paths
- ✅ No flaky tests (< 1% failure rate)
- ❌ Tests timing out
- ❌ Decreasing coverage
- ❌ Skipped tests accumulating

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [TestContainers Documentation](https://node.testcontainers.org/)
- [PostgreSQL Testing Best Practices](https://www.postgresql.org/docs/current/regress.html)

---

**Next Steps**: Proceed with Phase 1 implementation by creating the test infrastructure.

