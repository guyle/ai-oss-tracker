#!/bin/bash

# Test Teardown Script
# This script cleans up the test environment

set -e  # Exit on error

echo "🧹 Cleaning up test environment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Stop test database
echo "🛑 Stopping test database..."
docker-compose -f docker-compose.test.yml down -v

echo -e "${GREEN}✅ Test database stopped and removed${NC}"

# Optional: Remove coverage directory
if [ "$1" == "--clean-coverage" ]; then
  echo "🗑️  Removing coverage directory..."
  rm -rf coverage
  echo -e "${GREEN}✅ Coverage directory removed${NC}"
fi

echo -e "${GREEN}✅ Cleanup complete!${NC}"

