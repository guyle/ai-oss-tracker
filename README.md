# GitHub AI Trending Tracker

A database-driven system to track trending AI open source projects on GitHub. The system collects project metadata, tracks star growth over time, and provides analytics on trending patterns.

## Features

- 🚀 Automated tracking of AI-related GitHub repositories
- 📊 Time-series metrics storage (stars, forks, watchers)
- 📈 Star velocity calculations (growth rate)
- 🔍 REST API for querying tracked projects
- 💻 Modern Next.js dashboard with interactive charts
- 🌓 Dark mode support with beautiful UI
- 💾 PostgreSQL database with optimized indexes
- 🛡️ Rate limiting and error handling
- 📝 Comprehensive logging with Winston

## Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Language**: TypeScript 5+
- **Database**: PostgreSQL 15+
- **API Framework**: Express.js
- **GitHub API Client**: @octokit/rest
- **Logging**: Winston

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **UI**: Responsive, Dark Mode Support

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **Docker** and Docker Compose (for PostgreSQL)
- **GitHub Personal Access Token** with `repo` scope

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/guyle/ai-oss-tracker.git
cd ai-oss-tracker
```

### 2. Install Dependencies

**Backend:**
```bash
npm install
```

**Frontend:**
```bash
cd web
npm install
cd ..
```

### 3. Setup Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
DATABASE_URL=postgresql://tracker_user:tracker_password@localhost:5432/ai_tracker
GITHUB_TOKEN=ghp_your_personal_access_token_here
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
```

**To get a GitHub token:**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` and `read:org` scopes
3. Copy the token to your `.env` file

### 4. Start PostgreSQL Database

```bash
docker-compose up -d
```

Wait a few seconds for PostgreSQL to initialize. The database schema will be automatically created.

### 5. Verify Database Connection

```bash
# Check if PostgreSQL is running
docker ps

# Test connection
psql postgresql://tracker_user:tracker_password@localhost:5432/ai_tracker -c "SELECT 1"
```

### 6. Start the Backend Server

```bash
npm run dev
```

The backend server will start on `http://localhost:3000`

### 7. Start the Frontend (Optional)

In a new terminal:

```bash
cd web
npm run dev
```

The frontend will start on `http://localhost:3001`

