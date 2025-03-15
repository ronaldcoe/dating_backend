import { Request, Response } from 'express'
import { validateProfileUpdate } from '../utils/validators';
import { UserService } from '@/services/user-service';

export class UserController {
  /**
   * Update user profile
   * @route PUT /api/users/profile
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      // Get user ID from request
      const userId = req.user?.userId;
    
      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }
      
      // Validate profile data
      const { error, value } = validateProfileUpdate(req.body);
      if (error) {
        res.status(400).json({ success: false, message: error.details[0].message });
        return;
      }
      
      // Update profile
      const updatedUser = await UserService.updateProfile(userId, value);
      
      // Check if profile is now complete
      const isProfileComplete = UserService.isProfileComplete(updatedUser);
      
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { 
          user: updatedUser,
          isProfileComplete,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update profile',
      });
    }
  }

  /**
   * Get current user
   * @route GET /api/users/me
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      // Get user ID from request (added by auth middleware)
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({ success: false, message: 'Not authenticated' });
        return;
      }
      
      // Get current user
      const user = await UserService.getCurrentUser(userId);
      const isProfileComplete = UserService.isProfileComplete(user);
      
      res.status(200).json({
        success: true,
        data: { 
          user,
          isProfileComplete
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get current user',
      });
    }
  }
}