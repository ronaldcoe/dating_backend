import request from 'supertest';
import app from '@/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { UserStatus } from '@prisma/client';
import { createTestUser, generateToken } from './helpers';

describe('Users API', ()=> {
  describe('GET /api/users/me', () => {
    it('should return the current user profile', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true)
      expect(response.body.data.user.id).toBe(user.id)
      expect(response.body.data.isProfileComplete).toBeDefined()
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/users/me')
      
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })

    it('should handle invalid tokens', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalidtoken')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })
  })

  // Profile Update Tests
  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);
      
      const profileData = {
        bio: 'This is my test bio',
        birthDate: '1990-01-15',
        gender: 'MALE',
        locationLat: 37.7749,
        locationLng: -122.4194
      };
      
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(profileData);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.bio).toBe(profileData.bio);
      expect(response.body.data.isProfileComplete).toBe(true);
      
      // Verify database was updated
      const updatedUser = await db.user.findUnique({
        where: { id: user.id }
      });
      
      expect(updatedUser?.bio).toBe(profileData.bio);
    });
    
    it('should validate profile data', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);
      
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          locationLat: 200, // Invalid latitude (over 90)
          gender: 'INVALID' // Not a valid gender
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
    
    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .send({
          bio: 'Test bio'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
})