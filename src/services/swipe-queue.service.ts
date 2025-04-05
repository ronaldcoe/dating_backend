import { getUserPreferencesInterests, getSwipeQueue, getProfiles } from "@/models/swipe-queue.model"
import { getUserInteractionsByUserId } from "@/models/user-interaction.model";

export class SwipeQueueService {

  static async generateProfiles(userId: number, count: number = 10) {
    // get current user data and preferences
    const user = await getUserPreferencesInterests(userId)

    if (!user) {
      return []
    }

    const { minAge, maxAge, distanceRadius, realtionshipType } = user.userPreferences;

    const now = new Date();
    const minBirthDate = new Date(now)
    minBirthDate.setFullYear(minBirthDate.getFullYear() - (maxAge || 100))
    minBirthDate.setHours(0, 0, 0, 0);

    const maxBirthDate = new Date(now)
    maxBirthDate.setFullYear(maxBirthDate.getFullYear() - (minAge || 18))
    maxBirthDate.setHours(0, 0, 0, 0);

    // Get ids of users that the current user has interacted with
    const interactedProfiles = await getUserInteractionsByUserId(userId)

    // Get ids already in queue
    const swipeQueue = await getSwipeQueue(userId)

    // Combine excluded ids
    const excludedIds = [
      userId,
      ...interactedProfiles.map(p => p.targetUserId),
      ...swipeQueue.map(p => p.targetUserId)
    ]

    const baseWhereClause = {
      id: {
        notIn: excludedIds
      },
      role: 'USER',
      status: 'ACTIVE',
      birthDate: {
        gte: minBirthDate,
        lte: maxBirthDate
      },
    }

    console.log('baseWhereClause', baseWhereClause)

    const profiles = await getProfiles(baseWhereClause)

    return profiles

  }
}