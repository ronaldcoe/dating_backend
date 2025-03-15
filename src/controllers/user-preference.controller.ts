import { db } from "@/lib/db";

export async function getUserPreferences(userId: number) {
  return db.userPreference.findUnique({
    where: { id: userId }
  })
}

export async function updateUserPreferences(userId: number, data) {
  
}