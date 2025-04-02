import {Router } from 'express';
import { UserPreferenceController } from '@/controllers/user-preference.controller';
import { authenticate } from '@/middlewares/auth';

const router = Router();

router.get('/', authenticate, UserPreferenceController.getUserPreferences);
router.patch('/', authenticate, UserPreferenceController.updateUserPreferences);

export default router;