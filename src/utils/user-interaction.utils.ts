import { db } from "@/lib/db"

/**
 * Validate if a like is valid:
 * - User cannot like themselves
 * - User cannot like the same user twice
 * - user need to be active
 */
export async function isValidUserInteraction(sourceUserId: number, targetUserId: number) {
  // User cannot like themselves
  if (sourceUserId === targetUserId) {
    throw new Error('Users cannot interact with themselves');
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