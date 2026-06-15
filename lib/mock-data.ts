import type {
  User,
  Medicine,
  MedicineBatch,
  Prescription,
  Appointment,
  Transaction,
  Alert,
  AlertRule,
  DashboardKPIs,
  PatientInfo,
} from "./types"

// Mock Users
export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@hospital.vn",
    name: "Nguyễn Văn Admin",
    phone: "0901234567",
    role: "ADMIN",
    createdAt: "2024-01-01",
    lastLogin: "2024-12-01",
  },
  {
    id: "2",
    email: "patient@gmail.com",
    name: "Trần Thị Bệnh Nhân",
    phone: "0912345678",
    role: "PATIENT",
    createdAt: "2024-06-15",
    lastLogin: "2024-12-01",
  },
]

// Mock Medicines
export const mockMedicines: Medicine[] = [
  {
    id: "1",
    name: "Amoxicillin 500mg",
    category: "antibiotic",
    quantity: 150,
    unit: "viên",
    price: 5000,
    supplier: "Dược Hậu Giang",
    description: "Kháng sinh phổ rộng",
    nearestExpiry: "2025-06-15",
    minStock: 50,
    createdAt: "2024-01-01",
    updatedAt: "2024-11-28",
  },
  {
    id: "2",
    name: "Paracetamol 500mg",
    category: "painkiller",
    quantity: 500,
    unit: "viên",
    price: 2000,
    supplier: "Pymepharco",
    description: "Giảm đau, hạ sốt",
    nearestExpiry: "2025-12-01",
    minStock: 100,
    createdAt: "2024-01-01",
    updatedAt: "2024-11-28",
  },
  {
    id: "3",
    name: "Vitamin C 1000mg",
    category: "vitamin",
    quantity: 30,
    unit: "viên",
    price: 3000,
    supplier: "DHG Pharma",
    description: "Bổ sung vitamin C",
    nearestExpiry: "2025-03-20",
    minStock: 50,
    createdAt: "2024-01-01",
    updatedAt: "2024-11-28",
  },
  {
    id: "4",
    name: "Omeprazole 20mg",
    category: "digestive",
    quantity: 200,
    unit: "viên",
    price: 8000,
    supplier: "Traphaco",
    description: "Điều trị viêm loét dạ dày",
    nearestExpiry: "2025-08-10",
    minStock: 40,
    createdAt: "2024-02-01",
    updatedAt: "2024-11-28",
  },
  {
    id: "5",
    name: "Amlodipine 5mg",
    category: "cardiovascular",
    quantity: 15,
    unit: "viên",
    price: 12000,
    supplier: "Bidiphar",
    description: "Điều trị tăng huyết áp",
    nearestExpiry: "2024-12-15",
    minStock: 30,
    createdAt: "2024-03-01",
    updatedAt: "2024-11-28",
  },
  {
    id: "6",
    name: "Metformin 850mg",
    category: "other",
    quantity: 80,
    unit: "viên",
    price: 6000,
    supplier: "Imexpharm",
    description: "Điều trị tiểu đường",
    nearestExpiry: "2025-09-30",
    minStock: 40,
    createdAt: "2024-04-01",
    updatedAt: "2024-11-28",
  },
]

// Mock Medicine Batches
export const mockBatches: MedicineBatch[] = [
  {
    id: "1",
    medicineId: "1",
    medicineName: "Amoxicillin 500mg",
    quantity: 100,
    importDate: "2024-11-01",
    expiryDate: "2025-06-15",
    batchNumber: "AMX-2024-001",
    supplier: "Dược Hậu Giang",
    price: 5000,
  },
  {
    id: "2",
    medicineId: "2",
    medicineName: "Paracetamol 500mg",
    quantity: 300,
    importDate: "2024-11-15",
    expiryDate: "2025-12-01",
    batchNumber: "PCT-2024-002",
    supplier: "Pymepharco",
    price: 2000,
  },
]

// Mock Prescriptions
export const mockPrescriptions: Prescription[] = [
  {
    id: "1",
    patientId: "2",
    patientName: "Trần Thị Bệnh Nhân",
    doctorName: "BS. Nguyễn Văn A",
    status: "pending",
    items: [
      {
        id: "1",
        medicineId: "1",
        medicineName: "Amoxicillin 500mg",
        dosage: "500mg x 2 lần/ngày",
        quantity: 14,
        instructions: "Uống sau ăn",
      },
      {
        id: "2",
        medicineId: "2",
        medicineName: "Paracetamol 500mg",
        dosage: "500mg khi sốt",
        quantity: 10,
        instructions: "Uống khi sốt > 38.5°C",
      },
    ],
    createdAt: "2024-11-28",
    examinationDate: "2024-11-28",
    notes: "Tái khám sau 7 ngày",
  },
  {
    id: "2",
    patientId: "2",
    patientName: "Trần Thị Bệnh Nhân",
    doctorName: "BS. Lê Thị B",
    status: "dispensed",
    items: [
      {
        id: "3",
        medicineId: "3",
        medicineName: "Vitamin C 1000mg",
        dosage: "1 viên/ngày",
        quantity: 30,
        instructions: "Uống sau ăn sáng",
      },
    ],
    createdAt: "2024-11-20",
    examinationDate: "2024-11-20",
  },
  {
    id: "3",
    patientId: "2",
    patientName: "Trần Thị Bệnh Nhân",
    doctorName: "BS. Phạm Văn C",
    status: "expired",
    items: [
      {
        id: "4",
        medicineId: "4",
        medicineName: "Omeprazole 20mg",
        dosage: "20mg x 1 lần/ngày",
        quantity: 14,
        instructions: "Uống trước ăn 30 phút",
      },
    ],
    createdAt: "2024-10-15",
    examinationDate: "2024-10-15",
  },
]

