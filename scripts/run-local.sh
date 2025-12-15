#!/bin/bash
# Run the full stack locally with Docker Compose

set -e

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_info() { echo -e "${BLUE}ℹ ${NC}$1"; }
print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }

# Load .env file if it exists and GITHUB_TOKEN not already set
if [ -z "$GITHUB_TOKEN" ] && [ -f "$PROJECT_ROOT/.env" ]; then
    # Extract GITHUB_TOKEN from .env file
    GITHUB_TOKEN=$(grep -E '^GITHUB_TOKEN=' "$PROJECT_ROOT/.env" | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    if [ -n "$GITHUB_TOKEN" ]; then
        export GITHUB_TOKEN
        print_success "Loaded GITHUB_TOKEN from .env file"
    fi
fi

# Check for ~/.npmrc (required for JFrog Fly)
if [ ! -f "$HOME/.npmrc" ]; then
    print_error "~/.npmrc not found. JFrog Fly authentication required."
    print_info "Configure JFrog Fly first (via Fly Desktop App or 'fly configure')"
    exit 1
fi

# Check for GITHUB_TOKEN
if [ -z "$GITHUB_TOKEN" ]; then
    print_warning "GITHUB_TOKEN not set. Some features may not work."
    print_info "Set it in .env file or: export GITHUB_TOKEN=your_token_here"
    echo ""
fi

# Parse arguments
BUILD_FLAG=""
COMPOSE_FILE="docker-compose.local.yml"

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --build|-b) BUILD_FLAG="--build" ;;
        --down|-d) 
            print_info "Stopping all services..."
            docker compose -f "$PROJECT_ROOT/docker-compose.local.yml" down
            print_success "Services stopped"
            exit 0
            ;;
        --help|-h)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --build, -b     Force rebuild of images"
            echo "  --down, -d      Stop all services"
            echo "  --help, -h      Show this help"
            echo ""
            echo "Prerequisites:"
            echo "  - JFrog Fly configured (~/.npmrc with auth token)"
            echo "  - GITHUB_TOKEN set in .env or exported"
            exit 0
            ;;
        *) print_error "Unknown option: $1"; exit 1 ;;
    esac
    shift
done

print_info "Starting AI OSS Tracker locally..."
print_info "Using compose file: ${COMPOSE_FILE}"
echo ""

# Run docker compose from project root
cd "$PROJECT_ROOT"
docker compose -f "$COMPOSE_FILE" up $BUILD_FLAG


