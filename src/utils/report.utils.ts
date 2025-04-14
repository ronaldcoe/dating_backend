import { db } from "@/lib/db";
import { findUserById } from "@/models/user.model";
import { ReportReason } from "@prisma/client";

/**
 * Validate if report is valid
 * - User cannot report themselves
 * - User cannot report the same user twice
 * - Target User doesn't need to be active. We want to allow reports even if the user is inactive.
 */

export async function isValidReport(sourceUserId: number, targetUserId: number, reason: ReportReason) {
  // User cannot report themselves
  if (sourceUserId === targetUserId) {
    throw new Error('Users cannot report themselves');
  }

  // TARGET USER ID MUST BE PROVIDED
  if (!targetUserId) {
    throw new Error('targetUserId must be provided');
  }

  const validReasons = Object.values(ReportReason);
  if (!validReasons.includes(reason)) {
    throw new Error(`Reason must be: ${validReasons}`);
  }

  // targetUser must  exsist in the database
  try {
    await findUserById(targetUserId);
  } catch (error) {
    throw new Error('Target user does not exist');
  }

  return true;
}

/**
 * Admin report validation
 */
export async function validateParams(
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  status: string
) {
  // Validate pagination parameters
  if (page < 1 || limit < 1 || limit > 100) {
    return {
      success: false,
      message:"Invalid pagination parameters. Page must be >= 1 and limit must be between 1 and 100"
    };
  }

  // Validate sortOrder parameter
  const validSortOrders = ['asc', 'desc'];
  if (!validSortOrders.includes(sortOrder)) {
    return {
      success: false,
      message:"Invalid sortOrder parameter. Allowed values are: asc, desc"
    };
  }

  // Validate sortBy parameter
  const validSortByFields = ['createdAt', 'updatedAt', 'status'];
  if (!validSortByFields.includes(sortBy)) {
    return {
      success: false,
      message:"Invalid sortBy parameter. Allowed values are: createdAt, updatedAt, status"
    };
  }

  // Validate status parameter
  if (!['PENDING', 'RESOLVED', 'REJECTED', undefined].includes(status)) {
    return {
      success: false,
      message:"Invalid status filter. Allowed values are: PENDING, RESOLVED, REJECTED, all"
    };
  }

  return {
    success: true,
    message: 'Valid parameters'
  };
}