# Building and Pushing Artifacts to JFrog Fly

This guide explains how to build and push Docker artifacts to your JFrog Fly registry.

## Overview

**JFrog Fly Registry URL:** `https://guyle.jfrog.io`

### Artifacts

This project generates two Docker images:

1. **Backend API** (`ai-tracker-api`)
   - Node.js/TypeScript REST API server
   - Contains controllers, services, and repositories
   - Size: ~162MB
   - Port: 3000

2. **Frontend Web** (`ai-tracker-web`)
   - Next.js 14 web application
   - Server-side rendering with React
   - Size: ~154MB
   - Port: 3000

## Prerequisites

1. **Docker** installed and running (Rancher Desktop or Docker Desktop)
2. **JFrog Fly authentication** configured (done via Fly Desktop App)
3. **npm authentication** for JFrog Fly (automatically configured)

## Building and Pushing

### Manual Build and Push

#### Backend API

```bash
# Build backend image
docker build \
  --secret id=npmrc,src=$HOME/.npmrc \
  -t guyle.jfrog.io/docker/ai-tracker-api:latest \
  -f Dockerfile \
  .

# Push to JFrog Fly
docker push guyle.jfrog.io/docker/ai-tracker-api:latest
```

#### Frontend Web

```bash
# Build frontend image
cd web
docker build \
  --secret id=npmrc,src=$HOME/.npmrc \
  -t guyle.jfrog.io/docker/ai-tracker-web:latest \
  -f Dockerfile \
  .

# Push to JFrog Fly
docker push guyle.jfrog.io/docker/ai-tracker-web:latest
```

### Using the Build Script

A convenience script is provided to build and push all artifacts:

```bash
# Build and push all images
./scripts/build-and-push.sh

# Build and push specific image
./scripts/build-and-push.sh backend
./scripts/build-and-push.sh frontend
```

## Verifying Artifacts

### 1. Check Local Images

```bash
docker images | grep guyle.jfrog.io
```

Expected output:
```
guyle.jfrog.io/docker/ai-tracker-web   latest   c02f2b3d0e75   154MB
guyle.jfrog.io/docker/ai-tracker-api   latest   9d3906eda417   162MB
```

### 2. View in JFrog Fly Web UI

1. Open your browser and go to: **https://guyle.jfrog.io**
2. Log in with your JFrog Fly credentials
3. Navigate to **Artifacts** → **Docker**
4. You should see:
   - `ai-tracker-api:latest`
   - `ai-tracker-web:latest`

### 3. Pull from Registry (Test)

```bash
# Pull backend image
docker pull guyle.jfrog.io/docker/ai-tracker-api:latest

# Pull frontend image
docker pull guyle.jfrog.io/docker/ai-tracker-web:latest
```

## Docker Image Details

### Backend API Image

- **Base Image:** `node:20-alpine`
- **Multi-stage Build:** Yes (builder + production)
- **User:** Non-root user `nodejs` (UID 1001)
- **Health Check:** HTTP GET on `/health`
- **Entry Point:** `node dist/server.js`

**Includes:**
- Compiled JavaScript from TypeScript
- Production npm dependencies only
- Database schema files

### Frontend Web Image

- **Base Image:** `node:20-alpine`
- **Multi-stage Build:** Yes (deps + builder + production)
- **User:** Non-root user `nextjs` (UID 1001)
- **Health Check:** HTTP GET on `/`
- **Entry Point:** `node server.js`
- **Output Mode:** Standalone (optimized for Docker)

**Includes:**
- Next.js standalone build
- Static assets (.next/static)
- Minimal production dependencies

## Image Tags and Versioning

Currently using `latest` tag. For production, consider:

```bash
# Tag with version
docker tag guyle.jfrog.io/docker/ai-tracker-api:latest \
  guyle.jfrog.io/docker/ai-tracker-api:v1.0.0

# Push specific version
docker push guyle.jfrog.io/docker/ai-tracker-api:v1.0.0
```

## Troubleshooting

### Authentication Error

If you see `npm error code E401`:

```bash
# Reconfigure Docker for JFrog Fly
# (This is done automatically by Fly Desktop App)
docker login guyle.jfrog.io
```

### Build Cache Issues

```bash
# Build without cache
docker build --no-cache \
  --secret id=npmrc,src=$HOME/.npmrc \
  -t guyle.jfrog.io/docker/ai-tracker-api:latest \
  .
```

### Push Failures

```bash
# Check Docker is authenticated
docker system info | grep Registry

# Should show: Registry: https://index.docker.io/v1/
# For JFrog Fly, authentication is handled per-registry
```

## CI/CD Integration

Automated builds are handled by GitHub Actions using OIDC for secure, secret-less authentication.

See [.github/workflows/README.md](.github/workflows/README.md) for full documentation on:
- The Build and Release workflow
- Tagging strategies
- OIDC authentication details

The workflow file is located at: `.github/workflows/build-and-release.yml`

## Security Notes

1. **Secrets:** The `.npmrc` file contains authentication tokens and is mounted as a Docker secret during build (not stored in the image)
2. **Non-root Users:** Both images run as non-root users for security
3. **Health Checks:** Both images include health checks for container orchestration
4. **Minimal Images:** Alpine-based images for smaller attack surface

## Next Steps

1. **Set up CI/CD:** Automate builds on push to GitHub
2. **Add versioning:** Tag images with semantic versions
3. **Deploy:** Use Docker Compose or Kubernetes to deploy
4. **Monitor:** Set up container monitoring and logging

## Resources

- **JFrog Fly Documentation:** https://docs.fly.jfrog.ai/
- **JFrog Fly Web UI:** https://guyle.jfrog.io
- **Docker Best Practices:** https://docs.docker.com/develop/dev-best-practices/

