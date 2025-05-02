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

  describe('PUT /api/admin/users/ban/:id', () => {
    it('should allow admins to ban a user', async () => {
      const admin = await createTesAdmintUser();
      const user = await createTestUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .put(`/api/admin/users/ban/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ banReason: 'Inappropriate behavior' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User banned successfully');
    });

    it('should allow moderators to ban a user', async () => {
      const moderator = await createTestModerator();
      const user = await createTestUser();
      const token = generateToken(moderator.id);

      const response = await request(app)
        .put(`/api/admin/users/ban/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ banReason: 'Inappropriate behavior' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User banned successfully');
    });

    it('should reject regular users with forbidden status', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);

      const response = await request(app)
        .put(`/api/admin/users/ban/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ banReason: 'Inappropriate behavior' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .put(`/api/admin/users/ban/${user.id}`)
        .send({ banReason: 'Inappropriate behavior' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle invalid tokens', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .put(`/api/admin/users/ban/${user.id}`)
        .set('Authorization', 'Bearer invalidtoken')
        .send({ banReason: 'Inappropriate behavior' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing ban reason', async () => {
      const admin = await createTesAdmintUser();
      const user = await createTestUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .put(`/api/admin/users/ban/${user.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Ban reason is required');
    });

    it('should return 400 for invalid ban reason', async () => {
      const admin = await createTesAdmintUser();
      const user = await createTestUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .put(`/api/admin/users/ban/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ banReason: 'Bad' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("\"banReason\" length must be at least 8 characters long");
    });

    it('should return 400 for self-banning', async () => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .put(`/api/admin/users/ban/${admin.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ banReason: 'Inappropriate behavior' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('You cannot ban yourself');
    });

  })

  describe('PUT /api/admin/users/lock/:id', () => {
    it('should allow admins to lock a user', async () => {
      const admin = await createTesAdmintUser();
      const user = await createTestUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .put(`/api/admin/users/lock/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ lockReason: 'Inappropriate behavior' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User locked successfully');
    });

    it('should allow moderators to lock a user', async () => {
      const moderator = await createTestModerator();
      const user = await createTestUser();
      const token = generateToken(moderator.id);

      const response = await request(app)
        .put(`/api/admin/users/lock/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ lockReason: 'Inappropriate behavior' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User locked successfully');
    });

    it('should reject regular users with forbidden status', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);

      const response = await request(app)
        .put(`/api/admin/users/lock/${user.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ lockReason: 'Inappropriate behavior' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .put(`/api/admin/users/lock/${user.id}`)
        .send({ lockReason: 'Inappropriate behavior' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle invalid tokens', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .put(`/api/admin/users/lock/${user.id}`)
        .set('Authorization', 'Bearer invalidtoken')
        .send({ lockReason: 'Inappropriate behavior' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);

    })
  });
});