import { db } from "@/lib/db";
import { PaginationOptions } from "@/types";


export async function getAllInterests({ page=1, limit = 10, sortBy= "name", sortOrder="asc"}: PaginationOptions) {
  const skip = (page - 1) * limit;
  
  const totalInterests = await db.interest.count();
  
  const interests = await db.interest.findMany({
    orderBy: { [sortBy]: sortOrder },
    take: limit,
    skip: skip
  });

  return {
    data: interests,
    pagination: {
      page,
      limit,
      totalItems: totalInterests,
      totalPages: Math.ceil(totalInterests / limit)
    }
  }
}

export async function createInterest(name: string) {
  return db.interest.create({
    data: {
      name,
    },
  });
}

export async function findInterestByName(name: string) {
  return db.interest.findFirst({
    where: {
      name,
    },
  });
}

export async function findInterestById(id: number) {
  return db.interest.findUnique({
    where: {
      id,
    },
  });
}

export async function editInterest(id: number, name: string) {
  return db.interest.update({
    where: {
      id,
    },
    data: {
      name,
    },
  });
}

export async function deleteInterest(id: number) {
  return db.interest.delete({
    where: {
      id,
    },
  });
}