// Mock Appointments
export const mockAppointments: Appointment[] = [
  {
    id: "1",
    patientId: "2",
    patientName: "Trần Thị Bệnh Nhân",
    doctorName: "BS. Nguyễn Văn A",
    date: "2024-12-05",
    time: "09:00",
    department: "Nội khoa",
    status: "scheduled",
    notes: "Tái khám theo đơn thuốc",
  },
  {
    id: "2",
    patientId: "2",
    patientName: "Trần Thị Bệnh Nhân",
    doctorName: "BS. Lê Thị B",
    date: "2024-12-10",
    time: "14:00",
    department: "Dinh dưỡng",
    status: "scheduled",
  },
  {
    id: "3",
    patientId: "2",
    patientName: "Trần Thị Bệnh Nhân",
    doctorName: "BS. Phạm Văn C",
    date: "2024-11-20",
    time: "10:30",
    department: "Tiêu hóa",
    status: "completed",
  },
]

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "import",
    medicineId: "1",
    medicineName: "Amoxicillin 500mg",
    quantity: 100,
    date: "2024-11-28",
    userId: "1",
    userName: "Nguyễn Văn Admin",
    batchNumber: "AMX-2024-001",
    notes: "Nhập hàng định kỳ",
  },
  {
    id: "2",
    type: "export",
    medicineId: "2",
    medicineName: "Paracetamol 500mg",
    quantity: 10,
    date: "2024-11-28",
    userId: "1",
    userName: "Nguyễn Văn Admin",
    patientId: "2",
    patientName: "Trần Thị Bệnh Nhân",
    notes: "Phát theo đơn thuốc #1",
  },
  {
    id: "3",
    type: "import",
    medicineId: "3",
    medicineName: "Vitamin C 1000mg",
    quantity: 50,
    date: "2024-11-27",
    userId: "1",
    userName: "Nguyễn Văn Admin",
    batchNumber: "VTC-2024-003",
  },
]

// Mock Alerts
export const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "low_stock",
    medicineId: "5",
    medicineName: "Amlodipine 5mg",
    message: "Thuốc sắp hết (còn 15 viên, ngưỡng: 30)",
    severity: "warning",
    createdAt: "2024-11-28",
    isRead: false,
  },
  {
    id: "2",
    type: "expiring",
    medicineId: "5",
    medicineName: "Amlodipine 5mg",
    message: "Thuốc sắp hết hạn (15/12/2024)",
    severity: "critical",
    createdAt: "2024-11-28",
    isRead: false,
  },
  {
    id: "3",
    type: "low_stock",
    medicineId: "3",
    medicineName: "Vitamin C 1000mg",
    message: "Thuốc sắp hết (còn 30 viên, ngưỡng: 50)",
    severity: "warning",
    createdAt: "2024-11-27",
    isRead: true,
  },
]

// Mock Alert Rules
export const mockAlertRules: AlertRule[] = [
  {
    id: "1",
    medicineId: "1",
    medicineName: "Amoxicillin 500mg",
    minStockThreshold: 50,
    expiryWarningDays: 30,
    isActive: true,
  },
  {
    id: "2",
    medicineId: "2",
    medicineName: "Paracetamol 500mg",
    minStockThreshold: 100,
    expiryWarningDays: 60,
    isActive: true,
  },
  {
    id: "3",
    medicineId: "5",
    medicineName: "Amlodipine 5mg",
    minStockThreshold: 30,
    expiryWarningDays: 30,
    isActive: true,
  },
]

// Mock Dashboard KPIs
export const mockDashboardKPIs: DashboardKPIs = {
  totalMedicines: 6,
  lowStockCount: 2,
  expiredCount: 1,
  todayImports: 2,
  totalPatients: 45,
  pendingPrescriptions: 8,
}

// Mock Patients for Admin
export const mockPatients: PatientInfo[] = [
  {
    id: "2",
    name: "Trần Thị Bệnh Nhân",
    email: "patient@gmail.com",
    phone: "0912345678",
    prescriptionCount: 3,
    lastVisit: "2024-11-28",
    tags: ["Nội khoa", "Định kỳ"],
  },
  {
    id: "3",
    name: "Lê Văn Khỏe",
    email: "levankhoe@gmail.com",
    phone: "0923456789",
    prescriptionCount: 5,
    lastVisit: "2024-11-25",
    tags: ["Tim mạch"],
  },
  {
    id: "4",
    name: "Phạm Thị Lan",
    email: "phamlan@gmail.com",
    phone: "0934567890",
    prescriptionCount: 2,
    lastVisit: "2024-11-20",
  },
  {
    id: "5",
    name: "Hoàng Minh Tuấn",
    email: "tuanhoang@gmail.com",
    phone: "0945678901",
    prescriptionCount: 1,
    lastVisit: "2024-11-15",
    tags: ["Mới"],
  },
]

// Category labels in Vietnamese
export const categoryLabels: Record<string, string> = {
  antibiotic: "Kháng sinh",
  painkiller: "Giảm đau",
  vitamin: "Vitamin",
  cardiovascular: "Tim mạch",
  digestive: "Tiêu hóa",
  other: "Khác",
}

// Status labels in Vietnamese
export const statusLabels: Record<string, string> = {
  pending: "Đang chờ",
  dispensed: "Đã cấp",
  expired: "Hết hạn",
  scheduled: "Đã đặt",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
}
