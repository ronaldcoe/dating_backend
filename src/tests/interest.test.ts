import request from 'supertest';
import app from '@/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { UserStatus } from '@prisma/client';
import { createTestUser, generateToken } from './helpers';

describe('Interest API', () => {
  // Registration Tests
  describe('POST /api/users/interest', () => {
    it('should return all interests', async() =>{
      const user = await createTestUser()
      const token = await generateToken(user.id)

      const response = await request(app)
        .get('/api/users/interests')
        .set('Authorization', `Bearer ${token}`)
        
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toBeDefined()
    })
    
  })

  describe('POST /api/users/interest', () => {
    it('should required auth', async() =>{

      const response = await request(app)
        .get('/api/users/interests')
        
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })
    
  })
});