import {
  getReports
} from "@/models/admin/report.model";

export class AdminReportService {
  static async getReports(page: number, limit: number) {
    return await getReports({page, limit});
  }

}