# Quick Start Guide

Get the GitHub AI Trending Tracker up and running in 5 minutes!

## Step 1: Install Dependencies

**Backend:**
```bash
npm install
```

**Frontend (Optional):**
```bash
cd web
npm install
cd ..
```

## Step 2: Setup Environment

```bash
# Copy environment template (note: .env.example cannot be directly edited, so create .env manually)
cat > .env << 'EOF'
DATABASE_URL=postgresql://tracker_user:tracker_password@localhost:5432/ai_tracker
GITHUB_TOKEN=YOUR_GITHUB_TOKEN_HERE
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_CRON=false
API_RATE_LIMIT=100
EOF
```

**Get a GitHub Token:**
1. Visit https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `read:org`
4. Copy the token and replace `YOUR_GITHUB_TOKEN_HERE` in `.env`

## Step 3: Start Database

```bash
docker-compose up -d
```

Wait 5-10 seconds for PostgreSQL to initialize.

## Step 4: Verify Database

```bash
# Check if container is running
docker ps | grep ai_tracker_db

# Test connection
psql postgresql://tracker_user:tracker_password@localhost:5432/ai_tracker -c "SELECT COUNT(*) FROM projects;"
```

You should see `0` (zero projects initially).

## Step 5: Start the Server

```bash
npm run dev
```

You should see:
```
Server started on port 3000
Database connection: healthy
API available at http://localhost:3000/api/v1
```

## Step 6: Test the API

Open http://localhost:3000/health in your browser or use curl:

```bash
# Health check
curl http://localhost:3000/health

# System stats
curl http://localhost:3000/api/v1/admin/health

# List projects (empty initially)
curl http://localhost:3000/api/v1/projects
```

## Step 6.5: Start the Frontend Dashboard (Optional)

Open a **new terminal** and run:

```bash
cd web
npm run dev
```

The dashboard will start on http://localhost:3001

Open http://localhost:3001 in your browser to see:
- 📊 Interactive project dashboard
- 📈 Star history charts
- 🌓 Dark mode support
- 🔍 Filtering by language and sorting options

## Step 7: Seed Initial Data (Optional)

Populate the database with AI projects from GitHub:

```bash
# In a new terminal
npm run db:seed
```

This will:
- Search GitHub for AI-related repositories
- Create ~20 projects in your database
- Record their initial metrics

Wait for it to complete, then test again:

```bash
curl http://localhost:3000/api/v1/projects?limit=5
```

## Quick Commands Reference

**Backend:**
```bash
# Start backend server
npm run dev

# Start database
docker-compose up -d

# Stop database
docker-compose down

# Seed projects from GitHub
npm run db:seed

# View logs
docker logs ai_tracker_db

# Connect to database
psql $DATABASE_URL

# Run linter
npm run lint

# Build for production
npm run build
```

**Frontend:**
```bash
# Start frontend dashboard (from /web directory)
cd web && npm run dev

# Build frontend for production
cd web && npm run build

# Run production build
cd web && npm start
```

## Common Issues

### "Connection refused" error
- Check if Docker is running: `docker ps`
- Restart database: `docker-compose restart`

### "GitHub API rate limit exceeded"
- Check your token: `echo $GITHUB_TOKEN`
- Verify token has correct scopes
- Wait for rate limit reset (check with `curl http://localhost:3000/api/v1/admin/stats`)

### "Port 3000 already in use"
- Change PORT in `.env` to `3001` or another available port

## What's Next?

- ✅ Your API is running on port 3000
- ✅ Database is connected
- ✅ GitHub integration is working
- ✅ Frontend dashboard is available on port 3001

**Next Steps:**
1. Explore the dashboard at http://localhost:3001
2. Explore the API endpoints (see README.md)
3. Review the codebase structure (see docs/project-structure.md)
4. Implement scheduled jobs for automatic tracking
5. Build additional analytics endpoints

## Need Help?

- Read the full [README.md](README.md)
- Check [docs/](docs/) for detailed documentation
- Review [API Design](docs/api-design.md)
- See [Database Schema](docs/database-schema.md)

Happy tracking! 🚀


