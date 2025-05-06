import { Request, Response } from "express";
import { AdminPhotoService } from "@/services/admin/photo.service";
import { ValidationError, AppError } from "@/utils/errors";


export class AdminPhotoController {
  /**
   * Soft delete photo
   * @route POST /api/admin/photos/:id/reject
   */
  static async rejectPhoto(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { moderationMessage } = req.body;
      
      // Moderator ID
      const moderatorId = req.user?.userId;

      // // Validate photo ID
      // if (!id) {
      //   throw new ValidationError("Photo ID is required");
      // }

      // Validate moderation message
      if (!moderationMessage) {
        throw new ValidationError("moderationMessage is required");
      }

      const photo = await AdminPhotoService.rejectPhoto(Number(id), moderationMessage, moderatorId);

      res.status(200).json({
        success: true,
        message: "Photo rejected successfully",
        data: photo,
      });
    } catch (error: any) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, message: error.message });
      } else if (error instanceof AppError) {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  }
}