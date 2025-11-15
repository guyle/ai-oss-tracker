# Project Structure

```
github-ai-tracker/
├── .github/
│   └── workflows/
│       └── sync.yml                    # GitHub Actions workflow for scheduled sync
│
├── web/                                # Frontend (Next.js Dashboard)
│   ├── app/
│   │   ├── layout.tsx                  # Root layout with header/footer
│   │   ├── page.tsx                    # Home page - projects list
│   │   ├── projects/
│   │   │   └── [id]/
│   │   │       └── page.tsx            # Project detail page
│   │   └── globals.css                 # Global styles
│   │
│   ├── components/
│   │   ├── Header.tsx                  # Navigation header
│   │   ├── ThemeProvider.tsx           # Dark mode context
│   │   ├── ThemeToggle.tsx             # Theme switcher
│   │   ├── StatsCards.tsx              # Dashboard statistics
│   │   ├── Filters.tsx                 # Language/sort filters
│   │   ├── ProjectsList.tsx            # Projects grid (server component)
│   │   ├── ProjectCard.tsx             # Individual project card
│   │   ├── Pagination.tsx              # Pagination controls
│   │   ├── ProjectHeader.tsx           # Project detail header
│   │   ├── ProjectMetrics.tsx          # Project metrics display
│   │   ├── StarHistoryChart.tsx        # Star growth chart
│   │   ├── BackButton.tsx              # Navigation back button
│   │   └── LoadingSpinner.tsx          # Loading indicator
│   │
│   ├── lib/
│   │   ├── api.ts                      # API client for backend communication
│   │   ├── types.ts                    # Shared TypeScript types
│   │   └── utils.ts                    # Helper functions (formatting, colors)
│   │
│   ├── package.json                    # Frontend dependencies
│   ├── tsconfig.json                   # TypeScript configuration
│   ├── tailwind.config.ts              # Tailwind CSS configuration
│   ├── next.config.js                  # Next.js configuration (API proxy)
│   └── README.md                       # Frontend documentation
│
├── src/                                # Backend (Express API)
│   ├── config/
│   │   ├── database.ts                 # Database connection pool configuration
│   │   ├── github.ts                   # Octokit GitHub API client setup
│   │   └── env.ts                      # Environment variable validation
│   │
│   ├── services/
│   │   ├── github.service.ts           # GitHub API interactions (search, fetch repos)
│   │   ├── project.service.ts          # Project business logic (CRUD)
│   │   ├── metrics.service.ts          # Metrics tracking and calculations
│   │   ├── trending.service.ts         # Trending page scraping/API
│   │   └── alert.service.ts            # Alert checking and notification logic
│   │
│   ├── jobs/
│   │   ├── sync-trending.job.ts        # Job to sync trending page snapshots
│   │   ├── update-metrics.job.ts       # Job to update project metrics
│   │   ├── check-alerts.job.ts         # Job to check and trigger alerts
│   │   └── scheduler.ts                # Node-cron job scheduler setup
│   │
│   ├── routes/
│   │   ├── index.ts                    # Route aggregator
│   │   ├── projects.routes.ts          # Project endpoints
│   │   ├── trending.routes.ts          # Trending endpoints
│   │   ├── analytics.routes.ts         # Analytics endpoints
│   │   └── admin.routes.ts             # Admin/system endpoints
│   │
│   ├── controllers/
│   │   ├── projects.controller.ts      # Project request handlers
│   │   ├── trending.controller.ts      # Trending request handlers
│   │   ├── analytics.controller.ts     # Analytics request handlers
│   │   └── admin.controller.ts         # Admin request handlers
│   │
│   ├── models/
│   │   ├── types.ts                    # TypeScript interfaces and types
│   │   ├── project.model.ts            # Project data model
│   │   └── metrics.model.ts            # Metrics data model
│   │
│   ├── repositories/
│   │   ├── project.repository.ts       # Database queries for projects
│   │   ├── metrics.repository.ts       # Database queries for metrics
│   │   └── trending.repository.ts      # Database queries for trending
│   │
│   ├── utils/
│   │   ├── logger.ts                   # Winston logging utility
│   │   ├── validators.ts               # Request input validation
│   │   ├── helpers.ts                  # Helper functions
│   │   └── rate-limiter.ts             # GitHub API rate limit handling
│   │
│   ├── middleware/
│   │   ├── error-handler.ts            # Global error handling middleware
│   │   ├── request-logger.ts           # HTTP request logging
│   │   ├── rate-limiter.ts             # API rate limiting
│   │   └── auth.ts                     # API authentication (optional)
│   │
│   ├── db/
│   │   ├── schema.sql                  # Complete database schema
│   │   ├── migrations/
│   │   │   ├── 001_initial_schema.sql
│   │   │   ├── 002_add_indexes.sql
│   │   │   └── 003_add_views.sql
│   │   └── seeds/
│   │       └── initial_projects.sql    # Seed data for testing
│   │
│   ├── app.ts                          # Express app setup and configuration
│   └── server.ts                       # Server entry point
│
├── prisma/
│   └── schema.prisma                   # Prisma schema (alternative to raw SQL)
│
├── scripts/
│   ├── init-db.sh                      # Database initialization script
│   ├── seed-projects.ts                # Script to seed initial projects
│   └── backup-db.sh                    # Database backup script
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   ├── controllers/
│   │   └── utils/
│   ├── integration/
│   │   ├── api.test.ts
│   │   └── database.test.ts
│   └── setup.ts                        # Test environment setup
│
├── .cursor/
│   └── rules/
│       ├── project.mdc                 # Main project rules for Cursor
│       ├── api.mdc                     # API development rules
│       ├── database.mdc                # Database interaction rules
│       └── testing.mdc                 # Testing guidelines
│
├── .env.example                        # Example environment variables
├── .gitignore
├── .eslintrc.json                      # ESLint configuration
├── .prettierrc                         # Prettier configuration
├── package.json
├── tsconfig.json                       # TypeScript configuration
├── docker-compose.yml                  # PostgreSQL container
├── Dockerfile                          # Application container (optional)
└── README.md
```

