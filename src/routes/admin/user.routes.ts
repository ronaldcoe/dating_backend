import { Router } from 'express';
import { AdminUserController } from '@/controllers/admin/user-controller';
import { authenticate, authorize, handleTokenRefresh } from '@/middlewares/auth';
import { Role } from '@prisma/client';
const router = Router();

//get all users
router.get('/', AdminUserController.getAllUsers);
//get user by id
router.get('/:id', AdminUserController.getUserById);

//ban user
router.put('/ban/:id', AdminUserController.banUser);

export default router;