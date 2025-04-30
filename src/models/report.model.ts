import { db } from '@/lib/db';
import { ReportReason } from '@prisma/client';

type ReportType = {
  sourceUserId: number;
  targetUserId: number;
  reason: ReportReason;
}

export async function createReport(data: ReportType) {
  return db.report.create({
    data
  });
}