import { Request, Response } from "express";
import { UserPreferenceService } from "@/services/user-preference.service";
import { ValidationError, NotFoundError, AuthenticationError } from '@/utils/errors'

export class UserPreferenceController {
  /**
   * Get user preferences
   * @route GET /api/user-preferences
   */
  static async getUserPreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      const preferences = await UserPreferenceService.getUserPreferences(userId);

      res.status(200).json({ success: true, data: preferences });
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(400).json({ success: false, message: error.message || "Failed to get user preferences" });
    }
  }

  /**
   * Update user preferences
   * @route PATCH /api/user-preferences
   */
  static async updateUserPreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const data = req.body;

      const updatedPreferences = await UserPreferenceService.updateUserPreferences(userId, data);

      res.status(200).json({ success: true, data: updatedPreferences });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ success: false, message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ success: false, message: error.message });
      } else if (error instanceof AuthenticationError) {
        res.status(401).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Server error' });
      }
    }
  }
}