import {
  likeUser,
  dislikeUser
} from '@/models/user-interaction.model'
import {
  isValidUserInteraction
} from '@/utils/user-interaction.utils'

export class UserInteractionService {

  static async likeUser(sourceUserId: number, targetUserId: number) {  
    // validate like
    const isValid = await isValidUserInteraction(sourceUserId, targetUserId);
    if (!isValid) {
      throw new Error('Invalid like');
    }

    return await likeUser(sourceUserId, targetUserId);
  }

  static async dislikeUser(sourceUserId: number, targetUserId: number) {
    // validate dislike
    const isValid = await isValidUserInteraction(sourceUserId, targetUserId);
    if (!isValid) {
      throw new Error('Invalid dislike');
    }

    return await dislikeUser(sourceUserId, targetUserId);
  }

}