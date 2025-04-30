import {
  getAllUsers,
  getUserById,
  updateUserStatus
} from '@/models/admin/user.model'
import { UserStatus } from '@prisma/client'
import { generatePhotoUrls } from '@/utils/s3-pre-signed-url';
import { db } from '@/lib/db'
import { ValidationError } from '@/utils/errors'
import { isValidBan } from '@/utils/admin/user.utils'
export class AdminUserService {
  static async getAllUsers(page: number, limit: number) {
    return await getAllUsers({page, limit})
  }

  static async getUserById(id: number) {
    const user = await db.user.findUnique({
      where: { id },
      include: {
        photos: true,
        interests: true,
        userPreferences: true,
      }
    });

    if (!user) return null;

    // Transform photos to include pre-signed URLs
    if (user.photos && user.photos.length > 0) {
      user.photos = await Promise.all(
        user.photos.map(async (photo) => {
          if (photo.status === 'COMPLETED') {
            return await generatePhotoUrls(photo);
          }
          return photo;
        })
      );
    }

    return user;
  }

  static async banUser(id: number, banReason?: string) {
    const isValid = await isValidBan(id, banReason);
    if (!isValid.success) {
      throw new ValidationError(isValid.message);
    }
    console.log('isValid', isValid);

    return await updateUserStatus(id, UserStatus.BANNED, banReason);
  }
}