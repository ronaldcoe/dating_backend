import { Router } from "express";
import { UserController } from "@/controllers/user.controller";
import { authenticate } from "@/middlewares/auth";
import photosRoutes from './photo.routes'
import interestRoutes from './interest.routes'
import resetPasswordRoutes from './reset-password.routes'

const router = Router()

router.get('/me', authenticate, UserController.getCurrentUser);
router.put('/profile', authenticate, UserController.updateProfile);

// upload pictures
router.use('/photos', photosRoutes)

router.use('/interests', interestRoutes)

router.use('/reset-password', resetPasswordRoutes)


export default router