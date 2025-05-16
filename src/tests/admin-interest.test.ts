import request from 'supertest';
import app from '@/server';
import { createTesAdmintUser, createTestModerator, createTestUser, generateToken } from './helpers';

describe('Interst admin API', () => {
  describe('POST /api/admin/interests', () => {
    it('should create a new interest', async () => {
      const adminUser = await createTesAdmintUser();

      const token = generateToken(adminUser.id);

      const response = await request(app)
        .post('/api/admin/interests')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Interest' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Interest');
    });

    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app)
        .post('/api/admin/interests')
        .send({ name: 'New Interest' });

      expect(response.status).toBe(401);
    });

    it('should return 403 if user is not an admin', async () => {
      const moderatorUser = await createTestModerator();
      const token = generateToken(moderatorUser.id);

      const response = await request(app)
        .post('/api/admin/interests')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Interest' });

      expect(response.status).toBe(403);
    });

    it('should return 400 if interest name is missing', async () => {
      const adminUser = await createTesAdmintUser();
      const token = generateToken(adminUser.id);

      const response = await request(app)
        .post('/api/admin/interests')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 if interest already exists', async () => {
      const adminUser = await createTesAdmintUser();
      const token = generateToken(adminUser.id);

      // Create the interest first
      await request(app)
        .post('/api/admin/interests')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Existing Interest' });

      // Try to create it again
      const response = await request(app)
        .post('/api/admin/interests')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Existing Interest' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  })
})