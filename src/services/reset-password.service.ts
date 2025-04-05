import { generateToken, verifyToken, hashToken } from "@/utils/reset-password.utils";
import { createResetPasswordToken, findResetPasswordToken, resetPassword, deleteOldToken } from "@/models/reset-password.model";
import { findUserByEmail } from "@/models/user.model";
import { hashPassword } from "@/utils/hash-password.utils";

export class ResetPasswordService {

  static async createResetPasswordToken(email: string) {
    // Check if user exists
    const user = await findUserByEmail(email);
    if (!user) {
      const error = new Error("User with this email not found");
      // Add a custom property to identify this type of error
      (error as any).code = "USER_NOT_FOUND";
      throw error;
    }

    const token = generateToken();
    // Delete old token if exists
    await deleteOldToken(email);
    const hashedToken = hashToken(token);
    await createResetPasswordToken(email, hashedToken);
    return token;
  }

  static async verifyResetPasswordToken(plainToken: string) {
    // Hash the received plain token
    const hashedToken = hashToken(plainToken);
    
    // Find the token record in the database
    const tokenRecord = await findResetPasswordToken(hashedToken);
    
    if (!tokenRecord) {
      throw new Error("Invalid or expired password reset token");
    }
    
    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      throw new Error("Password reset token has expired");
    }
    
    return tokenRecord;
  }

  static async resetPassword(token: string, password: string) {
    // Verify the reset password token
    const tokenRecord = await ResetPasswordService.verifyResetPasswordToken(token);
    const hashedPassword = await hashPassword(password);
    // Reset user password
    await resetPassword({
      email: tokenRecord.user.email,
      password: hashedPassword,
    });
  }
}