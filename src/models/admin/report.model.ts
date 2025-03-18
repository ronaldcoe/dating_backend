import { db } from "@/lib/db";

// Admin routes
export async function getReports({ page=1, limit = 10}: {page?:number, limit?: number}={}) {
  const skip = (page - 1) * limit;

  const totalReports = await db.report.count();

  const reports = await db.report.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: skip
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