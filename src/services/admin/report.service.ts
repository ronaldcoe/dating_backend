import {
  getReports
} from "@/models/admin/report.model";
import { validateParams } from "@/utils/report.utils";
import { ValidationError } from "@/utils/errors";

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

}