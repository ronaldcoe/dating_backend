import request from 'supertest';
import app from '@/server';
import { createTesAdmintUser, createTestModerator, 
  createTestUser, createTestInterest, generateToken } from './helpers';

describe('Interst admin API', () => {
  describe('GET /api/admin/interests', () => {
    it('should return all interests', async () => {
      const adminUser = await createTesAdmintUser();
      const token = generateToken(adminUser.id);
      // Create a test interest
      await createTestInterest({ name: 'Test Interest' });

      const response = await request(app)
        .get('/api/admin/interests')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].name).toBe('Test Interest');
    });

    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app)
        .get('/api/admin/interests');

      expect(response.status).toBe(401);
    });

    it('should return 403 if user is not an admin', async () => {
      const moderatorUser = await createTestModerator();
      const token = generateToken(moderatorUser.id);

      const response = await request(app)
        .get('/api/admin/interests')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
    });

    it('should support pagination', async () => {
      const adminUser = await createTesAdmintUser();
      const token = generateToken(adminUser.id);

      // Create multiple test interests
      for (let i = 0; i < 20; i++) {
        await createTestInterest({ name: `Test Interest ${i}` });
      }

      const response = await request(app)
        .get('/api/admin/interests?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(10);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    })
  })
  describe('POST /api/admin/interests', () => {
    it('should create a new interest', async () => {
      const adminUser = await createTesAdmintUser();

      const token = generateToken(adminUser.id);

      const response = await request(app)
        .post('/api/admin/interests')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Interest' });
      
      console.log(response.body);

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

  describe('PUT /api/admin/interests/:id', () => {
    it('should edit an existing interest', async () => {
      const adminUser = await createTesAdmintUser();
      const token = generateToken(adminUser.id);

      // Create the interest first
      const createResponse = await request(app)
        .post('/api/admin/interests')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Interest to Edit' });

      const interestId = createResponse.body.data.id;

      // Edit the interest
      const response = await request(app)
        .put(`/api/admin/interests/${interestId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Edited Interest' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Edited Interest');
    });

    it('should return 401 if user is not authenticated', async () => {
      const response = await request(app)
        .put('/api/admin/interests/1')
        .send({ name: 'Edited Interest' });

      expect(response.status).toBe(401);
    });

    it('should return 403 if user is not an admin', async () => {
      const moderatorUser = await createTestModerator();
      const token = generateToken(moderatorUser.id);

      const response = await request(app)
        .put('/api/admin/interests/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Edited Interest' });

      expect(response.status).toBe(403);
    });

    it('should return 400 if interest name is missing', async () => {
      const adminUser = await createTesAdmintUser();
      const token = generateToken(adminUser.id);

      // Create the interest first
      const createResponse = await request(app)
        .post('/api/admin/interests')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Interest to Edit' });

      const interestId = createResponse.body.data.id;

      // Try to edit it without a name
      const response = await request(app)
        .put(`/api/admin/interests/${interestId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 if interest does not exist', async () => {
      const adminUser = await createTesAdmintUser();
      const token = generateToken(adminUser.id);

      // Try to edit a non-existing interest
      const response = await request(app)
        .put('/api/admin/interests/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Edited Interest' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 if interest name already exists', async () => {
      const adminUser = await createTesAdmintUser();
      const token = generateToken(adminUser.id);

      // Create two interests
      const createResponse1 = await request(app)
        .post('/api/admin/interests')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Interest 1' });

      const createResponse2 = await request(app)
        .post('/api/admin/interests')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Interest 2' });

      const interestId = createResponse1.body.data.id;

      // Try to edit the first interest to have the same name as the second
      const response = await request(app)
        .put(`/api/admin/interests/${interestId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Interest 2' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  })
})