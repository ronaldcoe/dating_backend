import { db } from '../lib/db';
import { Role, UserStatus, ReportReason } from '@prisma/client';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../server';
import { JWT_SECRET } from '../config';
import jwt from 'jsonwebtoken';

// Create test user with or without custom data
export const createTestUser = async (customData = {}) => {
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  const userData = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: hashedPassword,
    role: Role.USER,
    status: UserStatus.ACTIVE,
    ...customData
  };
  
  return db.user.create({
    data: userData
  });
};

// Generate token for a user
export const generateToken = (userId: number) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
};

// Login and get auth token
export const loginUser = async (email: string, password: string) => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  
  return response.body.data?.token;
};

// Create test admin user
export const createTesAdmintUser = async (customData = {}) => {
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  const userData = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: hashedPassword,
    role: Role.ADMIN,
    status: UserStatus.ACTIVE,
    ...customData
  };
  
  return db.user.create({
    data: userData
  });
};

// Create test moderator user
export const createTestModerator = async (customData = {}) => {
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  const userData = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: hashedPassword,
    role: Role.MODERATOR,
    status: UserStatus.ACTIVE,
    ...customData
  };
  
  return db.user.create({
    data: userData
  });
}

// crreate test report
export const createTestReport = async (customData = {}) => {
  const reportData = {
    sourceUserId: 1,
    targetUserId: 2,
    reason: ReportReason.INAPPROPRIATE_CONTENT,
    ...customData
  };
  
  return db.report.create({
    data: reportData
  });
}

// Create test interest
export const createTestInterest = async (customData = {}) => {
  const interestData = {
    name: `Test Interest ${Date.now()}`,
    ...customData
  };
  
  return db.interest.create({
    data: interestData
  });
}