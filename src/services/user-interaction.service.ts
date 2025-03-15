import {
  likeUser
} from '@/models/user-interaction.model'
import {
  findUserById
} from '@/models/user.model'
import {
  isValidLike
} from '@/utils/user-interaction.utils'

export class UserInteractionService {

  static async likeUser(sourceUserId: number, targetUserId: number) {  
    // validate like
    const isValid = await isValidLike(sourceUserId, targetUserId);
    if (!isValid) {
      throw new Error('Invalid like');
    }

    return await likeUser(sourceUserId, targetUserId);
  }
}