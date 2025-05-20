import { Router } from 'express';
import { AdminUserController } from '@/controllers/admin/user-controller';
import { authenticate, authorize, handleTokenRefresh } from '@/middlewares/auth';
import { paginationMiddleware } from '@/middlewares/pagination.middleware';
import { Role } from '@prisma/client';
const router = Router();

const validSortBy = ['createdAt', 'updatedAt', 'name', 'email'];
//get all users
router.get('/', paginationMiddleware({validateSortBy:validSortBy}), AdminUserController.getAllUsers);
//get user by id
router.get('/:id', AdminUserController.getUserById);

//ban user
router.put('/ban/:id', AdminUserController.banUser);

//lock user
router.put('/lock/:id', AdminUserController.lockUser);

export default router;