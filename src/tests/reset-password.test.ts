import request from 'supertest';
import app from '@/server';
import { db } from '@/lib/db';
import { createTestUser } from './helpers';
import { ResetPasswordService } from '@/services/reset-password.service';

describe('Rest Password API', () => {
  describe('POST api/reset-password', () => {
    it('should create a password reset token', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .post('/api/reset-password')
        .send({ email: user.email });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    })

    it('should return an error if email is not provided', async () => {
      const response = await request(app)
        .post('/api/reset-password')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    })

    it('should return an error if email is not found', async () => {
      const response = await request(app)
        .post('/api/reset-password')
        .send({ email: '000000@x.com' });
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    })

    // verify reset token
    describe('GET api/reset-password/verify', () => {
      it('should verify a password reset token', async () => {
        const user = await createTestUser();
        const token = await ResetPasswordService.createResetPasswordToken(user.email);

        const response = await request(app)
          .get(`/api/reset-password/verify?token=${token}`);
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.email).toBe(user.email);
      })

      it('should return an error if token is not provided', async () => {
        const response = await request(app)
          .get('/api/reset-password/verify');
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      })

      it('should return an error if token is invalid', async () => {
        const response = await request(app)
          .get('/api/reset-password/verify?token=123456');
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      })
      
      // Veridy expired token
      it('should return an error if token is expired', async () => {
        const user = await createTestUser();
        const token = await ResetPasswordService.createResetPasswordToken(user.email);
        await db.resetPasswordToken.update({
          where: { email: user.email },
          data: { expiresAt: new Date() }
        });

        const response = await request(app)
          .get(`/api/reset-password/verify?token=${token}`);
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      })
    })

    // reset password
    describe('POST api/reset-password/reset', () => {
      it('should reset user password', async () => {
        const user = await createTestUser();
        const token = await ResetPasswordService.createResetPasswordToken(user.email);
        const password = 'newpassword';

        const response = await request(app)
          .post('/api/reset-password/reset')
          .send({ token, password });
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      })

      it('should return an error if token and password are not provided', async () => {
        const response = await request(app)
          .post('/api/reset-password/reset')
          .send({});
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      })

      it('should return an error if token is invalid', async () => {
        const response = await request(app)
          .post('/api/reset-password/reset')
          .send({ token: '123456', password: 'newpassword' });
        
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
      })
    })
  })
})


