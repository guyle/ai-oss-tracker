# Testing Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This will install all testing dependencies including:
- `jest` - Test framework
- `ts-jest` - TypeScript support
- `supertest` - HTTP assertion library
- `nock` - HTTP mocking
- `@types/supertest` - TypeScript types

### 2. Set Up Test Database

#### Option A: Using Docker (Recommended)

```bash
# Start test database
docker-compose -f docker-compose.test.yml up -d

# Check database is running
docker-compose -f docker-compose.test.yml ps

# View logs
docker-compose -f docker-compose.test.yml logs postgres-test
```

The test database will be available at:
- Host: `localhost`
- Port: `5433` (different from dev database)
- Database: `github_ai_tracker_test`
- User: `test_user`
- Password: `test_password`

#### Option B: Using Existing PostgreSQL

Create a test database in your existing PostgreSQL instance:

```sql
CREATE DATABASE github_ai_tracker_test;
CREATE USER test_user WITH PASSWORD 'test_password';
GRANT ALL PRIVILEGES ON DATABASE github_ai_tracker_test TO test_user;
```

### 3. Configure Test Environment

Create a `.env.test` file (copy from `.env.test.example`):

```bash
cp .env.test.example .env.test
```

Update the values in `.env.test`:

```env
NODE_ENV=test
DATABASE_URL=postgresql://test_user:test_password@localhost:5433/github_ai_tracker_test
GITHUB_TOKEN=your_github_token_here
API_RATE_LIMIT=1000
LOG_LEVEL=error
```

**Note:** The GitHub token is optional for integration tests since we mock the API calls.

### 4. Initialize Test Database Schema

```bash
# Using npm script (will use DATABASE_URL from .env.test)
DATABASE_URL=postgresql://test_user:test_password@localhost:5433/github_ai_tracker_test npm run db:init
```

Or manually:

```bash
psql postgresql://test_user:test_password@localhost:5433/github_ai_tracker_test -f src/db/schema.sql
```

## Running Tests

### Run All Tests

```bash
npm test
```

This runs both unit and integration tests with coverage reporting.

### Run Only Integration Tests

```bash
npm run test:integration
```

### Run Only Unit Tests

```bash
npm run test:unit
```

### Watch Mode (for development)

```bash
npm run test:watch
```

### Run Specific Test File

```bash
npx jest tests/integration/api/projects.api.test.ts
```

### Run Tests with Verbose Output

```bash
npx jest --verbose
```

### Run Tests Without Coverage

```bash
npx jest --coverage=false
```

## Test Structure

```
tests/
├── integration/           # Integration tests
│   ├── api/              # API endpoint tests
│   ├── services/         # Service layer tests
│   ├── repositories/     # Database tests
│   └── workflows/        # End-to-end workflows
├── unit/                 # Unit tests (isolated)
├── fixtures/             # Test data
│   ├── projects.ts
│   └── github-responses.ts
├── helpers/              # Test utilities
│   ├── database.helper.ts
│   ├── app.helper.ts
│   └── mock-github.helper.ts
└── setup/                # Global setup
    └── setup.ts
```

## Writing Tests

### API Integration Test Example

```typescript
import request from 'supertest';
import { getTestApp } from '../../helpers/app.helper';
import { initTestDatabase, truncateTables } from '../../helpers/database.helper';

describe('Projects API', () => {
  const app = getTestApp();

  beforeAll(async () => {
    await initTestDatabase();
  });

  beforeEach(async () => {
    await truncateTables();
  });

  it('should return projects', async () => {
    const response = await request(app)
      .get('/api/v1/projects')
      .expect(200);

    expect(response.body.data).toBeInstanceOf(Array);
  });
});
```

### Repository Test Example

```typescript
import projectRepository from '@/repositories/project.repository';
import { initTestDatabase, truncateTables, seedProjects } from '../../helpers/database.helper';
import { mockProjects } from '../../fixtures/projects';

describe('ProjectRepository', () => {
  beforeAll(async () => {
    await initTestDatabase();
  });

  beforeEach(async () => {
    await truncateTables();
  });

  it('should find project by id', async () => {
    await seedProjects([mockProjects.tensorflow]);
    const project = await projectRepository.findById(1);
    expect(project).not.toBeNull();
  });
});
```

### Mocking GitHub API

```typescript
import { mockGetRepository, cleanGitHubMocks } from '../../helpers/mock-github.helper';
import { mockGitHubResponses } from '../../fixtures/github-responses';

describe('GitHub Service', () => {
  afterEach(() => {
    cleanGitHubMocks();
  });

  it('should fetch repository data', async () => {
    mockGetRepository('tensorflow', 'tensorflow', mockGitHubResponses.tensorflow);
    
    const data = await githubService.getRepository('tensorflow', 'tensorflow');
    expect(data.full_name).toBe('tensorflow/tensorflow');
  });
});
```

## Test Helpers

### Database Helpers

```typescript
// Initialize schema
await initTestDatabase();

// Clean all data
await truncateTables();

// Seed test data
await seedProjects([mockProjects.tensorflow]);
await seedMetrics([{ project_id: 1, stars_count: 1000, ... }]);

// Query helpers
const project = await getProjectByFullName('tensorflow/tensorflow');
const count = await getMetricsCount(projectId);

// Cleanup
await closeTestPool();
```

