import { Request, Response } from "express";
import { AdminReportService } from "@/services/admin/report.service";
import { validateParams } from "@/utils/report.utils";
import { AppError,NotFoundError,ValidationError } from "@/utils/errors";
import Joi from "joi";

export class AdminReportController {
  /**
   * Get all reports with pagination
   * @route GET /api/admin/reports
   */
  static async getReports(req: Request, res: Response): Promise<void> {
    try {
      // Extract pagination parameters from query string
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortBy = req.query.sortBy as string || "createdAt";
      const status = req.query.status as string || 'PENDING';
      const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'desc';


      const filters = {
        page,
        limit,
        sortBy,
        sortOrder,
        status: status === 'all' ? undefined : status
      }

      // Get reports with pagination
      const reports = await AdminReportService.getReports(filters);

      res.status(200).json({ 
        success: true, 
        data: reports.data,
        pagination: reports.pagination
      });
    } catch (error:any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, message: error.message });
      } else if (error instanceof AppError) {
        res.status(400).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: "Server error" });
      }
    }
  }

  /**
   * Get report by ID
   * @route GET /api/admin/reports/:id
   */
  static async getReportById(req: Request, res: Response): Promise<void> {
    try {
      const reportId = req.params.id;

      // Validate report ID
      if (!reportId) {
        throw new ValidationError("Report ID is required");
      }

      // Get report by ID
      const report = await AdminReportService.getReportById(Number(reportId));

      if (!report) {
        throw new AppError("Report not found");
      }

      res.status(200).json({ success: true, data: report });
    } catch (error:any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, message: error.message });
      } else if (error instanceof AppError) {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: "Server error" });
      }
    }
  }

  /**
   * Update report status
   * @route PATCH /api/admin/reports/:id
   */
  static async updateReportStatus(req: Request, res: Response): Promise<void> {
    try {
      const reportId = req.params.id;
      const status = req.body.status;
      const resolution = req.body.resolution;

      // Validate report ID
      if (!reportId) {
        throw new ValidationError("Report ID is required");
      }

      // Update report status
      const updatedReport = await AdminReportService.updateReportStatus(Number(reportId), status,  resolution);

      res.status(200).json({ success: true, data: updatedReport });
    } catch (error:any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: "Server error" });
      }
    }
  }

    /**
   * Get reports by source user ID
   * @route GET /api/admin/reports/target/:id
   */
    static async getReportsByTargetUserId(req: Request, res: Response): Promise<void> {
      try {
        const { userId } = req.params;
        
        // Validate user ID
        const schema = Joi.object({
          userId: Joi.number().required(),
        });
        const { error } = schema.validate({ userId: Number(userId) });
        
        if (error) {
          throw new ValidationError("Invalid user ID");
        }
        
        const reports = await AdminReportService.getReportsByTargetUserId(Number(userId));

        if (reports.length === 0) {
          throw new NotFoundError("No reports found for this user");
        }
        
         // Check if reports are empty
  
        res.status(200).json({ success: true, message: "Reports fetched successfully", data: reports });
      } catch (error: any) {
        if (error instanceof ValidationError) {
          res.status(400).json({ success: false, message: error.message });
        }
        else if (error instanceof NotFoundError) {
          res.status(404).json({ success: false, message: error.message });
        }
        else if (error instanceof AppError) {
          res.status(404).json({ success: false, message: error.message });
        }
        else {
          res.status(500).json({ success: false, message: "Server error" });
        }
      }
    }
}