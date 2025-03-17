import request from 'supertest';
import app from '@/server';
import { createTestUser, generateToken } from './helpers';


describe('Report API', () => {
  
  describe('POST /api/report/new', () => {
    it('should cerate a new report', async() =>{
      const user = await createTestUser()
      const token = await generateToken(user.id)

      const targetUser = await createTestUser()

      const response = await request(app)
        .post('/api/reports/new')
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetUserId: targetUser.id,
          reason: 'spam'
        })
        
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    it('should required auth', async() =>{
      const response = await request(app)
        .post('/api/reports/new')
        .send({
          targetUserId: 1,
          reason: 'spam'
        })
        
      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)

    })

    it('should required targetUserId', async() =>{
      const user = await createTestUser()
      const token = await generateToken(user.id)

      const response = await request(app)
        .post('/api/reports/new')
        .set('Authorization', `Bearer ${token}`)
        .send({
          reason: 'spam'
        })
        
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    it('should not report non existent user', async() =>{
      const user = await createTestUser()
      const token = await generateToken(user.id)

      const response = await request(app)
        .post('/api/reports/new')
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetUserId: 999,
          reason: 'spam'
        })
      
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      
    })

    it('should required reason', async() =>{
      const user = await createTestUser()
      const token = await generateToken(user.id)

      const targetUser = await createTestUser()

      const response = await request(app)
        .post('/api/reports/new')
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetUserId: targetUser.id
        })
        
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    it('should not report self', async() =>{
      const user = await createTestUser()
      const token = await generateToken(user.id)

      const response = await request(app)
        .post('/api/reports/new')
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetUserId: user.id,
          reason: 'spam'
        })
        
      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
    
  })
});