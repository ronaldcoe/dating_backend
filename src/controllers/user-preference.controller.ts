import { Request, Response } from "express";
import { UserPreferenceService } from "@/services/user-preference.service";

export class UserPreferenceController {
  /**
   * Get user preferences
   * @route GET /api/user-preferences
   */
  static async getUserPreferences(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      const preferences = await UserPreferenceService.getUserPreferences(userId);

      res.status(200).json({ success: true, data: preferences });
    } catch (error: any) {
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

      if (!userId) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return;
      }

      const updatedPreferences = await UserPreferenceService.updateUserPreferences(userId, data);

      res.status(200).json({ success: true, data: updatedPreferences });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || "Failed to update user preferences" });
    }
  }
}