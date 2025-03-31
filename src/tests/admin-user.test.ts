import request from 'supertest';
import app from '@/server';
import { createTesAdmintUser, createTestModerator, createTestUser, generateToken } from './helpers';

describe('Admin API', () => {
  describe('GET /api/admin/users', () => {
    it('should allow admins to access all users', async () => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should allow moderators to access all users', async () => {
      const moderator = await createTestModerator();
      const token = generateToken(moderator.id);

      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should reject regular users with forbidden status', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);

      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/admin/users');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle invalid tokens', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should support pagination', async () => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .get('/api/admin/users?page=1&limit=5')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/admin/users/:id', () => {
    it('shoould allow admins to access a specific user', async () => {
      const admin = await createTesAdmintUser();
      const user = await createTestUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .get(`/api/admin/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(user.id);

    })

    it('should allow moderators to access a specific user', async () => {
      const moderator = await createTestModerator();
      const user = await createTestUser();
      const token = generateToken(moderator.id);

      const response = await request(app)
        .get(`/api/admin/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe(user.id);
    });

    it('should reject regular users with forbidden status', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);

      const response = await request(app)
        .get(`/api/admin/users/${user.id}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    }
    );

    it('should require authentication', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .get(`/api/admin/users/${user.id}`);
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    }
    );

    it('should handle invalid tokens', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .get(`/api/admin/users/${user.id}`)
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    
    })

    it('should return 404 for non-existing user', async () => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .get('/api/admin/users/999999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  
  })
});