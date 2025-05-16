import {
  createInterest,
  findInterestByName,
} from "@/models/admin/interest.model";
import { ValidationError } from "@/utils/errors";
import { Interest } from "@prisma/client";

export class AdminInterestService {
  static async createInterest(name: string): Promise<Interest> {
    if (!name) {
      throw new ValidationError("Interest name is required");
    }

    const existingInterest = await findInterestByName(name);
    if (existingInterest) {
      throw new ValidationError("Interest already exists");
    }

    return await createInterest(name);
  }
}