import {
  likeUser,
  dislikeUser,
  blockUser,
  unblockUser
} from '@/models/user-interaction.model'
import {
  isValidUserInteraction
} from '@/utils/user-interaction.utils'
import { ValidationError } from "@/utils/errors";
export class UserInteractionService {

  static async likeUser(sourceUserId: number, targetUserId: number) {  
    // validate like
    const isValid = await isValidUserInteraction(sourceUserId, targetUserId);
    if (!isValid.success) {
      throw new ValidationError(isValid.message);
    }

    const isMatch = await likeUser(sourceUserId, targetUserId);

    return isMatch;
  }

  static async dislikeUser(sourceUserId: number, targetUserId: number) {
    // validate dislike
    const isValid = await isValidUserInteraction(sourceUserId, targetUserId);
    console.log('isValid', isValid);
    if (!isValid.success) {
      throw new ValidationError(isValid.message);
    }

    return await dislikeUser(sourceUserId, targetUserId);
  }

  // Block a user
  static async blockUser(sourceUserId: number, targetUserId: number) {
    // validate block
    const isValid = await isValidUserInteraction(sourceUserId, targetUserId);
    if (!isValid.success) {
      throw new ValidationError(isValid.message);
    }

    return await blockUser(sourceUserId, targetUserId);
  }

  // Unblock a user
  static async unblockUser(sourceUserId: number, targetUserId: number) {
    const isValid = await isValidUserInteraction(sourceUserId, targetUserId);

    if (!isValid.success) {
      throw new ValidationError(isValid.message);
    }

    return await unblockUser(sourceUserId, targetUserId);
  }

}