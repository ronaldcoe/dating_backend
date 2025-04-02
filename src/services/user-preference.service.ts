import {
  getUserPreferences,
  updateUserPreferences
} from '@/models/user-preference.model';
import { UserPreference } from '@prisma/client';

export class UserPreferenceService {
  static async getUserPreferences(userId: number) {
    return await getUserPreferences(userId);
  }

  static async updateUserPreferences(
    userId: number,
    data: Partial<UserPreference>
  ) {
    return await updateUserPreferences(userId, data);
  }
}