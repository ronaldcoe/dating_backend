import { Router } from 'express';
import { SwipeQueueController } from '@/controllers/swipe-queue.controller';
import { authenticate } from '@/middlewares/auth';

const router = Router();

router.get('/', authenticate, SwipeQueueController.getSwipeQueue);

export default router;