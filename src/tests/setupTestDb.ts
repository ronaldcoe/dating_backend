import { execSync } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Let's first load the env.test variables
const envTestPath = path.resolve(process.cwd(), '.env.test');
const envConfig = dotenv.config({ path: envTestPath });

if (envConfig.error) {
  console.error('Error loading .env.test file:', envConfig.error);
  process.exit(1);
}

// console.log('Setting up test database...');

try {
  // Construct absolute path to schema.prisma
  const schemaPath = path.resolve(process.cwd(), 'src/prisma/schema.prisma');
  
  // Get the DATABASE_URL from .env.test
  const testDatabaseUrl = process.env.DATABASE_URL;
  
  if (!testDatabaseUrl) {
    throw new Error('DATABASE_URL not found in .env.test');
  }
  
  // Parse the DATABASE_URL to get the database name
  const dbUrl = new URL(testDatabaseUrl);
  const dbName = dbUrl.pathname.substring(1).split('?')[0]; // Remove leading / and query params
  
  // console.log(`Using test database: ${dbName}`);
  
  // Drop and recreate the test database
  execSync(`dropdb -U ronaldcoello --if-exists ${dbName}`, { stdio: 'inherit' });
  execSync(`createdb -U ronaldcoello ${dbName}`, { stdio: 'inherit' });
  
  // Use prisma db push to directly apply the schema to the database
  execSync(`npx prisma db push --schema=${schemaPath} --skip-generate`, {
    stdio: 'inherit',
    env: {
      ...process.env
    }
  });
  
  // Generate Prisma client
  execSync(`npx prisma generate --schema=${schemaPath}`, {
    stdio: 'inherit',
    env: {
      ...process.env
    }
  });
  
  // console.log('Test database setup complete.');
} catch (error) {
  console.error('Error setting up test database:', error);
  process.exit(1);
}