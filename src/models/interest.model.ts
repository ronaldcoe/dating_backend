import { db } from "@/lib/db";

export async function getInterests() {
  return db.interest.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function getUserInterests(userId: number) {
  return db.userInterest.findMany({
    where: { userId },
    include: { interest: true }
  });
}

export async function addUserInterest(userId: number, interestId: number) {
  return db.userInterest.create({
    data: {
      userId,
      interestId
    }
  });
}

