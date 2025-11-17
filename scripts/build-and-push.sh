#!/bin/bash
# Build and push Docker images to JFrog Fly

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# JFrog Fly registry
REGISTRY="guyle.jfrog.io"
BACKEND_IMAGE="${REGISTRY}/docker/ai-tracker-api"
FRONTEND_IMAGE="${REGISTRY}/docker/ai-tracker-web"
TAG="${TAG:-latest}"

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to build backend
build_backend() {
    print_info "Building backend API image..."
    docker build \
        --secret id=npmrc,src=$HOME/.npmrc \
        -t ${BACKEND_IMAGE}:${TAG} \
        -f Dockerfile \
        .
    print_success "Backend image built: ${BACKEND_IMAGE}:${TAG}"
}

# Function to push backend
push_backend() {
    print_info "Pushing backend API image to JFrog Fly..."
    docker push ${BACKEND_IMAGE}:${TAG}
    print_success "Backend image pushed: ${BACKEND_IMAGE}:${TAG}"
}

# Function to build frontend
build_frontend() {
    print_info "Building frontend web image..."
    cd web
    docker build \
        --secret id=npmrc,src=$HOME/.npmrc \
        -t ${FRONTEND_IMAGE}:${TAG} \
        -f Dockerfile \
        .
    cd ..
    print_success "Frontend image built: ${FRONTEND_IMAGE}:${TAG}"
}

# Function to push frontend
push_frontend() {
    print_info "Pushing frontend web image to JFrog Fly..."
    docker push ${FRONTEND_IMAGE}:${TAG}
    print_success "Frontend image pushed: ${FRONTEND_IMAGE}:${TAG}"
}

# Function to show usage
usage() {
    echo "Usage: $0 [backend|frontend|all] [--no-push]"
    echo ""
    echo "Arguments:"
    echo "  backend     Build and push backend API image only"
    echo "  frontend    Build and push frontend web image only"
    echo "  all         Build and push all images (default)"
    echo ""
    echo "Options:"
    echo "  --no-push   Build images but don't push to registry"
    echo ""
    echo "Environment variables:"
    echo "  TAG         Image tag (default: latest)"
    echo ""
    echo "Examples:"
    echo "  $0                    # Build and push all images with 'latest' tag"
    echo "  $0 backend            # Build and push backend only"
    echo "  $0 all --no-push      # Build all images but don't push"
    echo "  TAG=v1.0.0 $0         # Build and push with 'v1.0.0' tag"
}

# Parse arguments
TARGET="${1:-all}"
NO_PUSH=false

if [[ "$2" == "--no-push" ]] || [[ "$1" == "--no-push" ]]; then
    NO_PUSH=true
    print_warning "Push disabled - images will only be built locally"
fi

if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    usage
    exit 0
fi

# Check if .npmrc exists
if [[ ! -f "$HOME/.npmrc" ]]; then
    print_error "Error: $HOME/.npmrc not found"
    print_info "Please configure JFrog Fly authentication first"
    exit 1
fi

# Main execution
print_info "Building Docker images for JFrog Fly"
print_info "Registry: ${REGISTRY}"
print_info "Tag: ${TAG}"
echo ""

case $TARGET in
    backend)
        build_backend
        if [[ "$NO_PUSH" == false ]]; then
            push_backend
        fi
        ;;
    frontend)
        build_frontend
        if [[ "$NO_PUSH" == false ]]; then
            push_frontend
        fi
        ;;
    all)
        build_backend
        build_frontend
        if [[ "$NO_PUSH" == false ]]; then
            push_backend
            push_frontend
        fi
        ;;
    *)
        print_error "Invalid target: $TARGET"
        usage
        exit 1
        ;;
esac

echo ""
print_success "All done!"
echo ""
print_info "View your images:"
echo "  Local:  docker images | grep ${REGISTRY}"
echo "  Web UI: https://${REGISTRY}"

