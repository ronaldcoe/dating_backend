import { Router } from 'express';
import { AdminUserController } from '@/controllers/admin/user-controller';
import { authenticate, authorize, handleTokenRefresh } from '@/middlewares/auth';
import { Role } from '@prisma/client';
import userRoutes from './user.routes'
const router = Router();

//get all users
router.use('/users', authenticate, authorize([Role.ADMIN]), userRoutes);

export default router;