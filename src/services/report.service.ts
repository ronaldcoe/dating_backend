import {
  createReport
} from '@/models/report.model';
import { isValidReport } from '@/utils/report.utils';

export class ReportService {
  
  static async createReport(sourceUserId: number, targetUserId: number, reason: string) {
    // Validate report
    const isValid = await isValidReport(sourceUserId, targetUserId);
    if (!isValid) {
      throw new Error('Invalid report');
    }
    return await createReport({
      sourceUserId,
      targetUserId,
      reason
    });
  }
}