import { db } from '@/lib/db'
import { UserStatus } from '@prisma/client'
import Joi from 'joi'


export async function isValidBan(userId: number, banReason: string) {
  // Check if the user exists
  const user = await db.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    return {
      success: false,
      message: 'User not found'
    }
  }

  // check if user being baned is a moderator
  if (user.role === 'MODERATOR' || user.role === 'ADMIN') {
    return {
      success: false,
      message: 'You cannot ban a moderator or admin'
    }
  }

  let schema = Joi.object({
    userId: Joi.number().strict().required().messages({
      'number.base': 'userId must be a number, not a string'
    }),
    banReason: Joi.string().strict().required().min(8).messages({
      'string.base': 'reason must be a string, not a number'
    })
  }).unknown(false)
  const result = schema.validate({ userId, banReason }, { convert: false })
  console.log('result', result)
  if (result.error) {
    return {
      success: false,
      message: result.error.details[0].message
    }
  }
  return {
    success: true,
    message: 'Valid ban'
  }
}

export async function isValidLock(userId: number, lockReason: string) {
  // Check if the user exists
  const user = await db.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    return {
      success: false,
      message: 'User not found'
    }
  }

  // check if user being lock is a moderator
  if (user.role === 'MODERATOR' || user.role === 'ADMIN') {
    return {
      success: false,
      message: 'You cannot lock a moderator or admin'
    }
  }

  let schema = Joi.object({
    userId: Joi.number().strict().required().messages({
      'number.base': 'userId must be a number, not a string'
    }),
    lockReason: Joi.string().strict().required().min(8).messages({
      'string.base': 'reason must be a string, not a number'
    })
  }).unknown(false)
  const result = schema.validate({ userId, lockReason }, { convert: false })
  console.log('result', result)
  if (result.error) {
    return {
      success: false,
      message: result.error.details[0].message
    }
  }
  return {
    success: true,
    message: 'Valid lock'
  }
}