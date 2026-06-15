import { apiClient } from "../api-client"
import { API_ENDPOINTS } from "../api-config"
import type { SupplierOption } from "../types"

export const supplierService = {
  async getAll(): Promise<SupplierOption[]> {
    return apiClient.get<SupplierOption[]>(`${API_ENDPOINTS.ADMIN.SUPPLIERS || "/admin/suppliers"}/all`)
  },
}

