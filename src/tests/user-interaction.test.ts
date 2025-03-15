import request from 'supertest';
import app from '@/server';
import { createTestUser, generateToken } from './helpers';

describe('User Interaction API', () => {
  describe('POST /api/user-interactions/like', () => {
    it('should like a user', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);

      const targetUser = await createTestUser();

      const response = await request(app)
        .post('/api/user-interactions/like')
        .set('Authorization', `Bearer ${token}`)
        .send({ targetUserId: targetUser.id });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User liked');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/user-interactions/like')
        .send({ targetUserId: 1 });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle invalid tokens', async () => {
      const response = await request(app)
        .post('/api/user-interactions/like')
        .set('Authorization', 'Bearer invalidtoken')
        .send({ targetUserId: 1 });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle invalid targetUserId', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);

      const response = await request(app)
        .post('/api/user-interactions/like')
        .set('Authorization', `Bearer ${token}`)
        .send({ targetUserId: 999 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle liking the same user twice', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);

      const targetUser = await createTestUser();

      await request(app)
        .post('/api/user-interactions/like')
        .set('Authorization', `Bearer ${token}`)
        .send({ targetUserId: targetUser.id });

      const response = await request(app)
        .post('/api/user-interactions/like')
        .set('Authorization', `Bearer ${token}`)
        .send({ targetUserId: targetUser.id });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle liking themselves', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);

      const response = await request(app)
        .post('/api/user-interactions/like')
        .set('Authorization', `Bearer ${token}`)
        .send({ targetUserId: user.id });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  })

  describe('POST /api/user-interactions/dislike', () => {
    it('should dislike a user', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);

      const targetUser = await createTestUser();

      const response = await request(app)
        .post('/api/user-interactions/dislike')
        .set('Authorization', `Bearer ${token}`)
        .send({ targetUserId: targetUser.id });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User disliked');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/user-interactions/dislike')
        .send({ targetUserId: 1 });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle invalid tokens', async () => {
      const response = await request(app)
        .post('/api/user-interactions/dislike')
        .set('Authorization', 'Bearer invalidtoken')
        .send({ targetUserId: 1 });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle invalid targetUserId', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);

      const response = await request(app)
        .post('/api/user-interactions/dislike')
        .set('Authorization', `Bearer ${token}`)
        .send({ targetUserId: 999 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should handle disliking the same user twice', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);

      const targetUser = await createTestUser();

      await request(app)
        .post('/api/user-interactions/dislike')
        .set('Authorization', `Bearer ${token}`)
        .send({ targetUserId: targetUser.id });

      const response = await request(app)
        .post('/api/user-interactions/dislike')
        .set('Authorization', `Bearer ${token}`)
        .send({ targetUserId: targetUser.id });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle disliking themselves', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);

      const response = await request(app)
        .post('/api/user-interactions/dislike')
        .set('Authorization', `Bearer ${token}`)
        .send({ targetUserId: user.id });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  })
})