## Key Directories

### `/web` (Frontend)
Next.js 14+ dashboard application:
- **app/**: Next.js App Router pages with server-side rendering
- **components/**: Reusable React components (both server and client)
- **lib/**: API client, TypeScript types, utility functions
- Uses Tailwind CSS for styling
- Recharts for data visualization
- Server-side data fetching for optimal performance

### `/src/services` (Backend)
Business logic layer. Each service handles a specific domain:
- **github.service.ts**: Wraps @octokit/rest, handles rate limiting
- **project.service.ts**: Project CRUD operations
- **metrics.service.ts**: Calculate velocities, deltas
- **trending.service.ts**: Fetch/scrape trending data

### `/src/repositories`
Data access layer. Isolates SQL queries from business logic:
- Uses parameterized queries to prevent SQL injection
- Returns typed data models
- Handles database errors

### `/src/jobs`
Background jobs for automation:
- Triggered by node-cron or GitHub Actions
- Idempotent operations (safe to re-run)
- Error handling and retry logic

### `/src/routes` & `/src/controllers`
HTTP layer:
- Routes define endpoints and apply middleware
- Controllers handle request/response
- Validate input, call services, format output

### `/.cursor/rules`
Cursor AI instructions in .mdc format:
- Project-specific coding standards
- Architecture patterns to follow
- Common operations and examples

## File Naming Conventions

- Use kebab-case for file names: `github-api.service.ts`
- Add suffix to indicate file type: `.service.ts`, `.controller.ts`, `.test.ts`
- Group related files in directories
- Keep file length under 300 lines (split if larger)

## Import Organization

```typescript
// 1. External libraries
import express from 'express';
import { Octokit } from '@octokit/rest';

// 2. Internal modules (absolute imports)
import { ProjectService } from '@/services/project.service';
import { logger } from '@/utils/logger';

// 3. Types
import type { Project, Metrics } from '@/models/types';

// 4. Relative imports (if needed)
import { helper } from './helpers';
```

## Frontend Architecture

The frontend uses Next.js 14+ App Router with the following patterns:

### Server vs Client Components

- **Server Components** (default): Used for data fetching, SEO
  - `app/page.tsx` - Main dashboard page
  - `app/projects/[id]/page.tsx` - Project detail page
  - `components/ProjectsList.tsx` - Fetches and renders projects
  - `components/StatsCards.tsx` - Fetches system stats

- **Client Components** (`'use client'`): Used for interactivity
  - `components/Filters.tsx` - Filter controls with state
  - `components/Pagination.tsx` - Navigation with router
  - `components/ThemeToggle.tsx` - Theme switching
  - `components/StarHistoryChart.tsx` - Interactive charts

### Data Fetching Pattern

```typescript
// Server Component - fetches data directly
export default async function ProjectsList({ page, language }: Props) {
  const response = await apiClient.getProjects({ page, language });
  return <div>{/* render data */}</div>;
}

// Client Component - uses state and effects
'use client';
export function Filters() {
  const [language, setLanguage] = useState('');
  // Interactive logic here
}
```

### Styling with Tailwind

- Global styles in `app/globals.css`
- Component styles using Tailwind utility classes
- Dark mode support with `dark:` prefix
- Custom theme configuration in `tailwind.config.ts`

### Type Safety

- Shared types in `web/lib/types.ts`
- Type-safe API client with full IntelliSense
- Strict TypeScript configuration
- Props interfaces for all components
