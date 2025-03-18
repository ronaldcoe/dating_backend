import { Request, Response } from "express";
import { AdminReportService } from "@/services/admin/report.service";

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
      
      // Validate pagination parameters
      if (page < 1 || limit < 1 || limit > 100) {
        res.status(400).json({ 
          success: false, 
          message: "Invalid pagination parameters. Page must be >= 1 and limit must be between 1 and 100" 
        });
        return;
      }

      // Get reports with pagination
      const reports = await AdminReportService.getReports(page, limit);

      res.status(200).json({ 
        success: true, 
        data: reports.data,
        pagination: reports.pagination
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message || "Failed to retrieve reports" 
      });
    }
  }
}