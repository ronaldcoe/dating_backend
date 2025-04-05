import request from 'supertest';
import app from '@/server';
import { createTestUser, generateToken } from './helpers';

describe('User Preference API', () => {
  describe('GET /api/user-preferences', () => {
    it('should return user preferences', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);

      const response = await request(app)
        .get('/api/user-preferences')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app).get('/api/user-preferences');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

  })

  describe('PATCH /api/user-preferences', () => {
    it('should update user preferences', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);
      
      const newPreferences = {
        minAge: 18,
        maxAge: 30,
      }
      
      const response = await request(app)
        .patch('/api/user-preferences')
        .set('Authorization', `Bearer ${token}`)
        .send(newPreferences);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();

    })

    it('should return 401 if not authenticated', async () => {
      const response = await request(app).patch('/api/user-preferences');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 if invalid data is provided', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);
      
      const invalidPreferences = {
        minAge: 'invalid',
        maxAge: 30,
      }
      
      const response = await request(app)
        .patch('/api/user-preferences')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidPreferences);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    })

    it('should return 400 if minAge is less than 18', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);
      
      const invalidPreferences = {
        minAge: 17,
        maxAge: 30,
      }
      
      const response = await request(app)
        .patch('/api/user-preferences')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidPreferences);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Minimum age must be at least 18');
    })
  })
})