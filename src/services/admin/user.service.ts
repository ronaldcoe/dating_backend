import {
  getAllUsers,
  getUserById,
  updateUserStatus
} from '@/models/admin/user.model'
import { UserStatus } from '@prisma/client'

export class AdminUserService {
  static async getAllUsers(page: number, limit: number) {
    return await getAllUsers({page, limit})
  }

  static async getUserById(id: number) {
    return await getUserById(id)
  }

  static async updateUserStatus(id: number, status: UserStatus) {
    return updateUserStatus(id, status)
  }
}