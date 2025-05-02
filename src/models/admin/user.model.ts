import { db } from "@/lib/db";
import { UserStatus } from "@prisma/client";

export async function getAllUsers({ page=1, limit = 10}: {page?:number, limit?: number}={}) {
  const skip = (page - 1) * limit;

  const totalUsers = await db.user.count();

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      birthDate: true,
      banReason: true,
      bio: true,
      locationLat: true,
      locationLng: true,
      gender: true,
      verified: true,
      lastActive: true,
      createdAt: true,
      updatedAt: true,
      photos: true, // Include related photos
      interests: true, // Include related interests
      userPreferences: true, // Include user preferences
    },
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

export async function getUserById(id: number) {
  return db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      birthDate: true,
      banReason: true,
      bio: true,
      locationLat: true,
      locationLng: true,
      gender: true,
      verified: true,
      lastActive: true,
      createdAt: true,
      updatedAt: true,
      photos: true, // Include related photos
      interests: true, // Include related interests
      userPreferences: true, // Include user preferences
    }
  })
}


export async function updateUserStatus(
  id: number, 
  status: UserStatus, 
  options?: { 
    banReason?: string;
    lockReason?: string;
  }
) {
  return db.user.update({
    where: { id },
    data: { 
      status,
      ...(options?.banReason !== undefined && { banReason: options.banReason }),
      ...(options?.lockReason !== undefined && { lockReason: options.lockReason })
    }
  });
}