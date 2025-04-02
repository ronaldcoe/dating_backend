import { db } from '@/lib/db'
import { Prisma, UserPreference } from '@prisma/client'

export async function getUserPreferences(userId: number) {
  return await db.userPreference.findUnique({
    where: { userId },
  })
}

export async function updateUserPreferences(
  userId: number,
  data: Partial<Omit<UserPreference, 'id' | 'userId'>>
) {
  return await db.userPreference.upsert({
    where: { userId },
    create: {
      user: { connect: { id: userId } },
      ...data 
    } as Prisma.UserPreferenceCreateInput,
    update: data
  })
}