import { db } from "@/lib/db"

/**
 * Validate if a like is valid:
 * - User cannot like themselves
 * - User cannot like the same user twice
 * - user need to be active
 */
export async function isValidUserInteraction(sourceUserId: number, targetUserId: number) {
  if (typeof(targetUserId) != 'number') {
    return {
      success: false,
      message:'User ID must be a number'
    };
  }


  // User cannot like themselves
  if (sourceUserId === targetUserId) {
    return {
      success: false,
      message:'Users cannot interact with themselves'
    };
  }

  const targetUser = await db.user.findUnique({
    where: { id: targetUserId }
  });
  if (!targetUser) {
    return {
      success: false,
      message:'Target user not found'
    };
  }

  // User need to be active
  const user = await db.user.findUnique({
    where: { id: sourceUserId }
  });

  if (!user || user.status !== 'ACTIVE') {
    return {
      success: false,
      messsage:'User not found or not active'
    };
  }
  return {
    success: true,
    message: 'Valid interaction'
  };
}