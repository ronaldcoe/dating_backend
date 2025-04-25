import { User, Role, UserStatus, Gender } from '@prisma/client';
import { 
  createUser, 
  findUserByEmail, 
  findUserById, 
  updateUserProfile } 
from '@/models/user.model';
import { db } from '../lib/db';
import { validateProfileUpdate } from '@/utils/user-profile.utils';
import { ValidationError, NotFoundError, AuthenticationError } from '@/utils/errors'

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
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Process birthDate if it exists to ensure proper validation
    const processedData = { ...profileData };
    if (processedData.birthDate) {
      // Convert to Date object if it's a string
      if (typeof processedData.birthDate === 'string') {
        processedData.birthDate = new Date(processedData.birthDate);
      }
    }
    
    // Validate profile data
    const isValid = validateProfileUpdate(processedData);
    if (!isValid.success) {
      throw new Error(isValid.message);
    }
    
    // Format birthDate for storage if it exists
    if (processedData.birthDate) {
      // Format as YYYY-MM-DD for Prisma @db.Date
      // This ensures we're only storing the date portion, not time
      const formattedDate = new Date(processedData.birthDate);
      processedData.birthDate = new Date(
        formattedDate.toISOString().split('T')[0]
      );
    }
    
    // Update profile
    const updatedUser = await updateUserProfile(userId, processedData);
    
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
    
    return user
  }
}