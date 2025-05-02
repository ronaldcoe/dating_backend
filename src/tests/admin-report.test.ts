import request from 'supertest';
import app from '@/server';
import { 
  createTesAdmintUser, 
  createTestModerator,
  createTestUser, 
  generateToken,
  createTestReport
 } from './helpers';

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

    it('should handle params validation', async() => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .get('/api/admin/reports?page=0&limit=101')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    })

    it('should handle invalid sortOrder', async() => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .get('/api/admin/reports?sortOrder=invalid')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
      }
    )

    it('should handle invalid sortBy', async() => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .get('/api/admin/reports?sortBy=invalid')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('should handle invalid status', async() => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .get('/api/admin/reports?status=invalid')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('should handle valid status', async() => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .get('/api/admin/reports?status=PENDING')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      }
    );

    it('should handle all status', async() => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .get('/api/admin/reports?status=all')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      }
    );

    it('should handle valid sortBy', async() => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .get('/api/admin/reports?sortBy=createdAt')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      }
    );
    
    it('should handle valid sortOrder', async() => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .get('/api/admin/reports?sortOrder=asc')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      }
    );
  });

  describe('GET /api/admin/reports/:id', () => {
    it('should allow admins to access report by ID', async () => {
      const admin = await createTesAdmintUser();
      const regularUser = await createTestUser();
      const regularUser2 = await createTestUser();
      const token = generateToken(admin.id);

      const report = await createTestReport({ 
        sourceUserId: regularUser.id, targetUserId: regularUser2.id });

      const response = await request(app)
        .get(`/api/admin/reports/${report.id}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      }
    );

    it('should allow moderators to access report by ID', async () => {
      const moderator = await createTestModerator();
      const token = generateToken(moderator.id);

      const regularUser = await createTestUser();
      const regularUser2 = await createTestUser();
      const report = await createTestReport({ sourceUserId: regularUser.id, targetUserId: regularUser2.id });

      const response = await request(app)
        .get(`/api/admin/reports/${report.id}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should reject regular users with forbidden status', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);

      const response = await request(app)
        .get('/api/admin/reports/1')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/admin/reports/1');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle not found report', async () => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .get('/api/admin/reports/9999')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    }
    );
  })

  describe('PATCH /api/admin/reports/:id', () => {
    it('should allow admins to update report status', async () => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const regularUser = await createTestUser();
      const regularUser2 = await createTestUser();
      const report = await createTestReport({ sourceUserId: regularUser.id, targetUserId: regularUser2.id });

      const response = await request(app)
        .patch(`/api/admin/reports/${report.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'RESOLVED', resolution: 'Report resolved' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should allow moderators to update report status', async () => {
      const moderator = await createTestModerator();
      const token = generateToken(moderator.id);

      const regularUser = await createTestUser();
      const regularUser2 = await createTestUser();
      const report = await createTestReport({ sourceUserId: regularUser.id, targetUserId: regularUser2.id });

      const response = await request(app)
        .patch(`/api/admin/reports/${report.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'RESOLVED', resolution: 'Report resolved' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should reject regular users with forbidden status', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);

      const response = await request(app)
        .patch('/api/admin/reports/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'RESOLVED', resolution: 'Report resolved' });
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .patch('/api/admin/reports/1')
        .send({ status: 'RESOLVED', resolution: 'Report resolved' });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle not found report', async () => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .patch('/api/admin/reports/9999')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'RESOLVED', resolution: 'Report resolved' });
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('should handle invalid report ID', async () => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .patch('/api/admin/reports/invalid')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'RESOLVED', resolution: 'Report resolved' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('should handle invalid status', async () => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const regularUser = await createTestUser();
      const regularUser2 = await createTestUser();
      const report = await createTestReport({ sourceUserId: regularUser.id, targetUserId: regularUser2.id });

      const response = await request(app)
        .patch(`/api/admin/reports/${report.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'INVALID_STATUS', resolution: 'Report resolved' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('should handle missing resolution', async () => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const regularUser = await createTestUser();
      const regularUser2 = await createTestUser();
      const report = await createTestReport({ sourceUserId: regularUser.id, targetUserId: regularUser2.id });

      const response = await request(app)
        .patch(`/api/admin/reports/${report.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'RESOLVED' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('should handle missing status', async () => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const regularUser = await createTestUser();
      const regularUser2 = await createTestUser();
      const report = await createTestReport({ sourceUserId: regularUser.id, targetUserId: regularUser2.id });

      const response = await request(app)
        .patch(`/api/admin/reports/${report.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ resolution: 'Report resolved' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });
  
  })

  describe('GET /api/admin/reports/target/:userId', () => {
    it('should allow admins to access reports by target user ID', async () => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const regularUser = await createTestUser();
      const regularUser2 = await createTestUser();
      const report = await createTestReport({ sourceUserId: regularUser.id, targetUserId: regularUser2.id });

      const response = await request(app)
        .get(`/api/admin/reports/target/${report.targetUserId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    }
    );
    it('should allow moderators to access reports by target user ID', async () => {
      const moderator = await createTestModerator();
      const token = generateToken(moderator.id);

      const regularUser = await createTestUser();
      const regularUser2 = await createTestUser();
      const report = await createTestReport({ sourceUserId: regularUser.id, targetUserId: regularUser2.id });

      const response = await request(app)
        .get(`/api/admin/reports/target/${report.targetUserId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    }
    );

    it('should reject regular users with forbidden status', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);

      const response = await request(app)
        .get('/api/admin/reports/target/1')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/admin/reports/target/1');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle not found report', async () => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const response = await request(app)
        .get('/api/admin/reports/target/9999')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    }
    );
  })

  // get reports by source user ID
  describe('GET /api/admin/reports/source/:userId', () => {
    it('should allow admins to access reports by source user ID', async () => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);

      const regularUser = await createTestUser();
      const regularUser2 = await createTestUser();
      const report = await createTestReport({ sourceUserId: regularUser.id, targetUserId: regularUser2.id });

      const response = await request(app)
        .get(`/api/admin/reports/source/${report.sourceUserId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    }
    );
    it('should allow moderators to access reports by source user ID', async () => {
      const moderator = await createTestModerator();
      const token = generateToken(moderator.id);

      const regularUser = await createTestUser();
      const regularUser2 = await createTestUser();
      const report = await createTestReport({ sourceUserId: regularUser.id, targetUserId: regularUser2.id });

      const response = await request(app)
        .get(`/api/admin/reports/source/${report.sourceUserId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    }
    );

    it('should reject regular users with forbidden status', async () => {
      const user = await createTestUser();
      const token = generateToken(user.id);

      const response = await request(app)
        .get('/api/admin/reports/source/1')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/admin/reports/source/1');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should handle not found report', async () => {
      const admin = await createTesAdmintUser();
      const token = generateToken(admin.id);
      const response = await request(app)
        .get('/api/admin/reports/source/9999')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    }
    );
  })
});