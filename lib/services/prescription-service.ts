import { apiClient } from "../api-client"
import { API_ENDPOINTS } from "../api-config"
import type { Prescription } from "../types"

export interface PrescriptionFilter {
  patientId?: string
  status?: string
  startDate?: string
  endDate?: string
  page?: number
  size?: number
}

export interface CreatePrescriptionRequest {
  patientId: string
  doctorName: string
  examinationDate: string
  items: {
    medicineId: string
    dosage: string
    quantity: number
    instructions: string
  }[]
  notes?: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export const prescriptionService = {
  async getAll(filter?: PrescriptionFilter): Promise<PageResponse<Prescription>> {
    return apiClient.get<PageResponse<Prescription>>(
      API_ENDPOINTS.ADMIN.PRESCRIPTIONS,
      filter as Record<string, string | number | boolean | undefined>,
    )
  },

  async getById(id: string): Promise<Prescription> {
    return apiClient.get<Prescription>(`${API_ENDPOINTS.ADMIN.PRESCRIPTIONS}/${id}`)
  },

  async create(data: CreatePrescriptionRequest): Promise<Prescription> {
    return apiClient.post<Prescription>(API_ENDPOINTS.ADMIN.PRESCRIPTIONS, data)
  },

  async updateStatus(id: string, status: string): Promise<Prescription> {
    return apiClient.patch<Prescription>(`${API_ENDPOINTS.ADMIN.PRESCRIPTIONS}/${id}/status`, { status })
  },

  async dispense(id: string): Promise<Prescription> {
    return apiClient.post<Prescription>(`${API_ENDPOINTS.ADMIN.PRESCRIPTIONS}/${id}/dispense`)
  },

  async getPending(): Promise<Prescription[]> {
    return apiClient.get<Prescription[]>(`${API_ENDPOINTS.ADMIN.PRESCRIPTIONS}/pending`)
  },
}
