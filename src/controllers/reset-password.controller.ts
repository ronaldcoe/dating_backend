import { Request, Response } from "express";
import { ResetPasswordService } from "@/services/reset-password.service";

export class ResetPasswordController {

  /**
   * Create a password reset token
   * @route POST /api/reset-password
   */
  static async createResetToken(req: Request, res: Response): Promise<void> {
    try {
      // Get email from request body
      const email = req.body.email;

      if (!email) {
        res.status(400).json({
          success: false,
          message: "Email is required",
        });
        return
      }
      
      // Request password reset
      // TODO: Sen the email with the token
      const token = await ResetPasswordService.createResetPasswordToken(email);

      res.status(200).json({
        success: true,
        message: "Password reset created",
      });
    } catch (error: any) {
      if (error.code === "USER_NOT_FOUND") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(400).json({
          success: false,
          message: error.message || "Failed to request password reset",
        });
      }
    }
  }

  /**
   * Verify resent password token
   * @route GET /api/reset-password/verify?token=""
   */
  static async verifyResetToken(req: Request, res: Response): Promise<void> {
    try {
      // Get plain token from query parameters
      const plainToken = req.query.token as string;
      
      if (!plainToken) {
        throw new Error("Token is required");
      }
      
      // Verify password reset token
      const tokenRecord = await ResetPasswordService.verifyResetPasswordToken(plainToken);
      
      res.status(200).json({
        success: true,
        message: "Password reset token verified",
        data: {
          email: tokenRecord.user.email,
          userId: tokenRecord.user.id
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to verify password reset token",
      });
    }
  }

  /**
   * Reset user password
   * @route POST /api/reset-password/reset
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      // Get token and password from request body
      const { token, password } = req.body;
      
      if (!token || !password) {
        res.status(400).json({
          success: false,
          message: "Token and password are required",
        });
        return
      }
      
      // Reset user password
      await ResetPasswordService.resetPassword(token, password);
      
      res.status(200).json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to reset password",
      });
    }
  }
}