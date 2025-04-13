import { getUserPreferencesInterests, getSwipeQueue, getProfiles } from "@/models/swipe-queue.model"
import { getUserInteractionsByUserId } from "@/models/user-interaction.model";
import { getUserAge } from "@/utils/swipe-queue.utils";

export class SwipeQueueService {

  static async generateProfiles(userId: number, count: number = 10) {
    // get current user data and preferences
    const user = await getUserPreferencesInterests(userId)
  
    if (!user) {
      return []
    }
  
    const userAge = getUserAge(user.birthDate)
    const { minAge, maxAge, distanceRadius, realtionshipType } = user.userPreferences;
  
    const now = new Date();
    console.log('now', now)
    // Calculate date for max age filter (oldest allowed people)
    // For a max age of 32, get people born on or after Jan 1 of the year they turn 32
    // Calculate date for max age filter (oldest allowed people)
    const maxAgeValue = maxAge || userAge + 2;
    const minBirthDate = new Date(Date.UTC(
      now.getUTCFullYear() - maxAgeValue,
      0,  // January
      1,  // 1st day
      0, 0, 0, 0  // Start of day
    ));

    // Calculate date for min age filter (youngest allowed people)
    const minAgeValue = minAge || Math.max(18, userAge - 2);
    const maxBirthDate = new Date(Date.UTC(
      now.getUTCFullYear() - minAgeValue,
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0  // Start of day
    ));
    
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