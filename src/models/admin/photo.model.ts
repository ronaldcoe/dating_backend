import { db } from '@/lib/db';
import { PhotoStatus } from '@prisma/client';

export async function changePhotoStatus(id: number, status: PhotoStatus, moderationMessage: string, moderatorId: number) {
  return db.photo.update({
    where: { id },
    data: { 
      status, 
      moderationMessage, 
      moderationUserId:moderatorId },
  });
}

export async function findPhotoById(id: number) {
  return db.photo.findUnique({
    where: { id }
  });
}