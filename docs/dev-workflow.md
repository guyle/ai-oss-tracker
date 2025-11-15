# Development Workflow

## Getting Started

### Prerequisites
- **Node.js** 20+ (check with `node --version`)
- **PostgreSQL** 15+ (or Docker)
- **GitHub Personal Access Token** with `repo` and `read:org` scopes

### Initial Setup

```bash
# Clone repository
git clone <your-repo-url>
cd github-ai-tracker

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials:
# - DATABASE_URL
# - GITHUB_TOKEN

# Start PostgreSQL (Docker)
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
sleep 5

# Initialize database
npm run db:init
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

### Environment Variables

Create `.env` file in project root:

```env
# Database
DATABASE_URL=postgresql://tracker_user:your_password@localhost:5432/ai_tracker

# GitHub API
GITHUB_TOKEN=ghp_your_personal_access_token_here
GITHUB_API_BASE_URL=https://api.github.com

# Server
PORT=3000
NODE_ENV=development

# Scheduler
ENABLE_CRON=true
METRICS_UPDATE_INTERVAL=*/15 * * * *
TRENDING_SYNC_INTERVAL=0 0 * * *
ALERTS_CHECK_INTERVAL=0 * * * *

# Logging
LOG_LEVEL=debug  # debug | info | warn | error

# Alerts (optional)
ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
ALERT_EMAIL=alerts@example.com

# Rate Limiting
API_RATE_LIMIT=100  # requests per 15 minutes per IP
```

## NPM Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon --watch src --exec ts-node -r tsconfig-paths/register src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "clean": "rm -rf dist",
    
    "db:init": "psql $DATABASE_URL -f src/db/schema.sql",
    "db:migrate": "node scripts/run-migrations.js",
    "db:seed": "ts-node scripts/seed-projects.ts",
    "db:reset": "npm run db:init && npm run db:migrate && npm run db:seed",
    
    "job:sync": "ts-node src/jobs/sync-trending.job.ts",
    "job:metrics": "ts-node src/jobs/update-metrics.job.ts",
    "job:alerts": "ts-node src/jobs/check-alerts.job.ts",
    
    "test": "jest --coverage",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:watch": "jest --watch",
    
    "lint": "eslint src --ext .ts",
    "lint:fix": "eslint src --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "type-check": "tsc --noEmit"
  }
}
```

## Development Commands

### Running the Application

```bash
# Development mode with hot-reload
npm run dev

# Production build and run
npm run build
npm run start

# Run specific jobs manually
npm run job:sync        # Sync trending projects
npm run job:metrics     # Update all project metrics
npm run job:alerts      # Check and trigger alerts
```

### Database Operations

```bash
# Initialize fresh database
npm run db:init

# Run migrations
npm run db:migrate

# Seed with sample data
npm run db:seed

# Complete reset (destructive!)
npm run db:reset

# Connect to PostgreSQL CLI
psql $DATABASE_URL

# Backup database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

### Testing

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Watch mode (re-run on file changes)
npm run test:watch

# Generate coverage report
npm test -- --coverage
```

### Code Quality

```bash
# Lint TypeScript files
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type check without emitting files
npm run type-check

# Run all quality checks
npm run lint && npm run type-check && npm test
```

## Git Workflow

### Branch Naming Convention
- `feature/` - New features (e.g., `feature/trending-api`)
- `fix/` - Bug fixes (e.g., `fix/rate-limit-handling`)
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Adding or updating tests

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style/formatting
- `refactor:` - Code refactoring
- `test:` - Adding/updating tests
- `chore:` - Maintenance tasks

**Examples:**
```bash
git commit -m "feat(api): add trending projects endpoint"
git commit -m "fix(metrics): correct star velocity calculation"
git commit -m "docs: update API documentation with examples"
```

### Pull Request Workflow

1. Create feature branch from `main`
   ```bash
   git checkout -b feature/my-feature
   ```

2. Make changes and commit
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

3. Push to remote
   ```bash
   git push origin feature/my-feature
   ```

4. Create Pull Request on GitHub
   - Fill out PR template
   - Link related issues
   - Request review

5. Address review comments

6. Merge after approval

## Debugging

