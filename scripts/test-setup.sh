#!/bin/bash

# Test Setup Script
# This script sets up the test environment and database

set -e  # Exit on error

echo "🚀 Setting up test environment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.test exists
if [ ! -f .env.test ]; then
  echo -e "${YELLOW}⚠️  .env.test not found. Creating from .env.test.example...${NC}"
  if [ -f .env.test.example ]; then
    cp .env.test.example .env.test
    echo -e "${GREEN}✅ Created .env.test${NC}"
    echo -e "${YELLOW}⚠️  Please update .env.test with your configuration${NC}"
  else
    echo -e "${RED}❌ .env.test.example not found${NC}"
    exit 1
  fi
fi

# Load test environment
source .env.test

echo "📦 Installing dependencies..."
npm install

echo "🐳 Starting test database..."
docker-compose -f docker-compose.test.yml up -d

echo "⏳ Waiting for database to be ready..."
sleep 5

# Check if database is ready
until docker-compose -f docker-compose.test.yml exec -T postgres-test pg_isready -U test_user; do
  echo "Waiting for database..."
  sleep 2
done

echo -e "${GREEN}✅ Database is ready${NC}"

echo "📊 Initializing database schema..."
psql $DATABASE_URL -f src/db/schema.sql

echo -e "${GREEN}✅ Test setup complete!${NC}"
echo ""
echo "You can now run tests with:"
echo "  npm test              - Run all tests with coverage"
echo "  npm run test:integration - Run integration tests only"
echo "  npm run test:watch    - Run tests in watch mode"
echo ""
echo "To stop the test database:"
echo "  docker-compose -f docker-compose.test.yml down"

