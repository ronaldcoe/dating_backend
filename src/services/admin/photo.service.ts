import { changePhotoStatus } from "@/models/admin/photo.model";
import { PhotoStatus } from "@prisma/client";
import { isValidPhotoModeration } from "@/utils/admin/photo.utils";
import { AppError, ValidationError } from "@/utils/errors";

export class AdminPhotoService {

  // Soft delete photo
  static async rejectPhoto(id: number, moderationMessage: string, moderatorId: number): Promise<any> {

    // Validate
    const isValid = await isValidPhotoModeration(id, 'REJECTED', moderationMessage);

    if (!isValid.success) {
      throw new ValidationError(isValid.message);
    }

    // Change photo status
    return await changePhotoStatus(id, 'REJECTED', moderationMessage, moderatorId);
  }
}