### Local Debugging with VS Code

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeArgs": ["-r", "ts-node/register", "-r", "tsconfig-paths/register"],
      "args": ["${workspaceFolder}/src/server.ts"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal"
    }
  ]
}
```

**Usage:**
1. Set breakpoints in TypeScript files
2. Press F5 or click "Run and Debug"
3. Use Debug Console to inspect variables

### Database Debugging

```bash
# Connect to PostgreSQL
psql $DATABASE_URL

# View all tables
\dt

# Describe table schema
\d projects

# Query project count
SELECT COUNT(*) FROM projects;

# View latest metrics
SELECT p.full_name, pm.stars_count, pm.stars_velocity, pm.recorded_at
FROM projects p
JOIN project_metrics pm ON p.id = pm.project_id
ORDER BY pm.recorded_at DESC
LIMIT 10;

# Check trending snapshots
SELECT * FROM trending_snapshots
WHERE snapshot_date = CURRENT_DATE
ORDER BY rank;
```

### Monitoring GitHub API Rate Limits

```bash
# Check current rate limit status
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit

# From application (add endpoint)
curl http://localhost:3000/api/v1/admin/stats
```

### Logging

Logs are written to:
- **Console**: All log levels in development
- **File**: `logs/app.log` (rotating daily)
- **Error File**: `logs/error.log` (errors only)

```typescript
// Use logger in code
import { logger } from '@/utils/logger';

logger.debug('Debug message', { metadata: 'here' });
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', error);
```

## Production Deployment

### Pre-deployment Checklist

- [ ] All tests passing (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compilation successful (`npm run build`)
- [ ] Environment variables configured
- [ ] Database migrations up to date
- [ ] GitHub token has correct permissions
- [ ] Rate limiting configured appropriately

### Build for Production

```bash
# Clean previous build
npm run clean

# Build TypeScript
npm run build

# Test production build locally
NODE_ENV=production node dist/server.js
```

### Deployment Options

**Option 1: VPS (DigitalOcean, AWS EC2)**
```bash
# SSH into server
ssh user@your-server

# Clone repo
git clone <repo-url>
cd github-ai-tracker

# Install dependencies (production only)
npm ci --production

# Setup environment
nano .env  # Add production values

# Build
npm run build

# Start with PM2
npm install -g pm2
pm2 start dist/server.js --name ai-tracker
pm2 startup  # Auto-start on reboot
pm2 save
```

**Option 2: Docker**
```dockerfile
# Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

```bash
docker build -t ai-tracker .
docker run -d -p 3000:3000 --env-file .env ai-tracker
```

**Option 3: GitHub Actions (Scheduled Jobs Only)**
Use `.github/workflows/sync.yml` to run jobs without hosting server.

### Monitoring

**Health Check:**
```bash
curl http://your-server:3000/health
```

**Monitor Logs:**
```bash
# With PM2
pm2 logs ai-tracker

# With Docker
docker logs -f <container-id>
```

## Troubleshooting

### Common Issues

**Issue: Database connection fails**
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Verify connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

**Issue: GitHub API rate limit exceeded**
```bash
# Check rate limit status
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/rate_limit

# Wait for rate limit reset or use different token
```

**Issue: TypeScript path aliases not resolving**
```bash
# Install tsconfig-paths
npm install --save-dev tsconfig-paths

# Update scripts to include -r tsconfig-paths/register
```

**Issue: Jobs not running**
```bash
# Check ENABLE_CRON is set to 'true'
echo $ENABLE_CRON

# Manually trigger job to test
npm run job:metrics
```

## Best Practices

1. **Never commit `.env` file** - Use `.env.example` as template
2. **Run migrations before deploying** - Keep database schema in sync
3. **Monitor GitHub API quota** - Stay well below 5000 req/hr limit
4. **Use transactions for related DB writes** - Maintain data consistency
5. **Log errors with context** - Include relevant metadata
6. **Set up alerts for failures** - Know when jobs fail
7. **Regularly backup database** - Schedule daily backups
8. **Keep dependencies updated** - Run `npm audit` regularly
9. **Use connection pooling** - Don't create new DB connections per request
10. **Test rate limit handling** - Simulate API failures
