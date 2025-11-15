# Implementation Guide

## Phase 1: Setup & Core Infrastructure

### 1.1 Initialize Project

```bash
# Create project directory
mkdir github-ai-tracker
cd github-ai-tracker

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install express typescript @types/node @types/express
npm install dotenv pg @types/pg
npm install @octokit/rest
npm install node-cron @types/node-cron
npm install winston express-rate-limit helmet cors compression

# Install dev dependencies
npm install -D ts-node nodemon
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D prettier eslint
npm install -D jest @types/jest ts-jest
```

**Configure TypeScript (tsconfig.json):**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 1.2 Database Setup

**Create PostgreSQL with Docker:**
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ai_tracker
      POSTGRES_USER: tracker_user
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./src/db/schema.sql:/docker-entrypoint-initdb.d/schema.sql

volumes:
  postgres_data:
```

**Database Connection (src/config/database.ts):**
```typescript
import { Pool } from 'pg';
import { logger } from '@/utils/logger';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  logger.error('Unexpected database error', err);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Database query error', { text, error });
    throw error;
  }
};

export default pool;
```

### 1.3 GitHub API Client Setup

**Configure Octokit (src/config/github.ts):**
```typescript
import { Octokit } from '@octokit/rest';
import { throttling } from '@octokit/plugin-throttling';
import { logger } from '@/utils/logger';

const MyOctokit = Octokit.plugin(throttling);

export const octokit = new MyOctokit({
  auth: process.env.GITHUB_TOKEN,
  throttle: {
    onRateLimit: (retryAfter, options, octokit, retryCount) => {
      logger.warn(
        `Rate limit hit for ${options.method} ${options.url}, retrying after ${retryAfter}s`
      );
      if (retryCount < 3) return true; // Retry up to 3 times
      return false;
    },
    onSecondaryRateLimit: (retryAfter, options, octokit) => {
      logger.warn(`Secondary rate limit hit for ${options.method} ${options.url}`);
      return true;
    },
  },
});

// Check rate limit status
export const checkRateLimit = async () => {
  const { data } = await octokit.rateLimit.get();
  return {
    remaining: data.rate.remaining,
    limit: data.rate.limit,
    reset: new Date(data.rate.reset * 1000),
  };
};
```

## Phase 2: Data Collection Layer

### 2.1 GitHub Service (src/services/github.service.ts)

```typescript
import { octokit } from '@/config/github';
import { logger } from '@/utils/logger';

export class GitHubService {
  // Search AI-related repositories
  async searchAIRepositories(page = 1, perPage = 100) {
    const topics = ['ai', 'machine-learning', 'deep-learning', 'llm', 'gpt'];
    const query = topics.map(t => `topic:${t}`).join(' OR ');
    
    const { data } = await octokit.search.repos({
      q: `${query} stars:>100 archived:false`,
      sort: 'stars',
      order: 'desc',
      per_page: perPage,
      page,
    });
    
    return data.items;
  }

  // Get repository details
  async getRepository(owner: string, repo: string) {
    const { data } = await octokit.repos.get({ owner, repo });
    return data;
  }

  // Get repository topics
  async getRepositoryTopics(owner: string, repo: string) {
    const { data } = await octokit.repos.getAllTopics({ owner, repo });
    return data.names;
  }
}
```

### 2.2 Project Service (src/services/project.service.ts)

```typescript
import { query } from '@/config/database';
import type { Project } from '@/models/types';

export class ProjectService {
  async createProject(githubData: any): Promise<Project> {
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
        last_synced_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const values = [
      githubData.id,
      githubData.full_name,
      githubData.name,
      githubData.description,
      githubData.html_url,
      githubData.homepage,
      githubData.language,
      githubData.topics || [],
      githubData.created_at,
      githubData.updated_at,
      githubData.pushed_at,
      githubData.fork,
      githubData.archived,
      githubData.license?.spdx_id || null,
    ];
    
    const result = await query(sql, values);
    return result.rows[0];
  }

