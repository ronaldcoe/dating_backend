import { Router } from 'express';
import { UserInteractionController } from '@/controllers/user-interaction.controller';
import { authenticate } from '@/middlewares/auth';

const router = Router();

router.post('/like', authenticate, UserInteractionController.likeUser);

export default router;
