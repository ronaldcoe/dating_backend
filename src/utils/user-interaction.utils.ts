import Joi from 'joi';
import { db } from "@/lib/db"

/**
 * Validate if a like is valid:
 * - User cannot like themselves
 * - User cannot like the same user twice
 * - user need to be active
 */
export async function isValidUserInteraction(sourceUserId: number, targetUserId: number) {
  let schema = Joi.object({
    sourceUserId: Joi.number().strict().required().messages({
      'number.base': 'sourceUserId must be a number, not a string'
    }),
    targetUserId: Joi.number().strict().required().messages({
      'number.base': 'targetUserId must be a number, not a string'
    })
  }).unknown(false);
  
  const result = schema.validate({ sourceUserId, targetUserId }, { convert: false });
  if (result.error) {
    return {
      success: false,
      message: result.error.details[0].message
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