import { Request, Response } from 'express';
import { S3Client, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/db';
import { generatePhotoUrls, generatePresignedUrl } from '@/utils/s3-pre-signed-url';
// Create S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB size limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export class PhotoController {
  /**
   * Upload a new photo
   * @route POST /api/users/photos
   */

  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')  // Replace special characters with underscore
      .replace(/\s+/g, '_')             // Replace spaces with underscore
      .replace(/_+/g, '_')              // Reduce multiple underscores to single
      .toLowerCase()                    // Convert to lowercase
      .trim();                          // Remove leading/trailing whitespace
  }

  static async uploadPhoto(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file provided' });
        return;
      }
  
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }
  
      // Check maximum photos per user
      const MAX_PHOTOS = 40;
      const photosCount = await db.photo.count({
        where: { userId }
      });
  
      if (photosCount >= MAX_PHOTOS) {
        res.status(400).json({ 
          success: false, 
          message: `Maximum of ${MAX_PHOTOS} photos allowed per user` 
        });
        return;
      }
  
      // Create photo record first to get the ID
      const photo = await db.photo.create({
        data: {
          user: {
            connect: {
              id: userId
            }
          },
          originalUrl: '',
          standardUrl: '',
          thumbnailUrl: '',
          position: photosCount + 1,
          isPrimary: photosCount === 0, // First photo is primary by default
          status: 'PENDING'
        }
      });
  
      // Use the photo ID for the file name (better for tracking)
      const photoId = photo.id;
      const fileExtension = req.file.originalname.split('.').pop() || 'jpg';
      const key = `uploads/${userId}/${photoId}.${fileExtension}`;
  
      // Upload original image to S3 (will be processed by Lambda)
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        // Removed ACL: 'public-read' - no longer needed
        Metadata: {
          'user-id': userId.toString(),
          'photo-id': photoId.toString(),
          'original-name': PhotoController.sanitizeFilename(req.file.originalname),
          'upload-type': 'user-photo',
        }
      });
  
      await s3Client.send(command);
  
      // Store the S3 keys instead of full URLs
      const originalKey = key;
      const standardKey = `processed/${userId}/standard-${photoId}.jpg`;
      const thumbnailKey = `processed/${userId}/thumbnail-${photoId}.jpg`;
  
      // For storing in database, use full URLs so existing code doesn't break
      const baseUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`;
      const originalUrl = `${baseUrl}/${originalKey}`;
      const standardUrl = `${baseUrl}/${standardKey}`;
      const thumbnailUrl = `${baseUrl}/${thumbnailKey}`;
  
      // Update photo record with URLs
      await db.photo.update({
        where: { id: photoId },
        data: {
          originalUrl,
          standardUrl,
          thumbnailUrl
        }
      });
  
      // Generate pre-signed URL for the standard and thumbnail
      const bucket = process.env.AWS_S3_BUCKET || '';
      const preSignedStandardUrl = await generatePresignedUrl(bucket, standardKey);
      const preSignedThumbnailUrl = await generatePresignedUrl(bucket, thumbnailKey);
  
      res.status(201).json({
        success: true,
        message: 'Photo uploaded successfully. Processing in progress.',
        data: {
          photoId,
          original: originalUrl, // Original doesn't need pre-signed URL as user can't access it anyway
          standard: preSignedStandardUrl,
          thumbnail: preSignedThumbnailUrl,
          status: 'PENDING',
          isPrimary: photo.isPrimary,
          position: photo.position
        }
      });
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload photo'
      });
    }
  }

  /**
   * Get all photos for the current user
   * @route GET /api/users/photos
   */
  static async getUserPhotos(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const photos = await db.photo.findMany({
        where: { userId },
        orderBy: { position: 'asc' }
      });

      // Generate pre-signed URLs for each photo
      const photosWithUrls = await Promise.all(
        photos.map(async (photo) => {
          // Only generate pre-signed URLs for completed photos
          if (photo.status === 'COMPLETED') {
            return await generatePhotoUrls(photo);
          }
          return photo;
        })
      );

      res.status(200).json({
        success: true,
        data: { photos: photosWithUrls }
      });
    } catch (error: any) {
      console.error('Error getting photos:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve photos'
      });
    }
  }

  /**
   * Delete a photo
   * @route DELETE /api/users/photos/:photoId
   */
  static async deletePhoto(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const photoId = parseInt(req.params.photoId);
      if (isNaN(photoId)) {
        res.status(400).json({ success: false, message: 'Invalid photo ID' });
        return;
      }

      // Find the photo and verify ownership
      const photo = await db.photo.findUnique({
        where: { id: photoId }
      });

      if (!photo) {
        res.status(404).json({ success: false, message: 'Photo not found' });
        return;
      }

      if (photo.userId !== userId) {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }

      // Get info about the deleted photo for reordering
      const wasPrimary = photo.isPrimary;
      const deletedPosition = photo.position;

      // Delete the photo
      await db.photo.delete({
        where: { id: photoId }
      });

      // Reorder remaining photos
      await db.$transaction(async (prisma) => {
        // Update positions of photos after the deleted one
        await prisma.photo.updateMany({
          where: {
            userId,
            position: { gt: deletedPosition }
          },
          data: {
            position: { decrement: 1 }
          }
        });

        // If primary photo was deleted, set the first photo as primary
        if (wasPrimary) {
          const firstPhoto = await prisma.photo.findFirst({
            where: { userId },
            orderBy: { position: 'asc' }
          });

          if (firstPhoto) {
            await prisma.photo.update({
              where: { id: firstPhoto.id },
              data: { isPrimary: true }
            });
          }
        }
      });

      res.status(200).json({
        success: true,
        message: 'Photo deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting photo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete photo'
      });
    }
  }

  /**
   * Set a photo as primary
   * @route PUT /api/users/photos/:photoId/primary
   */
  static async setPrimaryPhoto(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const photoId = parseInt(req.params.photoId);
      if (isNaN(photoId)) {
        res.status(400).json({ success: false, message: 'Invalid photo ID' });
        return;
      }

      // Find the photo and verify ownership
      const photo = await db.photo.findUnique({
        where: { id: photoId }
      });

      if (!photo) {
        res.status(404).json({ success: false, message: 'Photo not found' });
        return;
      }

      if (photo.userId !== userId) {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }

      // Only allow setting completed photos as primary
      if (photo.status !== 'COMPLETED') {
        res.status(400).json({ 
          success: false, 
          message: 'Cannot set unprocessed photo as primary' 
        });
        return;
      }

      // Update in a transaction
      await db.$transaction([
        // Reset all photos to not primary
        db.photo.updateMany({
          where: { userId },
          data: { isPrimary: false }
        }),
        // Set selected photo as primary
        db.photo.update({
          where: { id: photoId },
          data: { isPrimary: true }
        })
      ]);

      res.status(200).json({
        success: true,
        message: 'Primary photo updated successfully'
      });
    } catch (error: any) {
      console.error('Error setting primary photo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to set primary photo'
      });
    }
  }

  /**
   * Reorder photos
   * @route PUT /api/users/photos/reorder
   */
  static async reorderPhotos(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const { photoIds } = req.body;

      if (!Array.isArray(photoIds)) {
        res.status(400).json({ success: false, message: 'Invalid photo order data' });
        return;
      }

      // Verify all photos exist and belong to the user
      const photos = await db.photo.findMany({
        where: { userId }
      });

      const userPhotoIds = photos.map(p => p.id);
      const allPhotosExist = photoIds.every(id => userPhotoIds.includes(id));

      if (!allPhotosExist || photoIds.length !== userPhotoIds.length) {
        res.status(400).json({ success: false, message: 'Invalid photo IDs' });
        return;
      }

      // Update positions in a transaction
      await db.$transaction(
        photoIds.map((photoId, index) => 
          db.photo.update({
            where: { id: photoId },
            data: { position: index + 1 }
          })
        )
      );

      res.status(200).json({
        success: true,
        message: 'Photos reordered successfully'
      });
    } catch (error: any) {
      console.error('Error reordering photos:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to reorder photos'
      });
    }
  }

  /**
   * Get photo processing status
   * @route GET /api/users/photos/:photoId/status
   */
  static async getPhotoStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      const photoId = parseInt(req.params.photoId);
      if (isNaN(photoId)) {
        res.status(400).json({ success: false, message: 'Invalid photo ID' });
        return;
      }

      const photo = await db.photo.findUnique({
        where: { id: photoId }
      });

      if (!photo) {
        res.status(404).json({ success: false, message: 'Photo not found' });
        return;
      }

      if (photo.userId !== userId) {
        res.status(403).json({ success: false, message: 'Not authorized' });
        return;
      }

      let photoWithUrls = photo;
      if (photo.status === 'COMPLETED') {
        photoWithUrls = await generatePhotoUrls(photo);
      }

      res.status(200).json({
        success: true,
        data: {
          photoId: photoWithUrls.id,
          original: photoWithUrls.originalUrl,
          standard: photoWithUrls.standardUrl,
          thumbnail: photoWithUrls.thumbnailUrl,
          status: photoWithUrls.status,
          isPrimary: photoWithUrls.isPrimary,
          position: photoWithUrls.position,
          moderationMessage: photoWithUrls.moderationMessage,
          createdAt: photoWithUrls.createdAt
        }
      });
    } catch (error: any) {
      console.error('Error checking photo status:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get photo status'
      });
    }
  }

  /**
   * WebHook for Lambda to update photo processing status
   * @route POST /api/webhooks/photo-processed
   */
  static async photoProcessedWebhook(req: Request, res: Response): Promise<void> {
    try {
      // Validate webhook secret
      const webhookSecret = req.headers['x-webhook-secret'];
      if (webhookSecret !== process.env.IMAGE_WEBHOOK_SECRET) {
        res.status(401).json({ success: false, message: 'Invalid webhook secret' });
        return;
      }
  
      const { 
        userId, 
        photoId,
        standardUrl, 
        thumbnailUrl, 
        status, 
        moderationPassed,
        moderationMessage 
      } = req.body;
  
      if (!userId || !photoId) {
        res.status(400).json({ success: false, message: 'Missing required data' });
        return;
      }
  
      // If the photo was rejected or failed, delete it from S3 and database
      if (status === 'REJECTED' || status === 'FAILED') {
        try {
          // Get the photo to find its original URL
          const photo = await db.photo.findUnique({
            where: { id: parseInt(photoId) },
            select: { originalUrl: true }
          });

          /**
           * Uncomment this block if you want to delete the original image from S3
           * when the photo is rejected or failed. We decided to keep the original
           * image for record-keeping purposes, but you can uncomment this if needed.
           */
          
          // if (photo && photo.originalUrl) {
          //   // Extract the S3 key from the URL
          //   const originalKey = photo.originalUrl.split('.amazonaws.com/')[1];
            
          //   // Delete the original image from S3
          //   const s3 = new S3();
          //   await s3.deleteObject({
          //     Bucket: process.env.S3_BUCKET_NAME || 'datingapp-staging',
          //     Key: originalKey
          //   });
          // }
  
          // Delete the photo record from the database
          // await db.photo.delete({
          //   where: { id: parseInt(photoId) }
          // });
          await db.photo.update({
            where: { id: parseInt(photoId) },
            data: {
              status,
              moderationMessage: moderationMessage || null,
              moderatedAt: new Date().toISOString()
            }
          });
        } catch (error) {
          // Continue processing even if cleanup fails
        }
      } else {
        // For approved photos, update with processed URLs
        const updateData: any = {
          status,
          moderationMessage: moderationMessage || null,
          moderatedAt: new Date().toISOString()
        };
  
        if (standardUrl) {
          updateData.standardUrl = standardUrl;
        }
        
        if (thumbnailUrl) {
          updateData.thumbnailUrl = thumbnailUrl;
        }
  
        await db.photo.update({
          where: { id: parseInt(photoId) },
          data: updateData
        });
      }
  
      res.status(200).json({
        success: true,
        message: 'Photo processing status updated'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update photo status'
      });
    }
  }
}