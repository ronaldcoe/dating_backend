import {
  getReports,
  getReportById,
  updateReportStatus,
  getReportsBySourceUserId,
  getReportsByTargetUserId
} from "@/models/admin/report.model";
import { ReportStatus } from "@prisma/client";
import { validateParams, validateReportUpdate } from "@/utils/report.utils";
import { ValidationError, NotFoundError } from "@/utils/errors";

export class AdminReportService {
  static async getReports(filters) {
    const { page, limit, sortBy, sortOrder, status } = filters;

    // Validate pagination parameters
    const isValid = await validateParams(page, limit, sortBy, sortOrder, status);
    if (!isValid.success) {
      throw new ValidationError(isValid.message);
    }

    return await getReports({page, limit, sortBy, sortOrder, status});
  }

  static async getReportById(reportId:number) {
    // Validate report ID
    if (!reportId) {
      throw new ValidationError("Report ID is required");
    }

    // Get report by ID
    const report = await getReportById(reportId);
    if (!report) {
      throw new NotFoundError("Report not found");
    }

    return report;
  }

  static async updateReportStatus(reportId:number, status:ReportStatus,  resolution:string) {
    
    const isValid = await validateReportUpdate(reportId, status, resolution);
    // Validate report ID
    if (!isValid.success) {
      throw new ValidationError(isValid.message);
    }

    // Update report status
    const report = await getReportById(reportId);
    if (!report) {
      console.error("Report not found");
      throw new NotFoundError("Report not found");
    }

    return await updateReportStatus(reportId, resolution, status);
  }

  static async getReportsBySourceUserId(userId: number) {
    return await getReportsBySourceUserId(userId);
  }

  static async getReportsByTargetUserId(userId: number) {
    return await getReportsByTargetUserId(userId);
  }

}