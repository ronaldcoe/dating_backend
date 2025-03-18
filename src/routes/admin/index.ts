import { Router } from 'express';
import { authenticate, authorize } from '@/middlewares/auth';
import { Role } from '@prisma/client';
import userRoutes from './user.routes'
import reportRoutes from './report.routes'
const router = Router();

//get all users
router.use('/users', authenticate, authorize([Role.ADMIN, Role.MODERATOR]), userRoutes);
router.use('/reports', authenticate, authorize([Role.ADMIN, Role.MODERATOR]), reportRoutes);

export default router;