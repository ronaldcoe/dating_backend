import { Request, Response } from 'express'
import { AdminUserService } from '@/services/admin/user.service';

export class AdminUserController {
  /**
   * Get all users
   * @route GET /api/admin/users
   */
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await AdminUserService.getAllUsers();
      
      res.status(200).json({
        success: true,
        message: 'Users fetched successfully',
        data: users,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch users',
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