Open [http://localhost:3001](http://localhost:3001) in your browser to see the dashboard!

### 8. Test the API

Open your browser or use curl:

```bash
# Health check
curl http://localhost:3000/health

# System stats (includes rate limit info)
curl http://localhost:3000/api/v1/admin/stats

# List projects (will be empty initially)
curl http://localhost:3000/api/v1/projects
```

## API Endpoints

### Projects

- `GET /api/v1/projects` - List all projects
  - Query params: `page`, `limit`, `language`, `topics`, `sortBy`, `order`
- `GET /api/v1/projects/:id` - Get project details
- `GET /api/v1/projects/:id/history` - Get metrics history
  - Query params: `from`, `to`

### Admin

- `GET /api/v1/admin/health` - Health check
- `GET /api/v1/admin/stats` - System statistics

### Examples

```bash
# Get first page of projects
curl "http://localhost:3000/api/v1/projects?page=1&limit=10"

# Filter by language
curl "http://localhost:3000/api/v1/projects?language=Python"

# Get project by ID
curl "http://localhost:3000/api/v1/projects/1"

# Get metrics history
curl "http://localhost:3000/api/v1/projects/1/history?from=2025-01-01"

# Check system health
curl "http://localhost:3000/api/v1/admin/health"
```

## Development

### Available Scripts

```bash
# Development with hot-reload
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Linting
npm run lint
npm run lint:fix

# Format code
npm run format

# Type checking
npm run type-check

# Tests
npm test
npm run test:watch
```

### Database Management

```bash
# Connect to PostgreSQL CLI
psql $DATABASE_URL

# View tables
\dt

# Query projects
SELECT * FROM projects LIMIT 10;

# View metrics
SELECT * FROM project_metrics ORDER BY recorded_at DESC LIMIT 10;

# Backup database
docker exec ai_tracker_db pg_dump -U tracker_user ai_tracker > backup.sql

# Restore database
docker exec -i ai_tracker_db psql -U tracker_user ai_tracker < backup.sql
```

### Project Structure

```
ai-oss-tracker/
├── src/             # Backend (Express API)
│   ├── config/      # Configuration (database, GitHub API, env)
│   ├── controllers/ # Request handlers
│   ├── middleware/  # Express middleware
│   ├── models/      # TypeScript types
│   ├── repositories/# Database queries
│   ├── routes/      # API routes
│   ├── services/    # Business logic
│   ├── utils/       # Utilities (logger, errors)
│   ├── db/          # Database schema
│   ├── app.ts       # Express app setup
│   └── server.ts    # Server entry point
│
└── web/             # Frontend (Next.js Dashboard)
    ├── app/         # Next.js App Router pages
    ├── components/  # React components
    ├── lib/         # API client, types, utilities
    └── package.json # Frontend dependencies
```

## Adding Projects to Track

To add projects to the tracker, you'll need to implement the sync job. For now, you can manually add projects via the database:

```sql
-- Example: Add a project
INSERT INTO projects (
  github_id, full_name, name, description, html_url,
  language, topics, created_at, updated_at
) VALUES (
  123456789,
  'openai/gpt-4',
  'gpt-4',
  'GPT-4 model implementation',
  'https://github.com/openai/gpt-4',
  'Python',
  ARRAY['ai', 'gpt', 'llm'],
  NOW(),
  NOW()
);
```

Or use the GitHub service programmatically:

```typescript
import githubService from '@/services/github.service';
import projectService from '@/services/project.service';

// Search for AI repositories
const repos = await githubService.searchAIRepositories();

// Create projects from GitHub data
for (const repo of repos) {
  await projectService.createProjectFromGitHub(repo);
}
```

## Troubleshooting

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# View logs
docker logs ai_tracker_db

# Restart database
docker-compose restart
```

### GitHub API Rate Limit

```bash
# Check your rate limit status
curl -H "Authorization: token YOUR_GITHUB_TOKEN" https://api.github.com/rate_limit

# The API allows 5000 requests/hour for authenticated users
```

### Port Already in Use

```bash
# Change PORT in .env file
PORT=3001
```

### TypeScript Path Errors

Make sure `tsconfig-paths` is installed:

```bash
npm install --save-dev tsconfig-paths
```

## Production Deployment

### Build for Production

```bash
npm run build
NODE_ENV=production npm start
```

### Environment Variables

Make sure to set appropriate production values:

```env
NODE_ENV=production
LOG_LEVEL=info
DATABASE_URL=postgresql://user:pass@prod-host:5432/db
```

### Using PM2

```bash
npm install -g pm2
pm2 start dist/server.js --name ai-tracker
pm2 startup
pm2 save
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open a GitHub issue.

## Frontend Dashboard

The project includes a modern Next.js dashboard at `/web`. Features include:

- 📊 **Interactive Dashboard** - View all tracked projects with filtering
- 📈 **Star History Charts** - Visualize growth over time
- 🎨 **Beautiful UI** - Modern design with Tailwind CSS
- 🌓 **Dark Mode** - Automatic theme detection and manual toggle
- 📱 **Responsive** - Works on all devices
- ⚡ **Fast** - Server-side rendering with Next.js

**Quick Start:**
```bash
cd web
npm install
npm run dev
```

Visit [http://localhost:3001](http://localhost:3001) to see the dashboard.

For more details, see [web/README.md](web/README.md)

## Next Steps

- [ ] Implement scheduled jobs for automatic data collection
- [ ] Add trending page scraping functionality
- [ ] Implement alert system
- [ ] Add more analytics endpoints
- [x] Create dashboard/UI ✅
- [ ] Add authentication for admin endpoints
- [ ] Implement comprehensive test suite



