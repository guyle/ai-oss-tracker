// Express app test helper
import { Application } from 'express';
import app from '@/app';

/**
 * Get Express app instance for testing
 * This ensures each test gets a fresh app instance if needed
 */
export function getTestApp(): Application {
  return app;
}

/**
 * Create a mock request object for testing
 */
export function createMockRequest(overrides: any = {}) {
  return {
    params: {},
    query: {},
    body: {},
    headers: {},
    ...overrides,
  };
}

/**
 * Create a mock response object for testing
 */
export function createMockResponse() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
}

/**
 * Create a mock next function for testing
 */
export function createMockNext() {
  return jest.fn();
}

