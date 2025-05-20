import {
  getAllInterests,
  createInterest,
  editInterest
} from "@/models/admin/interest.model";
import  { validateInterest } from "@/utils/admin/interest.utils";
import { ValidationError } from "@/utils/errors";
import { Interest } from "@prisma/client";
import { PaginationOptions } from "@/types";

export class AdminInterestService {
  static async getAllInterests(page, limit, sortBy, sortOrder) {
    return await getAllInterests({ page, limit, sortBy, sortOrder });
  }

  static async createInterest(name: string): Promise<Interest> {
    if (!name) {
      throw new ValidationError("Interest name is required");
    }

    const isValid = await validateInterest(name);

    if (isValid.success === false) {
      throw new ValidationError(isValid.message);
    }

    return await createInterest(name);
  }

  static async editInterest(id: number, name: string): Promise<Interest> {
    if (!name) {
      throw new ValidationError("Interest name is required");
    }

    const isValid = await validateInterest(name, id);

    if (isValid.success === false) {
      throw new ValidationError(isValid.message);
    }

    return await editInterest(id, name);
  }
}