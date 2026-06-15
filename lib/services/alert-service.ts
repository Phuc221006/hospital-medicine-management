import { apiClient } from "../api-client"
import { API_ENDPOINTS } from "../api-config"
import type { Alert, AlertRule } from "../types"

export interface AlertFilter {
  type?: string
  severity?: string
  isRead?: boolean
  page?: number
  size?: number
}

export interface CreateAlertRuleRequest {
  medicineId: string
  minStockThreshold: number
  expiryWarningDays: number
}

export interface UpdateAlertRuleRequest extends Partial<CreateAlertRuleRequest> {
  isActive?: boolean
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export const alertService = {
  // Alerts
  async getAlerts(filter?: AlertFilter): Promise<PageResponse<Alert>> {
    return apiClient.get<PageResponse<Alert>>(
      API_ENDPOINTS.ADMIN.ALERTS,
      filter as Record<string, string | number | boolean | undefined>,
    )
  },

  async markAsRead(id: string): Promise<Alert> {
    return apiClient.patch<Alert>(`${API_ENDPOINTS.ADMIN.ALERTS}/${id}/read`)
  },

  async markAllAsRead(): Promise<void> {
    return apiClient.post(`${API_ENDPOINTS.ADMIN.ALERTS}/read-all`)
  },

  async deleteAlert(id: string): Promise<void> {
    return apiClient.delete(`${API_ENDPOINTS.ADMIN.ALERTS}/${id}`)
  },

  async getUnreadCount(): Promise<number> {
    const result = await apiClient.get<{ count: number }>(`${API_ENDPOINTS.ADMIN.ALERTS}/unread-count`)
    return result.count
  },

  // Alert Rules/Settings
  async getAlertRules(): Promise<AlertRule[]> {
    // Backend returns AlertSettingResponse objects with fields like
    // { id, medicine, minQuantityThreshold, expiryWarningDays, isGlobal, active }
    // Normalize to the frontend AlertRule shape so components can rely on
    // `minStockThreshold` and `isActive` fields.
    const resp = await apiClient.get<any[]>(API_ENDPOINTS.ADMIN.ALERT_SETTINGS)
    return resp.map((item) => ({
      id: String(item.id),
      medicineId: item.medicineId ? String(item.medicineId) : "",
      medicine: item.medicine ?? (item.isGlobal ? "Global Setting" : ""),
      minStockThreshold: item.minQuantityThreshold ?? item.minStockThreshold ?? 10,
      expiryWarningDays: item.expiryWarningDays ?? 30,
      isGlobal: item.isGlobal ?? false,
      isActive: item.active !== false,
    }))
  },

  async createAlertRule(data: CreateAlertRuleRequest): Promise<AlertRule> {
    // Backend uses /medicine endpoint for creating medicine-specific alert settings
    const response = await apiClient.post<any>(`${API_ENDPOINTS.ADMIN.ALERT_SETTINGS}/medicine`, {
      medicineId: Number(data.medicineId),
      minQuantityThreshold: data.minStockThreshold,
      expiryWarningDays: data.expiryWarningDays,
      active: true,
    })
    // Map response to AlertRule format
    return {
      id: String(response.id),
      medicineId: String(response.medicine?.id || data.medicineId),
      medicine: response.medicine || "",
      minStockThreshold: response.minQuantityThreshold || data.minStockThreshold,
      expiryWarningDays: response.expiryWarningDays || data.expiryWarningDays,
      isActive: response.active !== false,
    }
  },

  async updateAlertRule(id: string, data: UpdateAlertRuleRequest): Promise<AlertRule> {
    // Use PUT to update an existing alert rule. Backend supports PUT /admin/alert-settings/{id}
    const payload: Record<string, any> = {}
    if (data.medicineId) payload.medicineId = Number(data.medicineId)
    if (data.minStockThreshold !== undefined) payload.minQuantityThreshold = data.minStockThreshold
    if (data.expiryWarningDays !== undefined) payload.expiryWarningDays = data.expiryWarningDays
    if (data.isActive !== undefined) payload.active = data.isActive

    const response = await apiClient.put<any>(`${API_ENDPOINTS.ADMIN.ALERT_SETTINGS}/${id}`, payload)
    return {
      id: String(response.id),
      medicineId: String(response.medicine?.id || response.medicineId || ""),
      medicine: response.medicine || "",
      minStockThreshold: response.minQuantityThreshold ?? response.minStockThreshold ?? 50,
      expiryWarningDays: response.expiryWarningDays ?? 30,
      isActive: response.active !== false,
    }
  },

  async deleteAlertRule(id: string): Promise<void> {
    // Call backend delete endpoint to permanently remove alert setting
    return apiClient.delete(`${API_ENDPOINTS.ADMIN.ALERT_SETTINGS}/${id}`)
  },

  async toggleAlertRule(id: string, isActive: boolean): Promise<AlertRule> {
    // Toggle rule active state via PUT
    return this.updateAlertRule(id, { isActive })
  },
}
