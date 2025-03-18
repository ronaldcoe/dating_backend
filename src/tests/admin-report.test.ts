import request from 'supertest';
import app from '@/server';
import { createTesAdmintUser, createTestModerator, createTestUser, generateToken } from './helpers';

describe('Admin Reports API', () => {
  describe('GET /api/admin/reports', () => {
    it('should allow admins to access reports', async () => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should allow moderators to access reports', async () => {
      const moderator = await createTestModerator();
      const token = generateToken(moderator.id);

      const response = await request(app)
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should reject regular users with forbidden status', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);

      const response = await request(app)
        .get('/api/admin/reports')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/admin/reports');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle invalid tokens', async () => {
      const response = await request(app)
        .get('/api/admin/reports')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should support pagination', async () => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .get('/api/admin/reports?page=1&limit=5')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });
});