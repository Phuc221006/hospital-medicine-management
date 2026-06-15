import { apiClient } from "../api-client"
import { API_ENDPOINTS } from "../api-config"
import type { Medicine, MedicineBatch } from "../types"

export interface MedicineFilter {
  search?: string
  category?: string
  supplier?: string
  lowStock?: boolean
  expiringSoon?: boolean
  page?: number
  size?: number
  sortBy?: string
  sortDir?: "asc" | "desc"
}

export interface CreateMedicineRequest {
  code: string
  name: string
  genericName?: string
  categoryId?: number
  supplierId?: number
  unit: string
  price: number
  description?: string
  usageInstructions?: string
  sideEffects?: string
  contraindications?: string
  storageConditions?: string
  requiresPrescription?: boolean
}

export interface UpdateMedicineRequest extends Partial<CreateMedicineRequest> {}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export const medicineService = {
  async getAll(filter?: MedicineFilter): Promise<PageResponse<Medicine>> {
    return apiClient.get<PageResponse<Medicine>>(
      API_ENDPOINTS.ADMIN.MEDICINES,
      filter as Record<string, string | number | boolean | undefined>,
    )
  },

  // Public methods for non-admin users (patients) to fetch medicines
  async getAllPublic(filter?: MedicineFilter): Promise<PageResponse<Medicine>> {
    return apiClient.get<PageResponse<Medicine>>(
      API_ENDPOINTS.PUBLIC.MEDICINES,
      filter as Record<string, string | number | boolean | undefined>,
    )
  },

  async getAllForSelectPublic(): Promise<Medicine[]> {
    return apiClient.get<Medicine[]>(`${API_ENDPOINTS.PUBLIC.MEDICINES}/all`)
  },

  async getById(id: string): Promise<Medicine> {
    return apiClient.get<Medicine>(`${API_ENDPOINTS.ADMIN.MEDICINES}/${id}`)
  },

  async create(data: CreateMedicineRequest): Promise<Medicine> {
    return apiClient.post<Medicine>(API_ENDPOINTS.ADMIN.MEDICINES, data)
  },

  async update(id: string, data: UpdateMedicineRequest): Promise<Medicine> {
    return apiClient.put<Medicine>(`${API_ENDPOINTS.ADMIN.MEDICINES}/${id}`, data)
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${API_ENDPOINTS.ADMIN.MEDICINES}/${id}`)
  },

  async getBatches(medicineId: string): Promise<MedicineBatch[]> {
    return apiClient.get<MedicineBatch[]>(`${API_ENDPOINTS.ADMIN.MEDICINES}/${medicineId}/batches`)
  },

  async getLowStock(): Promise<Medicine[]> {
    return apiClient.get<Medicine[]>(`${API_ENDPOINTS.ADMIN.MEDICINES}/low-stock`)
  },

  async getExpiringSoon(days?: number): Promise<MedicineBatch[]> {
    return apiClient.get<MedicineBatch[]>(`${API_ENDPOINTS.ADMIN.MEDICINES}/expiring-soon`, { days })
  },

  async importCSV(file: File): Promise<{ imported: number; errors: string[] }> {
    const formData = new FormData()
    formData.append("file", file)

    const token = localStorage.getItem("token")
    const response = await fetch(`${API_ENDPOINTS.ADMIN.MEDICINES}/import-csv`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Import failed")
    }

    return response.json()
  },

  async removeExpiredBatches(medicineId: string): Promise<void> {
    return apiClient.delete(`${API_ENDPOINTS.ADMIN.MEDICINES}/${medicineId}/expired-batches`)
  },
}
