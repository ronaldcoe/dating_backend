import { Request, Response } from 'express';
import { AdminInterestService } from '@/services/admin/interest.service';
import { AppError,NotFoundError,ValidationError } from "@/utils/errors";
import { PaginatedRequest } from '@/middlewares/pagination.middleware';

export class AdminInterestController {
  /**
   * Get all interests
   * @route GET /api/admin/interests
   */
  static async getAllInterests(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder } = (req as PaginatedRequest).pagination;

      console.log('Pagination:', page, limit, sortBy, sortOrder);
      
      const interests = await AdminInterestService.getAllInterests(page, limit, sortBy, sortOrder);

      res.status(200).json({ 
        success: true, 
        message: 'Interests fetched successfully',
        data: interests.data,
        pagination: interests.pagination
      });
    } catch (error:any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, message: error.message });
      }
      else if (error instanceof AppError) {
        res.status(400).json({ success: false, message: error.message });
      }
      else {
        res.status(500).json({ success: false, message: 'Server error' });
      }
    }
  }

  /**
   * Create a new interest
   * @route POST /api/admin/interests
   */
  static async createInterest(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.body;

      // Validate request body
      if (!name) {
        res.status(400).json({ success: false, message: 'Interest name is required' });
        return;
      }

      // Create interest
      const interest = await AdminInterestService.createInterest(name);

      res.status(201).json({ success: true, data: interest });
    } catch (error:any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, message: error.message });
      }
      else if (error instanceof AppError) {
        res.status(400).json({ success: false, message: error.message });
      }
      else {
        res.status(500).json({ success: false, message: 'Server error' });
      }
    }
  }

  /**
   * Edit an existing interest
   * @route PUT /api/admin/interests/:id
   */
  static async editInterest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (!name) {
        res.status(400).json({ success: false, message: 'Interest name is required' });
        return;
      }

      // Edit interest
      const interest = await AdminInterestService.editInterest(parseInt(id), name);

      res.status(200).json({ success: true, data: interest });
    } catch (error:any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, message: error.message });
      }
      else if (error instanceof AppError) {
        res.status(400).json({ success: false, message: error.message });
      }
      else {
        res.status(500).json({ success: false, message: 'Server error' });
      }
    }
  }
}