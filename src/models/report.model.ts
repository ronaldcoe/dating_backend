import { db } from '@/lib/db';

type ReportType = {
  sourceUserId: number;
  targetUserId: number;
  reason: string;
}

// Admin routes
export async function getReports() {
  return db.report.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function getReport(id: number) {
  return db.report.findUnique({
    where: { id }
  });
}

export async function deleteReport(id: number) {
  return db.report.delete({
    where: { id }
  });
}

export async function reviewReport(id: number, reviewed: boolean, resolution: string, userId: number) {
  return db.report.update({
    where: { id },
    data: {
      reviewed,
      reviewedAt: new Date(),
      resolution: resolution,
      reviewedBy: userId
    }
  });
}

export async function createReport(data: ReportType) {
  return db.report.create({
    data
  });
}

