import request from 'supertest';
import app from '@/server';
import { createTesAdmintUser, createTestUser, generateToken } from './helpers';

describe('Admin API', ()=> {
  describe('GET /api/admin/users', () => {
    it('should return all users', async () => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/admin/users')
      
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })

    it('should require admin role', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);

      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
    })

    it('should handle invalid tokens', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer invalidtoken')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })
  })
})
