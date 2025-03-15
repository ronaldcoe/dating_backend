// Environment variables configuration
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Server configuration
export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// JWT configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
export const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN

// Database configuration is handled by Prisma through DATABASE_URL in .env