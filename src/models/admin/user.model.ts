import { db } from "@/lib/db";
import { UserStatus } from "@prisma/client";

export async function getAllUsers() {
  return db.user.findMany(
    {
     orderBy: { name: 'asc' }
    }
  );
}

export async function updateUserStatus(id: number, status: UserStatus) {
  return db.user.update({
    where: { id },
    data: { status }
  });
}