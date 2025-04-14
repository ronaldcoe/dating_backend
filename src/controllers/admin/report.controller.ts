import { Request, Response } from "express";
import { AdminReportService } from "@/services/admin/report.service";
import { validateParams } from "@/utils/report.utils";
import { AppError,ValidationError } from "@/utils/errors";

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
}