### GitHub API Mocking

```typescript
// Mock successful response
mockGetRepository('owner', 'repo', mockData);

// Mock 404
mockGetRepositoryNotFound('owner', 'repo');

// Mock rate limit
mockRateLimitExceeded();

// Clean mocks
cleanGitHubMocks();
```

## Coverage Reports

Coverage reports are generated in the `coverage/` directory after running tests with coverage enabled.

### View Coverage Report

```bash
# Run tests with coverage
npm test

# Open HTML report in browser
open coverage/lcov-report/index.html
```

### Coverage Thresholds

Current thresholds (configured in `jest.config.js`):
- Branches: 70%
- Functions: 70%
- Lines: 80%
- Statements: 80%

### Check Coverage for Specific Files

```bash
npx jest --coverage --collectCoverageFrom="src/services/**/*.ts"
```

## Troubleshooting

### Database Connection Issues

**Problem:** Tests fail with "connection refused" or "database not accessible"

**Solution:**
1. Check if test database is running:
   ```bash
   docker-compose -f docker-compose.test.yml ps
   ```

2. Verify connection string in `.env.test`:
   ```bash
   echo $DATABASE_URL
   ```

3. Test connection manually:
   ```bash
   psql postgresql://test_user:test_password@localhost:5433/github_ai_tracker_test -c "SELECT 1"
   ```

### Schema Not Initialized

**Problem:** Tests fail with "relation does not exist"

**Solution:**
```bash
# Reinitialize schema
DATABASE_URL=postgresql://test_user:test_password@localhost:5433/github_ai_tracker_test npm run db:init
```

### Port Conflicts

**Problem:** "port 5433 already in use"

**Solution:**
```bash
# Check what's using the port
lsof -i :5433

# Stop the conflicting service or change port in docker-compose.test.yml
```

### Hanging Tests

**Problem:** Tests hang or timeout

**Solution:**
1. Check for unclosed database connections
2. Ensure `afterAll()` closes connections:
   ```typescript
   afterAll(async () => {
     await closeTestPool();
   });
   ```

3. Increase timeout in `jest.config.js`:
   ```javascript
   testTimeout: 30000  // 30 seconds
   ```

### GitHub API Mock Issues

**Problem:** Tests fail with "Nock: No match for request"

**Solution:**
1. Ensure mocks are set up before the test runs
2. Clean mocks between tests:
   ```typescript
   afterEach(() => {
     cleanGitHubMocks();
   });
   ```

3. Use `nock.recorder.rec()` to capture actual requests:
   ```typescript
   import nock from 'nock';
   nock.recorder.rec();
   // Make request
   console.log(nock.recorder.play());
   ```

### TypeScript Path Mapping

**Problem:** "Cannot find module '@/...'"

**Solution:**
Ensure `moduleNameMapper` is configured in `jest.config.js`:
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
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
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Initialize database
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/github_ai_tracker_test
        run: npm run db:init
      
      - name: Run tests
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/github_ai_tracker_test
          NODE_ENV: test
        run: npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Best Practices

### 1. Test Isolation

Always clean database between tests:

```typescript
beforeEach(async () => {
  await truncateTables();
});
```

### 2. Descriptive Test Names

Use clear, descriptive test names:

```typescript
// ✅ Good
it('should return 404 when project does not exist');

// ❌ Bad
it('should work');
```

### 3. Arrange-Act-Assert

Structure tests clearly:

```typescript
it('should create project', async () => {
  // Arrange
  const projectData = { ... };
  
  // Act
  const result = await projectService.create(projectData);
  
  // Assert
  expect(result.id).toBeDefined();
});
```

### 4. Mock External Dependencies

Always mock external APIs:

```typescript
// Mock GitHub API to avoid rate limits
mockGetRepository('owner', 'repo', mockData);
```

### 5. Test Error Cases

Don't just test happy paths:

```typescript
it('should handle database errors');
it('should handle GitHub API rate limits');
it('should validate input data');
```

## Performance Optimization

### 1. Use Transaction Rollback (Future Enhancement)

Instead of truncating tables, use transactions:

```typescript
beforeEach(async () => {
  await query('BEGIN');
});

afterEach(async () => {
  await query('ROLLBACK');
});
```

### 2. Parallel Test Execution

For independent test files:

```javascript
// jest.config.js
maxWorkers: 4  // Or "50%" for half CPU cores
```

### 3. In-Memory Database

Use tmpfs for faster test database (already configured in `docker-compose.test.yml`).

## Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest GitHub](https://github.com/visionmedia/supertest)
- [Nock Documentation](https://github.com/nock/nock)
- [PostgreSQL Testing Best Practices](https://www.postgresql.org/docs/current/regress.html)

## Next Steps

1. ✅ Set up test database
2. ✅ Configure test environment
3. ✅ Write API integration tests
4. ✅ Write repository tests
5. ⏳ Write service integration tests
6. ⏳ Write workflow tests
7. ⏳ Set up CI/CD pipeline
8. ⏳ Add performance tests

