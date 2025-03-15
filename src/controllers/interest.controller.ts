import { Request, Response } from "express";
import { InteresetService } from "@/services/interest.service";

export class InterestController {

  /**
   * Get all interests
   * @route GET /api/users/interests
   */
  static async getInterests(req: Request, res:Response): Promise<void> {
    try {
      const interests = await InteresetService.getInterests();

      res.status(200).json({
        success: true,
        data: interests,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch interests',
      });
    }
  }
}