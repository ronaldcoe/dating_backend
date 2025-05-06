import request from 'supertest';
import app from '@/server';
import { db } from '@/lib/db';
import { createTestUser, generateToken } from './helpers';
import { PhotoStatus } from '@prisma/client';
import { createMinimalTestImage } from './test-image';

describe('Photo Moderation API', () => {
  let regularUser;
  let adminUser;
  let adminToken;
  let testPhoto;

  beforeAll(async () => {
    // Clean up before tests
    await db.photo.deleteMany();
    await db.user.deleteMany({ where: { email: { contains: 'test' } } });
    
    // Create a regular test user
    regularUser = await createTestUser();
    
    // Create an admin user
    adminUser = await createTestUser({
      email: 'test-admin@example.com',
      role: 'ADMIN'
    });
    
    adminToken = generateToken(adminUser.id);

    // Create a test photo for the regular user
    testPhoto = await db.photo.create({
      data: {
        userId: regularUser.id,
        originalUrl: 'https://example.com/original.jpg',
        standardUrl: 'https://example.com/standard.jpg',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        position: 1,
        isPrimary: false,
        status: PhotoStatus.PENDING
      }
    });
  });

  afterAll(async () => {
    try {
      // Clean up after tests
      await db.photo.deleteMany();
      await db.user.deleteMany({ where: { email: { contains: 'test' } } });
    } catch (error) {
      console.log('Cleanup error:', error);
    }
  });

  it('should reject a photo successfully', async () => {
    const response = await request(app)
      .patch(`/api/admin/photos/${testPhoto.id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        moderationMessage: 'Inappropriate content'
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.status).toBe(PhotoStatus.REJECTED);
    expect(response.body.data.moderationMessage).toBe('Inappropriate content');
    expect(response.body.data.moderationUserId).toBe(adminUser.id);
    expect(response.body.data.moderatedAt).toBeDefined();
  });

  it('should not allow non-admin users to reject photos', async () => {
    // Create a new photo for testing
    const newPhoto = await db.photo.create({
      data: {
        userId: regularUser.id,
        originalUrl: 'https://example.com/original2.jpg',
        standardUrl: 'https://example.com/standard2.jpg',
        thumbnailUrl: 'https://example.com/thumbnail2.jpg',
        position: 2,
        isPrimary: false,
        status: PhotoStatus.PENDING
      }
    });

    // Generate token for regular user
    const regularToken = generateToken(regularUser.id);

    const response = await request(app)
      .patch(`/api/admin/photos/${newPhoto.id}/reject`)
      .set('Authorization', `Bearer ${regularToken}`)
      .send({
        moderationMessage: 'Inappropriate content'
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Not authorized');
  });

  it('should not allow rejecting without authentication', async () => {
    const response = await request(app)
      .patch(`/api/admin/photos/${testPhoto.id}/reject`)
      .send({
        moderationMessage: 'Inappropriate content'
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should handle non-existent photo', async () => {
    const nonExistentId = 999999;
    
    const response = await request(app)
      .patch(`/api/admin/photos/${nonExistentId}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        moderationMessage: 'Inappropriate content'
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('not found');
  });

  it('should require a moderation message', async () => {
    const response = await request(app)
      .patch(`/api/admin/photos/${testPhoto.id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('moderationMessage is required');
  });

  it('should verify the photo status is updated in the database', async () => {
    // Create a new photo for this specific test
    const newPhoto = await db.photo.create({
      data: {
        userId: regularUser.id,
        originalUrl: 'https://example.com/original3.jpg',
        standardUrl: 'https://example.com/standard3.jpg',
        thumbnailUrl: 'https://example.com/thumbnail3.jpg',
        position: 3,
        isPrimary: false,
        status: PhotoStatus.PENDING
      }
    });

    // Reject the photo
    await request(app)
      .patch(`/api/admin/photos/${newPhoto.id}/reject`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        moderationMessage: 'Inappropriate content'
      });

    // Verify the status is updated in the database
    const updatedPhoto = await db.photo.findUnique({
      where: { id: newPhoto.id }
    });

    expect(updatedPhoto).not.toBeNull();
    expect(updatedPhoto.status).toBe(PhotoStatus.REJECTED);
    expect(updatedPhoto.moderationMessage).toBe('Inappropriate content');
    expect(updatedPhoto.moderationUserId).toBe(adminUser.id);
    expect(updatedPhoto.moderatedAt).toBeDefined();
  });
});