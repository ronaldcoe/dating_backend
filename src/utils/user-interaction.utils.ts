import { db } from "@/lib/db"

/**
 * Validate if a like is valid:
 * - User cannot like themselves
 * - User cannot like the same user twice
 * - user need to be active
 */
export async function isValidLike(sourceUserId: number, targetUserId: number) {
  // User cannot like themselves
  if (sourceUserId === targetUserId) {
    throw new Error('User cannot like themselves');
  }

  // User cannot like the same user twice
  const existingLike = await db.userInteraction.findUnique({
    where: {
      sourceUserId_targetUserId: {
        sourceUserId,
        targetUserId
      }
    }
  });

  if (existingLike) {
    throw new Error('User already liked');
  }

  // User need to be active
  const user = await db.user.findUnique({
    where: { id: sourceUserId }
  });

  if (!user || user.status !== 'ACTIVE') {
    throw new Error('User not found or not active');
  }
  return true;
}