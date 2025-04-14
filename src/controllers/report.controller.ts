import { Request, Response } from "express";
import { ReportService } from "@/services/report.service";

export class ReportController {
  /**
   * Create a report
   * @route POST /api/reports/new
   */
  static async createReport(req: Request, res: Response): Promise<void> {
    try {
      // Get user ID from request
      const sourceUserId = req.user?.userId;
      const targetUserId = req.body.targetUserId;
      const reason = req.body.reason;
      const description = req.body.description;

      if (!sourceUserId) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      // Create report
      await ReportService.createReport(sourceUserId, targetUserId, reason, description);

      res.status(200).json({ success: true, message: "Report created" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Failed to create report" });
    }
  }

}