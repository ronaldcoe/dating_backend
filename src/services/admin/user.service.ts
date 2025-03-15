import {
  getAllUsers,
  updateUserStatus
} from '@/models/admin/user.model'
import { UserStatus } from '@prisma/client'

export class AdminUserService {
  static async getAllUsers() {
    return getAllUsers()
  }

  static async updateUserStatus(id: number, status: UserStatus) {
    return updateUserStatus(id, status)
  }
}