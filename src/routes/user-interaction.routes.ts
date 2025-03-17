import { Router } from 'express';
import { UserInteractionController } from '@/controllers/user-interaction.controller';
import { authenticate } from '@/middlewares/auth';

const router = Router();

router.post('/like', authenticate, UserInteractionController.likeUser);
router.post('/dislike', authenticate, UserInteractionController.dislikeUser);
router.post('/block', authenticate, UserInteractionController.blockUser);
router.delete('/unblock', authenticate, UserInteractionController.unblockUser);

export default router;
