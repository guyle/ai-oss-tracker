// Environment variable validation and configuration
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface EnvConfig {
  // Database
  DATABASE_URL: string;

  // GitHub API
  GITHUB_TOKEN: string;
  GITHUB_API_BASE_URL: string;

  // Server
  PORT: number;
  NODE_ENV: string;

  // Scheduler
  ENABLE_CRON: boolean;
  METRICS_UPDATE_INTERVAL: string;
  TRENDING_SYNC_INTERVAL: string;
  ALERTS_CHECK_INTERVAL: string;

  // Logging
  LOG_LEVEL: string;

  // Rate Limiting
  API_RATE_LIMIT: number;
}

function validateEnv(): EnvConfig {
  const requiredVars = ['DATABASE_URL', 'GITHUB_TOKEN'];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      throw new Error(`Missing required environment variable: ${varName}`);
    }
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN!,
    GITHUB_API_BASE_URL: process.env.GITHUB_API_BASE_URL || 'https://api.github.com',
    PORT: parseInt(process.env.PORT || '3000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    ENABLE_CRON: process.env.ENABLE_CRON === 'true',
    METRICS_UPDATE_INTERVAL: process.env.METRICS_UPDATE_INTERVAL || '*/15 * * * *',
    TRENDING_SYNC_INTERVAL: process.env.TRENDING_SYNC_INTERVAL || '0 0 * * *',
    ALERTS_CHECK_INTERVAL: process.env.ALERTS_CHECK_INTERVAL || '0 * * * *',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    API_RATE_LIMIT: parseInt(process.env.API_RATE_LIMIT || '100', 10),
  };
}

export const env = validateEnv();

export default env;

