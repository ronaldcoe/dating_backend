import {
  createReport,
} from '@/models/report.model';
import { isValidReport } from '@/utils/report.utils';
import { ReportReason } from '@prisma/client';

export class ReportService {
  
  static async createReport(sourceUserId: number, targetUserId: number, reason: ReportReason) {
    // Validate report
    const isValid = await isValidReport(sourceUserId, targetUserId, reason);
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