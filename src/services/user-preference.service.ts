import {
  getUserPreferences,
  updateUserPreferences
} from '@/models/user-preference.model';
import { UserPreference } from '@prisma/client';
import { isValidUserPreference } from "@/utils/user-preference.utils";
import { ValidationError } from "@/utils/errors";

export class UserPreferenceService {
  static async getUserPreferences(userId: number) {
    return await getUserPreferences(userId);
  }

  static async updateUserPreferences(
    userId: number,
    data: Partial<UserPreference>
  ) {

    const isValid = isValidUserPreference(data);

    if (!isValid.success) {
      throw new ValidationError(isValid.message);
    }

    return await updateUserPreferences(userId, data);
  }
}