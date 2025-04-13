import { db } from "@/lib/db";
import { findUserById } from "@/models/user.model";

/**
 * Validate if report is valid
 * - User cannot report themselves
 * - User cannot report the same user twice
 * - Target User doesn't need to be active. We want to allow reports even if the user is inactive.
 */

export async function isValidReport(sourceUserId: number, targetUserId: number) {
  // User cannot report themselves
  if (sourceUserId === targetUserId) {
    throw new Error('Users cannot report themselves');
  }

  // targetUser must  exsist in the database
  try {
    await findUserById(targetUserId);
  } catch (error) {
    throw new Error('Target user does not exist');
  }

  return true;
}