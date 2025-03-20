import request from 'supertest';
import app from '@/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { UserStatus } from '@prisma/client';
import { createTestUser, generateToken } from './helpers';
import jwt from 'jsonwebtoken';

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

  // verify token
  describe('GET /api/auth/verify-token', () => {
    it('should verify a valid token', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);
      
      const response = await request(app)
        .get('/api/auth/verify-token')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    it('should not verify an invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify-token')
        .set('Authorization', `Bearer invalidtoken`);
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return a new token if refresh token is provided', async () => {
      // Create a test user
      const user = await createTestUser();
      
      // Generate an expired token (setting expiration to the past)
      const expiredToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-10s' } // Token expired 10 seconds ago
      );
      
      // Create a valid refresh token in the database
      const refreshToken = await db.refreshToken.create({
        data: {
          token: jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'test-secret',
            { expiresIn: '7d' }
          ),
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          revoked: false
        }
      });
      
      // Set up the request with the expired token and refresh token
      const response = await request(app)
        .get('/api/auth/verify-token')
        .set('Authorization', `Bearer ${expiredToken}`)
        .set('x-refresh-token', refreshToken.token);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined(); // New token should be in the response
      
      // Optional: Verify the new token is valid
      const decodedToken = jwt.verify(
        response.body.token,
        process.env.JWT_SECRET || 'test-secret'
      ) as { userId: number };
      expect(decodedToken.userId).toBe(user.id);
      
      // Optional: Check response headers for the token
      expect(response.headers['x-new-access-token']).toBeDefined();
    });
  })
});