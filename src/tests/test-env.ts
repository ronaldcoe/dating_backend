import dotenv from 'dotenv';
import path from 'path';

// Try to load test-specific environment variables first
const testEnvPath = path.resolve(__dirname, '../../.env.test');
const mainEnvPath = path.resolve(__dirname, '../../.env');

// Load test env first, then fall back to main .env if needed
dotenv.config({ path: testEnvPath });
dotenv.config({ path: mainEnvPath, override: false });

// Add any test-specific environment variables
process.env.NODE_ENV = 'test';

// Ensure DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined. Tests require a database connection.');
  process.exit(1);
}