import { Router } from 'express';
import { AdminUserController } from '@/controllers/admin/user-controller';
import { authenticate, authorize, handleTokenRefresh } from '@/middlewares/auth';
import { Role } from '@prisma/client';
const router = Router();

//get all users
router.get('/', authenticate, authorize([Role.ADMIN]), AdminUserController.getAllUsers);

export default router;