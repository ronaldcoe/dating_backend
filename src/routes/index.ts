import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes'
import photoRoutes from './photo.routes'
import resetPasswordRoutes from './reset-password.routes'
import adminRoutes from './admin'
import userInteractionRoutes from './user-interaction.routes';
import reportRoutes from './report.routes';
import userPreferenceRoutes from './user-preference.routes';
import swipeQueueRoutes from './swipe-queue.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes)
router.use('/photos', photoRoutes)
router.use('/reset-password', resetPasswordRoutes)
router.use('/user-interactions', userInteractionRoutes);
router.use('/reports', reportRoutes);
router.use('/user-preferences', userPreferenceRoutes);
router.use('/swipe-queue', swipeQueueRoutes);


router.use('/admin', adminRoutes)
export default router;