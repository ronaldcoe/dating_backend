import { db } from "@/lib/db";
import { ReportStatus } from "@prisma/client";
// Admin routes
export async function getReports({ 
                        page=1, limit = 10, 
                        sortBy='createdAt', sortOrder='desc', status }:
                        { page?: number, limit?: number, sortBy?: string, sortOrder?: 'asc' | 'desc', status?: ReportStatus }) 
                      {

  const skip = (page - 1) * limit;
  console.log("status this", sortBy)
  const totalReports = await db.report.count({
    where: {
    status: status as ReportStatus,
    },
  });

  // Create a dynamic orderBy object based on the sortBy parameter
  const orderBy = {};
  orderBy[sortBy] = sortOrder;

  const reports = await db.report.findMany({
    orderBy: orderBy,
    take: limit,
    skip: skip,
    where: {
      status: status,
    },
  });

  return {
    data: reports,
    pagination: {
      page,
      limit,
      totalItems: totalReports,
      totalPages: Math.ceil(totalReports / limit)
    }
  };
}

export async function getReportById(reportId: number) {
  const report = await db.report.findUnique({
    where: {
      id: reportId
    }
  });

  return report;
}

export async function updateReportStatus(reportId: number, resolution:string, status: ReportStatus) {
  const report = await db.report.update({
    where: {
      id: reportId
    },
    data: {
      status,
      resolution
    }
  });

  return report;
}

export async function getReportsBySourceUserId(userId: number) {
  return db.report.findMany({
    where: {
      sourceUserId: userId
    }
  });
}

export async function getReportsByTargetUserId(userId: number) {
  console.log("userId", userId)
  return db.report.findMany({
    where: {
      targetUserId: userId
    }
  });
}
