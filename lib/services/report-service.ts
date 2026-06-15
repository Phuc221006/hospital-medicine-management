import { API_BASE_URL } from "../api-config"
import { API_ENDPOINTS } from "../api-config"

export interface ReportParams {
  startDate: string
  endDate: string
  type: "inventory" | "transactions" | "expiring" | "prescriptions"
  format: "csv" | "pdf"
}

export const reportService = {
  async downloadReport(params: ReportParams): Promise<void> {
    const token = localStorage.getItem("token")
    const searchParams = new URLSearchParams(params as Record<string, string>)

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.REPORTS}/download?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to download report")
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `report-${params.type}-${params.startDate}-${params.endDate}.${params.format}`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  },

  async getReportPreview(params: Omit<ReportParams, "format">): Promise<unknown[]> {
    const token = localStorage.getItem("token")
    const searchParams = new URLSearchParams(params as Record<string, string>)

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.REPORTS}/preview?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to get report preview")
    }

    return response.json()
  },
}
