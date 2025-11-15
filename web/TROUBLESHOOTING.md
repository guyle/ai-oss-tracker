# Frontend Troubleshooting Guide

## Common Issues and Solutions

### "Failed to load projects. Make sure the backend is running on port 3000."

This error means the frontend cannot connect to the backend API. Here's how to fix it:

#### 1. Verify Backend is Running

**Check if backend is running:**
```bash
# In project root directory
curl http://localhost:3000/health
```

Expected response: `{"status":"ok"}`

If you get "Connection refused", the backend is not running.

**Start the backend:**
```bash
# From project root
npm run dev
```

You should see:
```
Server started on port 3000
Database connection: healthy
```

#### 2. Verify Database is Running

```bash
docker ps | grep ai_tracker_db
```

If nothing appears, start the database:
```bash
docker-compose up -d
```

#### 3. Test Backend API Directly

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test projects endpoint
curl http://localhost:3000/api/v1/projects

# Test stats endpoint
curl http://localhost:3000/api/v1/admin/stats
```

#### 4. Check Frontend Dev Server

Make sure you've restarted the frontend after changes:

```bash
# Stop current dev server (Ctrl+C)
# Then restart:
cd web
npm run dev
```

The frontend should start on port 3001.

#### 5. Clear Next.js Cache

If issues persist:

```bash
cd web
rm -rf .next
npm run dev
```

### Port Conflicts

**Backend port 3000 already in use:**
```bash
# Change backend port in .env
PORT=3001
```

Then update `web/next.config.js`:
```javascript
destination: 'http://localhost:3001/api/:path*',
```

**Frontend port 3001 already in use:**
```bash
cd web
PORT=3002 npm run dev
```

### CORS Errors

If you see CORS errors in browser console, the Next.js proxy should handle this automatically. If issues persist, check:

1. Backend is running on port 3000
2. Next.js dev server is running
3. You're accessing frontend at `http://localhost:3001` (not 3000)

### Database Connection Errors

**"Database connection failed":**

```bash
# Check Docker container
docker ps

# View database logs
docker logs ai_tracker_db

# Restart database
docker-compose restart
```

### Environment Variables

**Check frontend environment:**

Create `web/.env.local` if custom API URL needed:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Note: You only need this for server-side rendering. Client-side requests use the proxy.

## Complete Reset

If nothing works, try a complete reset:

```bash
# Stop all services
docker-compose down
# Kill any Node processes on ports 3000-3001

# Clean everything
rm -rf node_modules web/node_modules
rm -rf dist web/.next

# Reinstall
npm install
cd web && npm install && cd ..

# Restart database
docker-compose up -d
# Wait 10 seconds

# Start backend
npm run dev

# In new terminal, start frontend
cd web && npm run dev
```

## Debugging Checklist

- [ ] PostgreSQL container is running: `docker ps`
- [ ] Backend responds to health check: `curl http://localhost:3000/health`
- [ ] Backend API works: `curl http://localhost:3000/api/v1/projects`
- [ ] Frontend dev server is running on port 3001
- [ ] Browser shows frontend at http://localhost:3001
- [ ] Browser console shows no CORS errors
- [ ] Backend logs show incoming requests

## Check Logs

**Backend logs:**
Look at the terminal where you ran `npm run dev`

**Frontend logs:**
Look at the terminal where you ran `cd web && npm run dev`

**Database logs:**
```bash
docker logs ai_tracker_db
```

**Browser console:**
Open DevTools (F12) → Console tab

## Still Having Issues?

1. Check all three services are running (database, backend, frontend)
2. Verify you're accessing the correct URL (http://localhost:3001)
3. Check for any error messages in all three terminal windows
4. Look for TypeScript or build errors in frontend terminal
5. Verify `.env` file exists in project root with correct values

## Quick Test Script

Run this to test your setup:

```bash
#!/bin/bash
echo "Testing AI OSS Tracker Setup..."
echo ""

echo "1. Testing Database..."
docker ps | grep ai_tracker_db && echo "✓ Database running" || echo "✗ Database not running"

echo ""
echo "2. Testing Backend..."
curl -s http://localhost:3000/health > /dev/null && echo "✓ Backend responding" || echo "✗ Backend not responding"

echo ""
echo "3. Testing Backend API..."
curl -s http://localhost:3000/api/v1/projects > /dev/null && echo "✓ API endpoint works" || echo "✗ API endpoint not working"

echo ""
echo "4. Testing Frontend..."
curl -s http://localhost:3001 > /dev/null && echo "✓ Frontend running" || echo "✗ Frontend not running"

echo ""
echo "Done! If all checks pass, open http://localhost:3001 in your browser."
```

Save as `test-setup.sh`, make executable with `chmod +x test-setup.sh`, then run `./test-setup.sh`.

