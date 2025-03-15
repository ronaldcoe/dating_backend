import {
  getInterests,
  getUserInterests,
  addUserInterest
} from "@/models/interest.model";


export class InteresetService {

  static async getInterests() {
    return getInterests();
  }

  static async getUserInterests(userId: number) {
    return getUserInterests(userId);
  }

  static async addUserInterest(userId: number, interestId: number) {
    return addUserInterest(userId, interestId);
  }
}