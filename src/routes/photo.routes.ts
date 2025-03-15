import { Router } from 'express';
import { PhotoController, upload } from '../controllers/photo.controller';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Protected routes - require authentication
router.post('/', authenticate, upload.single('image'), PhotoController.uploadPhoto);
router.get('/', authenticate, PhotoController.getUserPhotos);
router.delete('/:photoId', authenticate, PhotoController.deletePhoto);
router.put('/:photoId/primary', authenticate, PhotoController.setPrimaryPhoto);
router.put('/reorder', authenticate, PhotoController.reorderPhotos);
router.get('/:photoId/status', authenticate, PhotoController.getPhotoStatus);

// Webhook route - doesn't require user authentication, but uses webhook secret
router.post('/webhooks/photo-processed', PhotoController.photoProcessedWebhook);

export default router;