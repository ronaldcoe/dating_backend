import { db } from "@/lib/db";
import { UserStatus } from "@prisma/client";

export async function getAllUsers({ page=1, limit = 10}: {page?:number, limit?: number}={}) {
  const skip = (page - 1) * limit;

  const totalUsers = await db.user.count();

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: skip
  });
  
  return {
    data: users,
    pagination: {
      page,
      limit,
      totalItems: totalUsers,
      totalPages: Math.ceil(totalUsers / limit)
    }
  };
}

export async function updateUserStatus(id: number, status: UserStatus) {
  return db.user.update({
    where: { id },
    data: { status }
  });
}