import { User, Role, UserStatus, Gender } from '@prisma/client';
import { 
  createUser, 
  findUserByEmail, 
  findUserById, 
  updateUserProfile } 
from '@/models/user.model';
import { db } from '../lib/db';
import { validateProfileUpdate } from '@/utils/user-profile.utils';

interface ProfileUpdateData {
  name?: string;
  birthDate?: Date | null;
  gender?: Gender | null;
  bio?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
}

export class UserService {

  static async updateProfile(userId: number, profileData: ProfileUpdateData): Promise<Omit<User, 'password'>> {
    // Validate user exists
    const user = await findUserById(userId);

    const isValid = validateProfileUpdate(profileData);
    if (!isValid.success) {
      throw new Error(isValid.message);
    }
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Update profile
    const updatedUser = await updateUserProfile(userId, profileData);
    
    // Remove password from updated user object
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    return userWithoutPassword;
  }

  /**
   * Check if user profile is complete
   */
  static isProfileComplete(user: Partial<User>): boolean {
    // Define which fields are required for a complete profile
    return !!(
      user.name &&
      user.birthDate &&
      user.gender &&
      user.bio &&
      user.locationLat !== null &&
      user.locationLng !== null
    );
  }

  /**
   * Get current user
   */
  static async getCurrentUser(userId: number): Promise<Omit<User, 'password'>> {
    const user = await findUserById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;
    
    return userWithoutPassword
  }
}