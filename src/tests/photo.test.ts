import request from 'supertest';
import app from '@/server';
import { db } from '@/lib/db';
import { createTestUser, generateToken } from './helpers';
import path from 'path';
import { PhotoStatus } from '@prisma/client';
import { createMinimalTestImage } from './test-image';
import fs from 'fs';

// Mock AWS S3 to prevent actual uploads during tests
jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockResolvedValue({})
    })),
    PutObjectCommand: jest.fn()
  };
});

describe('Photo Upload API', () => {
  let user;
  let token;

  beforeAll(async () => {
    // Clean up before tests
    await db.photo.deleteMany();
    await db.user.deleteMany({ where: { email: { contains: 'test' } } });
    
    // Create a fresh test user
    user = await createTestUser();
    token = generateToken(user.id);

    // console.log('Test Setup:', {
    //   userId: user.id,
    //   userEmail: user.email,
    //   token: token ? 'Token generated' : 'No token'
    // });
  });

  afterAll(async () => {
    try {
      // Clean up after tests
      await db.photo.deleteMany({ where: { userId: user.id } });
      
      // Check if user exists before trying to delete
      const userExists = await db.user.findUnique({ where: { id: user.id } });
      if (userExists) {
        await db.user.delete({ where: { id: user.id } });
      }
    } catch (error) {
      console.log('Cleanup error:', error);
    }
  });

  it('should upload a photo successfully', async () => {
    const response = await request(app)
      .post('/api/users/photos')
      .set('Authorization', `Bearer ${token}`)
      .field('userId', user.id)
      .attach('image', createMinimalTestImage(), 'test.jpg');
  
    // console.log("Response details:", {
    //   status: response.status,
    //   body: response.body,
    //   headers: response.headers
    // });
  
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });

  it('should not allow an upload without authentication', async () => {
    const response = await request(app)
      .post('/api/users/photos')
      .attach('image', Buffer.from('test image data'), 'test.jpg');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should return an error if no file is provided', async () => {
    const response = await request(app)
      .post('/api/users/photos')
      .set('Authorization', `Bearer ${token}`)
      .field('dummy', 'value'); // Send a field but no file

      // console.log('Response received:', {
      //   status: response.status,
      //   body: response.body
      // });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('No file provided');
  });

  it('should reject non-image files', async () => {
    const response = await request(app)
      .post('/api/users/photos')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('test data'), 'test.txt');

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Something went wrong');
  });

  it('should not allow more than 40 photos per user', async () => {
    // First, verify user exists
    const testUser = await db.user.findUnique({ where: { id: user.id } });
    expect(testUser).not.toBeNull();
    
    try {
      // Create 40 photos with proper field names
      const photoData = Array.from({ length: 40 }).map((_, i) => ({
        user: {
          connect: {
            id: user.id
          }
        },
        originalUrl: `https://example.com/photo-${i}.jpg`,
        standardUrl: `https://example.com/photo-std-${i}.jpg`,
        thumbnailUrl: `https://example.com/photo-thumb-${i}.jpg`,
        position: i + 1,
        isPrimary: i === 0,
        status: PhotoStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      // Use individual creates instead of createMany
      for (const data of photoData) {
        await db.photo.create({ data });
      }
      
      const response = await request(app)
        .post('/api/users/photos')
        .set('Authorization', `Bearer ${token}`)
        .attach('image', Buffer.from('test image data'), 'test.jpg');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Maximum of 40 photos allowed per user');
    } catch (error) {
      console.error('Error in max photos test:', error);
      throw error;
    }
  });
});