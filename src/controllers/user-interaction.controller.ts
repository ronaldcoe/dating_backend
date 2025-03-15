import { Request, Response } from 'express';
import { UserInteractionService } from '@/services/user-interaction.service';

export class UserInteractionController {
  /**
   * Like a user
   * @route POST /api/user-interactions/like
   */
  static async likeUser(req: Request, res: Response): Promise<void> {
    try {
      // Get user ID from request
      const sourceUserId = req.user?.userId;
      const targetUserId = req.body.targetUserId;

      if (!sourceUserId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      // Like user
      await UserInteractionService.likeUser(sourceUserId, targetUserId);

      res.status(200).json({ success: true, message: 'User liked' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Failed to like user' });
    }
  }

  /**
   * Dislike a user
   * @route POST /api/user-interactions/dislike
   */
  static async dislikeUser(req: Request, res: Response): Promise<void> {
    try {
      // Get user ID from request
      const sourceUserId = req.user?.userId;
      const targetUserId = req.body.targetUserId;

      if (!sourceUserId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      // Dislike user
      await UserInteractionService.dislikeUser(sourceUserId, targetUserId);

      res.status(200).json({ success: true, message: 'User disliked' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Failed to dislike user' });
    }
  }
}