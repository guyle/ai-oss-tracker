# GitHub Actions Workflows

## Build and Release Workflow

The `build-and-release.yml` workflow automatically builds and pushes Docker images to JFrog Fly.

### Authentication (OIDC)

This workflow uses **OIDC (OpenID Connect)** authentication provided by `jfrog/fly-action`.

**✅ NO SECRETS REQUIRED**: You do NOT need to configure `FLY_USERNAME`, `FLY_PASSWORD`, or `FLY_NPM_TOKEN` in your repository secrets. The workflow authenticates automatically using the GitHub Actions OIDC token.

### Triggers

- Code is pushed to the `main` branch
- Tags matching `v*` are created (e.g., `v1.0.0`)
- Pull requests are opened (builds only, no push)
- Manual workflow dispatch is triggered

### Image Tags

The workflow automatically creates multiple tags for each image:

- **Branch tags**: `main`, `feature-branch`, etc.
- **PR tags**: `pr-123`
- **Semantic version tags**: `v1.0.0`, `v1.0`, `v1` (from git tags)
- **SHA tags**: `main-abc1234` (branch-SHA)
- **Latest tag**: `latest` (only for main branch)
- **Custom tags**: From manual workflow dispatch input

### Artifacts Built

1. **Backend API**: `guyle.jfrog.io/docker/ai-tracker-api`
2. **Frontend Web**: `guyle.jfrog.io/docker/ai-tracker-web`

### Viewing Build Results

After a successful workflow run:

1. Check the workflow summary in the GitHub Actions tab
2. View images in JFrog Fly: https://guyle.jfrog.io
3. Navigate to Artifacts → Docker to see published images
