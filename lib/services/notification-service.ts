import { apiClient } from "../api-client"
import { API_ENDPOINTS } from "../api-config"

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  isRead: boolean
  createdAt: string
  link?: string
}

export const notificationService = {
  async getNotifications(isRead?: boolean): Promise<Notification[]> {
    return apiClient.get<Notification[]>(API_ENDPOINTS.PATIENT.NOTIFICATIONS, { isRead })
  },

  async markAsRead(id: string): Promise<Notification> {
    return apiClient.patch<Notification>(`${API_ENDPOINTS.PATIENT.NOTIFICATIONS}/${id}/read`)
  },

  async markAllAsRead(): Promise<void> {
    return apiClient.post(`${API_ENDPOINTS.PATIENT.NOTIFICATIONS}/read-all`)
  },

  async getUnreadCount(): Promise<number> {
    const result = await apiClient.get<{ count: number }>(`${API_ENDPOINTS.PATIENT.NOTIFICATIONS}/unread-count`)
    return result.count
  },
}
