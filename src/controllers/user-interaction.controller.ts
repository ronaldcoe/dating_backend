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
      const isMatch = await UserInteractionService.likeUser(sourceUserId, targetUserId);

      res.status(200).json({ success: true, message: 'User liked', isMatch });
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

  /**
   * Block a user
   * @route POST /api/user-interactions/block
   */
  static async blockUser(req: Request, res: Response): Promise<void> {
    try {
      // Get user ID from request
      const sourceUserId = req.user?.userId;
      const targetUserId = req.body.targetUserId;

      if (!sourceUserId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      // Block user
      await UserInteractionService.blockUser(sourceUserId, targetUserId);

      res.status(200).json({ success: true, message: 'User blocked' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Failed to block user' });
    }
  }

  /**
   * Unblock a user
   * @route DELETE /api/user-interactions/block
   */
  static async unblockUser(req: Request, res: Response): Promise<void> {
    try {
      // Get user ID from request
      const sourceUserId = req.user?.userId;
      const targetUserId = req.body.targetUserId;

      if (!sourceUserId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }

      // Unblock user
      await UserInteractionService.unblockUser(sourceUserId, targetUserId);

      res.status(200).json({ success: true, message: 'User unblocked' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Failed to unblock user' });
    }
  }
}