  async getProject(id: number): Promise<Project | null> {
    const sql = 'SELECT * FROM projects WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  async getAllProjects(filters: any = {}) {
    let sql = 'SELECT * FROM projects WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (filters.language) {
      sql += ` AND language = $${paramCount}`;
      params.push(filters.language);
      paramCount++;
    }

    if (filters.topics?.length) {
      sql += ` AND topics @> $${paramCount}`;
      params.push(filters.topics);
      paramCount++;
    }

    sql += ` ORDER BY ${filters.sortBy || 'id'} ${filters.order || 'DESC'}`;
    sql += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(filters.limit || 50, filters.offset || 0);

    const result = await query(sql, params);
    return result.rows;
  }
}
```

### 2.3 Metrics Service (src/services/metrics.service.ts)

```typescript
import { query } from '@/config/database';

export class MetricsService {
  async recordMetrics(projectId: number, metrics: any) {
    // Get previous metrics for calculating deltas
    const previous = await this.getLatestMetrics(projectId);
    
    const sql = `
      INSERT INTO project_metrics (
        project_id, stars_count, forks_count, watchers_count,
        open_issues_count, stars_gained_24h, stars_gained_7d, stars_velocity
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const starsGained24h = previous 
      ? metrics.stars - previous.stars_count 
      : 0;
    
    const velocity = previous
      ? this.calculateVelocity(projectId)
      : 0;
    
    const values = [
      projectId,
      metrics.stars,
      metrics.forks,
      metrics.watchers,
      metrics.openIssues,
      starsGained24h,
      0, // Will calculate weekly gain separately
      velocity,
    ];
    
    const result = await query(sql, values);
    return result.rows[0];
  }

  async calculateVelocity(projectId: number): Promise<number> {
    const sql = `
      SELECT 
        (MAX(stars_count) - MIN(stars_count)) / 
        GREATEST(EXTRACT(EPOCH FROM (MAX(recorded_at) - MIN(recorded_at))) / 86400, 1) 
        as velocity
      FROM project_metrics
      WHERE project_id = $1
        AND recorded_at > NOW() - INTERVAL '7 days'
    `;
    
    const result = await query(sql, [projectId]);
    return parseFloat(result.rows[0]?.velocity || '0');
  }

  private async getLatestMetrics(projectId: number) {
    const sql = `
      SELECT * FROM project_metrics
      WHERE project_id = $1
      ORDER BY recorded_at DESC
      LIMIT 1
    `;
    const result = await query(sql, [projectId]);
    return result.rows[0] || null;
  }
}
```

## Phase 3: API Development

### 3.1 Express App Setup (src/app.ts)

```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import routes from '@/routes';
import { errorHandler } from '@/middleware/error-handler';
import { requestLogger } from '@/middleware/request-logger';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(requestLogger);

// Routes
app.use('/api/v1', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling (must be last)
app.use(errorHandler);

export default app;
```

### 3.2 Controllers (src/controllers/projects.controller.ts)

```typescript
import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '@/services/project.service';
import { MetricsService } from '@/services/metrics.service';

const projectService = new ProjectService();
const metricsService = new MetricsService();

export const getProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = (page - 1) * limit;

    const filters = {
      language: req.query.language,
      topics: req.query.topics,
      sortBy: req.query.sortBy || 'stars',
      order: req.query.order || 'desc',
      limit,
      offset,
    };

    const projects = await projectService.getAllProjects(filters);
    const total = await projectService.countProjects(filters);

    res.json({
      data: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    const project = await projectService.getProject(id);
    
    if (!project) {
      return res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Project not found' },
      });
    }

    const metrics = await metricsService.getLatestMetrics(id);

    res.json({
      ...project,
      currentMetrics: metrics,
    });
  } catch (error) {
    next(error);
  }
};
```

## Phase 4: Automation with Cron Jobs

### 4.1 Job Scheduler (src/jobs/scheduler.ts)

```typescript
import cron from 'node-cron';
import { updateMetricsJob } from './update-metrics.job';
import { syncTrendingJob } from './sync-trending.job';
import { checkAlertsJob } from './check-alerts.job';
import { logger } from '@/utils/logger';

export const startScheduler = () => {
  // Update metrics every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    logger.info('Starting metrics update job');
    await updateMetricsJob();
  });

  // Sync trending daily at 00:00 UTC
  cron.schedule('0 0 * * *', async () => {
    logger.info('Starting trending sync job');
    await syncTrendingJob();
  });

  // Check alerts every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Starting alerts check job');
    await checkAlertsJob();
  });

  logger.info('Job scheduler started');
};
```

### 4.2 Update Metrics Job (src/jobs/update-metrics.job.ts)

```typescript
import { ProjectService } from '@/services/project.service';
import { GitHubService } from '@/services/github.service';
import { MetricsService } from '@/services/metrics.service';
import { logger } from '@/utils/logger';

const projectService = new ProjectService();
const githubService = new GitHubService();
const metricsService = new MetricsService();

export const updateMetricsJob = async () => {
  try {
    const projects = await projectService.getAllProjects({ limit: 1000 });
    
    logger.info(`Updating metrics for ${projects.length} projects`);
    
    for (const project of projects) {
      const [owner, repo] = project.full_name.split('/');
      
      try {
        const repoData = await githubService.getRepository(owner, repo);
        
        await metricsService.recordMetrics(project.id, {
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          watchers: repoData.watchers_count,
          openIssues: repoData.open_issues_count,
        });
        
        // Respect rate limits - add small delay
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        logger.error(`Failed to update metrics for ${project.full_name}`, error);
      }
    }
    
    logger.info('Metrics update job completed');
  } catch (error) {
    logger.error('Metrics update job failed', error);
    throw error;
  }
};
```

## Phase 5: Testing & Deployment

### 5.1 Unit Tests

```typescript
// tests/unit/services/project.service.test.ts
import { ProjectService } from '@/services/project.service';
import { query } from '@/config/database';

jest.mock('@/config/database');

describe('ProjectService', () => {
  let service: ProjectService;

  beforeEach(() => {
    service = new ProjectService();
    jest.clearAllMocks();
  });

  test('createProject inserts new project', async () => {
    const mockGithubData = {
      id: 123,
      full_name: 'test/repo',
      name: 'repo',
      // ... other fields
    };

    (query as jest.Mock).mockResolvedValue({
      rows: [{ id: 1, ...mockGithubData }],
    });

    const result = await service.createProject(mockGithubData);
    
    expect(result.id).toBe(1);
    expect(query).toHaveBeenCalledTimes(1);
  });
});
```

### 5.2 Environment Setup

```bash
# .env.example
DATABASE_URL=postgresql://tracker_user:password@localhost:5432/ai_tracker
GITHUB_TOKEN=ghp_your_token_here
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
ENABLE_CRON=true
```

### 5.3 Start Server (src/server.ts)

```typescript
import app from './app';
import { startScheduler } from '@/jobs/scheduler';
import { logger } from '@/utils/logger';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  
  if (process.env.ENABLE_CRON === 'true') {
    startScheduler();
  }
});
```

## Key Implementation Notes

### Rate Limiting Strategy
- GitHub authenticated rate limit: 5000 req/hr (~83 req/min)
- For 1000 projects: Full sync takes ~12 minutes
- Use conditional requests (If-Modified-Since headers) to save quota
- Implement exponential backoff on 403 rate limit errors

### Performance Optimization
- Use database connection pooling
- Add indexes on frequently queried columns
- Cache GitHub responses for 15 minutes
- Batch database inserts when possible

### Error Handling
- Wrap async operations in try-catch
- Log errors with context
- Gracefully degrade on API failures
- Retry transient failures with backoff
