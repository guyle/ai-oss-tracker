# GitHub AI Trending Tracker

## Project Overview
A database-driven system to track trending AI open source projects on GitHub. The system collects project metadata, tracks star growth over time, and provides analytics on trending patterns.

## Architecture
- **Data Collection**: Scheduled GitHub API queries via cron/GitHub Actions
- **Storage**: PostgreSQL database with time-series tracking
- **API**: REST API built with Node.js/TypeScript
- **Processing**: Background jobs for data enrichment and analysis
- **Alerts**: Webhook notifications for projects meeting criteria

## Tech Stack
- **Runtime**: Node.js 20+
- **Language**: TypeScript 5+
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **API Framework**: Express.js
- **Scheduler**: node-cron (or GitHub Actions)
- **GitHub API Client**: @octokit/rest
- **Environment**: dotenv

## Key Features
- Automated tracking of AI-related GitHub repositories
- Time-series metrics storage (stars, forks, watchers)
- Star velocity calculations (growth rate)
- Trending projects snapshots
- REST API for querying tracked projects
- Alert system for rapidly growing projects
- Historical data analysis

## Success Criteria
- Track 1000+ AI projects continuously
- Update metrics every 15 minutes
- Stay within GitHub API rate limits (5000 req/hr)
- API response time < 200ms for simple queries
- 99% uptime for data collection jobs
