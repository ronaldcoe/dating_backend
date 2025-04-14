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