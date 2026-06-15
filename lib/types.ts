// User types
export type UserRole = "ADMIN" | "PATIENT"

export interface User {
  id: string
  email: string
  // backend uses `fullName` while some parts expect `name` — accept either
  name?: string
  fullName?: string
  phone?: string
  // backend uses `avatarUrl` while some parts expect `avatar`
  avatar?: string
  avatarUrl?: string
  role: UserRole
  createdAt: string
  lastLogin?: string
}

export interface AuthResponse {
  // backend may return either `accessToken` or `token` depending on API
  accessToken?: string
  token?: string
  refreshToken?: string
  user: User
}

// Medicine types
export type MedicineCategory = "antibiotic" | "painkiller" | "vitamin" | "cardiovascular" | "digestive" | "other"

export interface Medicine {
  id: string | number
  code: string
  name: string
  genericName?: string
  categoryId?: number
  categoryName?: string
  category?: MedicineCategory // For backward compatibility
  supplierId?: number
  supplierName?: string
  supplier?: string // For backward compatibility
  quantity?: number // For backward compatibility
  totalStock?: number
  unit: string
  price: number
  description?: string
  usageInstructions?: string
  sideEffects?: string
  contraindications?: string
  storageConditions?: string
  requiresPrescription?: boolean
  active?: boolean
  nearestExpiry?: string // For backward compatibility
  nearestExpiryDate?: string
  minStock?: number
  createdAt: string
  updatedAt: string
}

export interface MedicineCategoryOption {
  id: number
  name: string
  description?: string
}

export interface SupplierOption {
  id: number
  name: string
  address?: string
  phone?: string
  email?: string
}

export interface MedicineBatch {
  id: string
  medicineId: string
  medicineName: string
  quantity: number
  remainingQuantity: number
  importDate: string
  expiryDate: string
  batchNumber?: string
  supplier: string
  price: number
}

// Prescription types
export type PrescriptionStatus = "pending" | "dispensed" | "expired"

export interface PrescriptionItem {
  id: string
  medicineId: string
  medicineName: string
  dosage: string
  quantity: number
  instructions: string
}

export interface Prescription {
  id: string
  patientId: string
  patientName: string
  doctorName: string
  status: PrescriptionStatus
  items: PrescriptionItem[]
  createdAt: string
  examinationDate: string
  notes?: string
}

// Appointment types
export interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorName: string
  date: string
  time: string
  department: string
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
}

// Transaction types
export type TransactionType = "import" | "export"

export interface Transaction {
  id: string
  type: TransactionType
  medicineId: string
  medicineName: string
  quantity: number
  date: string
  userId: string
  userName: string
  patientId?: string
  patientName?: string
  batchNumber?: string
  notes?: string
}

// Alert types
export type AlertType = "low_stock" | "expiring" | "expired"

export interface Alert {
  id: string
  type: AlertType
  medicineId: string
  medicineName: string
  message: string
  severity: "warning" | "critical"
  createdAt: string
  isRead: boolean
}

// Alert Rule types
export interface AlertRule {
  id: string
  medicineId: string
  medicine: string
  minStockThreshold: number
  expiryWarningDays: number
  isActive: boolean
}

// Dashboard KPIs
export interface DashboardKPIs {
  totalMedicines: number
  lowStockCount: number
  expiredCount: number
  expiringSoonCount?: number
  todayImportsCount?: number
  todayImports?: number
  totalPatients: number
  pendingPrescriptions?: number
  stockByCategory?: Record<string, number>
  recentActivities?: Array<{
    id: number
    userId: number
    userName: string
    action: string
    entityType: string
    entityId: number
    description: string
    createdAt: string
  }>
}

// Patient for admin view
export interface PatientInfo {
  id: string
  name: string
  email: string
  phone?: string
  prescriptionCount: number
  lastVisit?: string
  tags?: string[]
}

// Report types
export interface ReportFilter {
  startDate: string
  endDate: string
  type?: "inventory" | "transactions" | "expiring"
}

// Medicine Request types (for patient)
export interface MedicineRequest {
  id: string
  patientId: string
  patientName: string
  medicineId?: string
  medicineName: string
  quantity: number
  reason: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  processedAt?: string
  processedBy?: string
  notes?: string
}

// Activity Log types
export interface ActivityLog {
  id: string
  userId: string
  userName: string
  action: string
  entityType: string
  entityId: string
  details?: string
  ipAddress?: string
  createdAt: string
}

// WebSocket Notification
export interface WSNotification {
  id: string
  type: "info" | "warning" | "success" | "error"
  title: string
  message: string
  timestamp: string
}
