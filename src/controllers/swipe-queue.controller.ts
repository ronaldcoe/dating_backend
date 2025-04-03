import { Request, Response } from 'express';
import { SwipeQueueService } from '@/services/swipe-queue.service';

export class SwipeQueueController {
  /**
   * Get Profiles for swipe queue
   * @route GET /api/swipe-queue
   */
  static async getSwipeQueue(req: Request, res: Response): Promise<void> {
    try {
      // Get user ID from request
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      // Get swipe queue
      const profiles = await SwipeQueueService.generateProfiles(userId);

      res.status(200).json({ success: true, profiles });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Failed to get swipe queue' });
    }
  }
}