import { db } from '@/lib/db';

type ReportType = {
  sourceUserId: number;
  targetUserId: number;
  reason: string;
}

export async function createReport(data: ReportType) {
  return db.report.create({
    data
  });
}

