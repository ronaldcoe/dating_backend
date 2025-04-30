import { Request, Response } from 'express'
import { AdminUserService } from '@/services/admin/user.service';
import { ValidationError } from '@/utils/errors'

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
   * Ban user
   * @route PUT /api/admin/users/ban/:id
   */
  static async banUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { banReason } = req.body;

      if (!banReason) {
        res.status(400).json({
          success: false,
          message: 'Ban reason is required',
        });
        return;
      }

      if (req.user.userId === Number(id)) {
        res.status(400).json({
          success: false,
          message: 'You cannot ban yourself',
        });
        return;
      }

      await AdminUserService.banUser(Number(id), banReason);

      res.status(200).json({
        success: true,
        message: 'User banned successfully',
      });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, message: error.message });
      }
    }
  }
}