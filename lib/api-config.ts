// API Configuration for Spring Boot Backend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
// Default WS_URL should include the backend context-path `/api` so handshake targets the correct endpoint
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/api/ws"

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    GOOGLE: "/auth/google",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },
  // Public endpoints (no auth required)
  PUBLIC: {
    MEDICINES: "/medicines",
  },
  // Admin endpoints
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    MEDICINES: "/admin/medicines",
    PATIENTS: "/admin/patients",
    PRESCRIPTIONS: "/admin/prescriptions",
    APPOINTMENTS: "/admin/appointments",
    STOCK_IMPORTS: "/admin/stock-imports",
    STOCK_EXPORTS: "/admin/stock-exports",
    ALERTS: "/admin/alerts",
    ALERT_SETTINGS: "/admin/alert-settings",
    REPORTS: "/admin/reports",
    NOTIFICATIONS: "/admin/notifications",
    ACTIVITY_LOGS: "/admin/activity-logs",
    CATEGORIES: "/admin/categories",
    SUPPLIERS: "/admin/suppliers",
    MEDICINE_REQUESTS: "/admin/medicine-requests",
  },
  // Patient endpoints
  PATIENT: {
    PROFILE: "/patient/profile",
    PRESCRIPTIONS: "/patient/prescriptions",
    APPOINTMENTS: "/patient/appointments",
    NOTIFICATIONS: "/patient/notifications",
    MEDICINE_REQUESTS: "/patient/medicine-requests",
  },
}
