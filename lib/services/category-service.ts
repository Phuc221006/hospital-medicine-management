import { apiClient } from "../api-client"
import { API_ENDPOINTS } from "../api-config"
import type { MedicineCategoryOption } from "../types"

export const categoryService = {
  async getAll(): Promise<MedicineCategoryOption[]> {
    return apiClient.get<MedicineCategoryOption[]>(API_ENDPOINTS.ADMIN.CATEGORIES || "/admin/categories")
  },
}

