import { apiClient } from "../api-client"
import { API_ENDPOINTS } from "../api-config"
import type { Transaction, MedicineBatch } from "../types"

export interface StockImportDetailRequest {
  medicineId: number
  batchNumber: string
  quantity: number
  unitPrice: number
  expiryDate: string
  manufacturingDate?: string
}

export interface StockImportRequest {
  supplierId?: number
  importDate: string // ISO datetime string
  notes?: string
  details: StockImportDetailRequest[]
}

export interface StockExportDetailRequest {
  medicineId: number
  quantity: number
}

export interface StockExportRequest {
  patientId: number
  prescriptionId?: number
  exportDate: string // ISO datetime string
  notes?: string
  details: StockExportDetailRequest[]
}

export interface TransactionFilter {
  type?: "import" | "export"
  medicineId?: string
  startDate?: string
  endDate?: string
  page?: number
  size?: number
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export const stockService = {
  // Stock Imports
  async importStock(data: StockImportRequest): Promise<MedicineBatch> {
    return apiClient.post<MedicineBatch>(API_ENDPOINTS.ADMIN.STOCK_IMPORTS, data)
  },

  async getImports(filter?: TransactionFilter): Promise<PageResponse<Transaction>> {
    return apiClient.get<PageResponse<Transaction>>(
      API_ENDPOINTS.ADMIN.STOCK_IMPORTS,
      filter as Record<string, string | number | boolean | undefined>,
    )
  },

  // Stock Exports
  async exportStock(data: StockExportRequest): Promise<Transaction> {
    return apiClient.post<Transaction>(API_ENDPOINTS.ADMIN.STOCK_EXPORTS, data)
  },

  async getExports(filter?: TransactionFilter): Promise<PageResponse<Transaction>> {
    return apiClient.get<PageResponse<Transaction>>(
      API_ENDPOINTS.ADMIN.STOCK_EXPORTS,
      filter as Record<string, string | number | boolean | undefined>,
    )
  },

  // All Transactions
  async getTransactions(filter?: TransactionFilter): Promise<PageResponse<Transaction>> {
    return apiClient.get<PageResponse<Transaction>>(
      `${API_ENDPOINTS.ADMIN.STOCK_IMPORTS}/all`,
      filter as Record<string, string | number | boolean | undefined>,
    )
  },

  // Quick import from alert
  async quickImport(medicineId: string, quantity: number): Promise<MedicineBatch> {
    return apiClient.post<MedicineBatch>(`${API_ENDPOINTS.ADMIN.STOCK_IMPORTS}/quick`, {
      medicineId: Number(medicineId),
      quantity,
    })
  },
}
