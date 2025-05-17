import {
  findInterestById,
  findInterestByName,
} from "@/models/admin/interest.model";

export async function validateInterest(name: string, id?: number) {
  if (id) {
    const existingInterest = findInterestById(id);
    if (!existingInterest) {
      return {
        success: false,
        message: "Interest not found",
      }
    }
  }

  if (!name) {
    return {
      success: false,
      message: "Interest name is required",
    }
  }

  const existingInterest = await findInterestByName(name);
  console.log("existingInterest", existingInterest);
  if (existingInterest) {
    return {
      success: false,
      message: "Interest already exists",
    }
  }

  return {
    success: true,
    message: "Interest is valid",
  }
}