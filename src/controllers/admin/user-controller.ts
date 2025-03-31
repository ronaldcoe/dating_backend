import { Request, Response } from 'express'
import { AdminUserService } from '@/services/admin/user.service';

export class AdminUserController {
  /**
   * Get all users
   * @route GET /api/admin/users
   */
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Validate pagination parameters
      if (page < 1 || limit < 1 || limit > 100) {
        res.status(400).json({ 
          success: false, 
          message: "Invalid pagination parameters. Page must be >= 1 and limit must be between 1 and 100" 
        });
        return;
      }

      const users = await AdminUserService.getAllUsers(page, limit);
      
      res.status(200).json({
        success: true,
        message: 'Users fetched successfully',
        data: users.data,
        pagination: users.pagination
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch users',
      });
    }
  }

  /**
   * Get user by ID
   * @route GET /api/admin/users/:id
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await AdminUserService.getUserById(Number(id));

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User fetched successfully',
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch user',
      });
    }
  }

  /**
   * Update user status
   * @route PUT /api/admin/users/:id/status
   */
  static async updateUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      await AdminUserService.updateUserStatus(Number(id), status);

      res.status(200).json({
        success: true,
        message: 'User status updated successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update user status',
      });
    }
  }
}