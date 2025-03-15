import { db } from "@/lib/db";
import { generateToken, verifyToken, hashToken } from "@/utils/reset-password.utils";

export async function createResetPasswordToken(email: string, token: string) {
  return db.resetPasswordToken.create({
    data: {
      token,
      expiresAt: new Date(Date.now() + 3600000),
      user: {
        connect: {
          email,
        }
      }
    },
  });
}

export async function findResetPasswordToken(token: string) {
  return db.resetPasswordToken.findFirst({
    where: {
      token,
    },
    include: {
      user: true,
    },
  });
}

export async function resetPassword(data: { email: string, password: string }) {
  return db.user.update({
    where: { email: data.email },
    data: {
      password: data.password,
    },
  });
}

// If there is a token for an email, delete it before creating a new one
export async function deleteOldToken(email: string) {
  return db.resetPasswordToken.deleteMany({
    where: { email },
  });
}