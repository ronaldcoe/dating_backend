import { db } from "@/lib/db";


export async function getAllInterests({ page=1, limit = 10}: {page?:number, limit?: number}={}) {
  const skip = (page - 1) * limit;
  
  const totalInterests = await db.interest.count();
  
  const interests = db.interest.findMany({
    orderBy: { name: 'asc' },
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