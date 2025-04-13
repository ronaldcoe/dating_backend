import { Gender } from "@prisma/client";
import { db } from "@/lib/db"

export async function createUser(data: { email: string, password: string, name:string }) {
  return db.user.create({
    data: {
      email: data.email,
      password: data.password,
      name: data.name,
      role: "USER",
      status: "ACTIVE",
    },
  })
}

export async function findUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
  })
}

// update user profile
export async function updateUserProfile(userId: number, data: {
  name?: string,
  birthDate?: Date | null,
  gender?: Gender | null,
  bio?: string | null,
  locationLat?: number | null,
  locationLng?: number | null,
}) {
  return db.user.update({
    where: { id: userId },
    data,
  });
}

// find user by id
export async function findUserById(userId: number) {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (!user) {
    throw new Error('User not found');
  }

  const { password: _, ...userWithoutPassword } = user;
    
  return userWithoutPassword
}