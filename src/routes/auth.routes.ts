import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate, handleTokenRefresh } from '../middlewares/auth';

const router = Router();

// Register new user
router.post('/register', AuthController.register);

// Login user
router.post('/login', AuthController.login);

router.post('/refresh', handleTokenRefresh)

router.get('/verify-token', authenticate, AuthController.verifyToken);

export default router;