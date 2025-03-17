import { db } from "@/lib/db";
import { UserInteractionType } from "@prisma/client";

// Basic CRUD operations dont use for business logic
export async function createUserInteraction(data: {
  sourceUserId: number, 
  targetUserId: number, 
  type: UserInteractionType
}) {
  return await db.userInteraction.create({
    data: {
      sourceUserId: data.sourceUserId,
      targetUserId: data.targetUserId,
      type: data.type
    }
  });
}

export async function getUserInteraction(sourceUserId: number, targetUserId: number) {
  return await db.userInteraction.findUnique({
    where: {
      sourceUserId_targetUserId: {
        sourceUserId,
        targetUserId
      }
    }
  });
}

export async function updateUserInteraction(
  sourceUserId: number, 
  targetUserId: number, 
  data: { type?: UserInteractionType, isMatched?: boolean, viewedAt?: Date }
) {
  return await db.userInteraction.update({
    where: {
      sourceUserId_targetUserId: {
        sourceUserId,
        targetUserId
      }
    },
    data
  });
}

export async function deleteUserInteraction(sourceUserId: number, targetUserId: number) {
  return await db.userInteraction.delete({
    where: {
      sourceUserId_targetUserId: {
        sourceUserId,
        targetUserId
      }
    }
  });
}

export async function getUserInteractionsByUserId(userId: number) {
  return await db.userInteraction.findMany({
    where: {
      sourceUserId: userId
    }
  });
}

export async function getUserInteractionsByUserIdAndType(userId: number, type: UserInteractionType) {
  return await db.userInteraction.findMany({
    where: {
      sourceUserId: userId,
      type
    }
  });
}

export async function likeUser(sourceUserId: number, targetUserId: number) {
  // Create or update the interaction
  await db.userInteraction.upsert({
    where: {
      sourceUserId_targetUserId: {
        sourceUserId,
        targetUserId
      }
    },
    update: {
      type: "LIKE"
    },
    create: {
      sourceUserId,
      targetUserId,
      type: "LIKE"
    }
  });

  // Check if this created a match
  const otherInteraction = await getUserInteraction(targetUserId, sourceUserId);
  
  if (otherInteraction && otherInteraction.type === "LIKE") {
    // Update both interactions to mark them as matched
    await db.$transaction([
      db.userInteraction.update({
        where: {
          sourceUserId_targetUserId: {
            sourceUserId,
            targetUserId
          }
        },
        data: { isMatched: true }
      }),
      db.userInteraction.update({
        where: {
          sourceUserId_targetUserId: {
            sourceUserId: targetUserId,
            targetUserId: sourceUserId
          }
        },
        data: { isMatched: true }
      })
    ]);
    
    return true; // Match created
  }
  
  return false; // No match
}

export async function dislikeUser(sourceUserId: number, targetUserId: number) {
  return await db.userInteraction.upsert({
    where: {
      sourceUserId_targetUserId: {
        sourceUserId,
        targetUserId
      }
    },
    update: {
      type: "DISLIKE",
      isMatched: false
    },
    create: {
      sourceUserId,
      targetUserId,
      type: "DISLIKE"
    }
  });
}

export async function getUsersWhoLikedMe(userId: number) {
  return await db.userInteraction.findMany({
    where: {
      targetUserId: userId,
      type: "LIKE"
    },
    include: {
      sourceUser: {
        include: {
          photos: {
            where: { isPrimary: true }
          }
        }
      }
    }
  });
}

export async function getMatches(userId: number) {
  return await db.userInteraction.findMany({
    where: {
      sourceUserId: userId,
      isMatched: true
    },
    include: {
      targetUser: {
        include: {
          photos: {
            where: { isPrimary: true }
          }
        }
      }
    }
  });
}

export async function unmatchUsers(userId1: number, userId2: number) {
  // Delete or update both interaction records
  return await db.$transaction([
    db.userInteraction.update({
      where: {
        sourceUserId_targetUserId: {
          sourceUserId: userId1,
          targetUserId: userId2
        }
      },
      data: { isMatched: false }
    }),
    db.userInteraction.update({
      where: {
        sourceUserId_targetUserId: {
          sourceUserId: userId2,
          targetUserId: userId1
        }
      },
      data: { isMatched: false }
    })
  ]);
}

// Block a user
export async function blockUser(sourceUserId: number, targetUserId: number) {
  return await db.userInteraction.upsert({
    where: {
      sourceUserId_targetUserId: {
        sourceUserId,
        targetUserId
      }
    },
    update: {
      type: "BLOCK",
      isMatched: false
    },
    create: {
      sourceUserId,
      targetUserId,
      type: "BLOCK"
    }
  });
}

// unblock an user
export async function unblockUser(sourceUserId: number, targetUserId: number) {
  // Use delete many so prisma doesn't throw an error if the record doesn't exist
  return await db.userInteraction.deleteMany({
    where: {
      sourceUserId,
      targetUserId,
      type: 'BLOCK'
    }
  });
}