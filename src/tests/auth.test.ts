import request from 'supertest';
import app from '@/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { UserStatus } from '@prisma/client';
import { createTestUser, generateToken } from './helpers';

describe('Authentication API', () => {
  // Registration Tests
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'password123'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });
    
    it('should not register a user with an existing email', async () => {
      const existingUser = await createTestUser();
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: existingUser.email,
          password: 'password123'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
    
    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User'
          // Missing email and password
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
  
  // Login Tests
  describe('POST /api/auth/login', () => {
    it('should login a user with valid credentials', async () => {
      const password = 'password123';
      const user = await createTestUser({ 
        password: await bcrypt.hash(password, 10) 
      });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: password
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.token).toBeDefined();
    });
    
    it('should not login with invalid credentials', async () => {
      const user = await createTestUser();
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
    
    it('should not login a banned user', async () => {
      const user = await createTestUser({ 
        status: UserStatus.BANNED,
        banReason: 'Violation of terms'
      });
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('banned');
    });
  });
});