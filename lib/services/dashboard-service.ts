import { apiClient } from "../api-client"
import { API_ENDPOINTS } from "../api-config"
import type { DashboardKPIs, Transaction, Medicine } from "../types"

export interface DashboardData {
  kpis: DashboardKPIs
  recentTransactions: Transaction[]
  lowStockMedicines: Medicine[]
  expiringMedicines: Medicine[]
  stockByCategory: { category: string; count: number }[]
  transactionHistory: { date: string; imports: number; exports: number }[]
}

export const dashboardService = {
  async getDashboardData(): Promise<DashboardData> {
    return apiClient.get<DashboardData>(API_ENDPOINTS.ADMIN.DASHBOARD)
  },

  async getKPIs(): Promise<DashboardKPIs> {
    return apiClient.get<DashboardKPIs>(`${API_ENDPOINTS.ADMIN.DASHBOARD}/kpis`)
  },

  async getRecentActivity(limit?: number): Promise<Transaction[]> {
    return apiClient.get<Transaction[]>(`${API_ENDPOINTS.ADMIN.DASHBOARD}/recent-activity`, { limit })
  },

  async getStockByCategory(): Promise<{ category: string; count: number }[]> {
    return apiClient.get<{ category: string; count: number }[]>(`${API_ENDPOINTS.ADMIN.DASHBOARD}/stock-by-category`)
  },

  async getTransactionHistory(days?: number): Promise<{ date: string; imports: number; exports: number }[]> {
    return apiClient.get<{ date: string; imports: number; exports: number }[]>(
      `${API_ENDPOINTS.ADMIN.DASHBOARD}/transaction-history`,
      { days },
    )
  },
}
