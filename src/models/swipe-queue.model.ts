import { db } from '@/lib/db';

export async function getSwipeQueue(userId: number) {
  return await db.swipeQueue.findMany({
    where: { userId },
    select: { targetUserId: true }
  });
}

export async function getUserPreferencesInterests(userId: number) {
  return await db.user.findUnique({
    where: { id: userId },
    include: {
      userPreferences: true,
      interests: true,
    },
  });
}

export async function getProfiles(filter: {}) {
  return await db.user.findMany({
    where: filter,
    // include photos and interests
  })
}