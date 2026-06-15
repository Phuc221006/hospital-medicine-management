"use client"

import { useState, useEffect, useCallback } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import type { AdminPage } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { DashboardOverview } from "@/components/admin/dashboard-overview"
import { MedicinesManagement } from "@/components/admin/medicines-management"
import { PatientsManagement } from "@/components/admin/patients-management"
import { ImportMedicine } from "@/components/admin/import-medicine"
import { ExportMedicine } from "@/components/admin/export-medicine"
import { ReportsPage } from "@/components/admin/reports-page"
import { AlertsManagement } from "@/components/admin/alerts-management"
import { MedicineRequestsManagement } from "@/components/admin/medicine-requests-management"
import type {
  User,
  Medicine,
  Transaction,
  Alert,
  AlertRule,
  DashboardKPIs,
  PatientInfo,
  Prescription,
} from "@/lib/types"
import {
  medicineService,
  stockService,
  alertService,
  dashboardService,
  patientService,
  prescriptionService,
} from "@/lib/services"
import { useWebSocket } from "@/lib/hooks/use-websocket"
import { useToast } from "@/components/ui/use-toast"


interface AdminDashboardProps {
  user: User
  onLogout: () => void
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState<AdminPage>("dashboard")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // State for data management
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [alertRules, setAlertRules] = useState<AlertRule[]>([])
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [patients, setPatients] = useState<PatientInfo[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])

  const { subscribe } = useWebSocket()
  const { toast } = useToast()

  // Load data based on current page
  const fetchPageData = useCallback(
    async (page: AdminPage) => {
      setIsLoading(true)
      try {
        switch (page) {
          case "dashboard":
            {
              const [kpisRes, medicinesRes, transactionsRes, alertsRes] = await Promise.all([
                dashboardService.getKPIs(),
                medicineService.getAll({ size: 20 }),
                stockService.getTransactions({ size: 10 }),
                alertService.getAlerts({ size: 10 }),
              ])
              setKpis(kpisRes)
              setMedicines(medicinesRes.content)
              setTransactions(transactionsRes.content)
              const alertsArray = Array.isArray(alertsRes) ? alertsRes : alertsRes?.content ?? []
              setAlerts(alertsArray)
            }
            break
          case "medicines":
            {
              const medicinesRes = await medicineService.getAll({ page: 0, size: 20 })
              setMedicines(medicinesRes.content)
            }
            break
          case "patients":
            {
              const [patientsRes, prescriptionsRes] = await Promise.all([
                patientService.getAll({ size: 100 }),
                prescriptionService.getAll({ size: 100 }),
              ])
              setPatients(patientsRes.content)
              setPrescriptions(prescriptionsRes.content)
            }
            break
          case "import":
          case "export":
            {
              const [medicinesRes, patientsRes] = await Promise.all([
                medicineService.getAll({ size: 100 }),
                patientService.getAll({ size: 100 }),
              ])
              setMedicines(medicinesRes.content)
              setPatients(patientsRes.content)
            }
            break
          case "reports":
            {
              const [medicinesRes, transactionsRes] = await Promise.all([
                medicineService.getAll({ size: 100 }),
                stockService.getTransactions({ size: 100 }),
              ])
              setMedicines(medicinesRes.content)
              setTransactions(transactionsRes.content)
            }
            break
          case "alerts":
            {
              const [alertsRes, alertRulesRes, medicinesRes] = await Promise.all([
                alertService.getAlerts({ size: 50 }),
                alertService.getAlertRules(),
                medicineService.getAll({ size: 100 }),
              ])
              const alertsArray = Array.isArray(alertsRes) ? alertsRes : alertsRes?.content ?? []
              setAlerts(alertsArray)
              setAlertRules(alertRulesRes)
              setMedicines(medicinesRes.content)
            }
            break
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu. Vui lòng thử lại.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  // Load initial data for dashboard only
  useEffect(() => {
    fetchPageData("dashboard")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load data when page changes
  useEffect(() => {
    if (currentPage !== "dashboard") {
      fetchPageData(currentPage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  useEffect(() => {
    const unsubAlert = subscribe("ALERT_NEW", (message) => {
      const newAlert = message.payload as Alert
      setAlerts((prev) => [newAlert, ...prev])
      toast({
        title: "Cảnh báo mới",
        description: newAlert.message,
        variant: newAlert.severity === "critical" ? "destructive" : "default",
      })
    })

    const unsubStock = subscribe("STOCK_LOW", (message) => {
      const medicine = message.payload as Medicine
      toast({
        title: "Thuốc sắp hết",
        description: `${medicine.name} còn ${medicine.quantity} ${medicine.unit}`,
        variant: "destructive",
      })
      // Refresh medicines if on medicines page
      if (currentPage === "medicines") {
        medicineService.getAll({ size: 100 }).then((res) => setMedicines(res.content))
      }
    })

    const unsubExpiring = subscribe("STOCK_EXPIRING", (message) => {
      const data = message.payload as { medicineName: string; expiryDate: string }
      toast({
        title: "Thuốc sắp hết hạn",
        description: `${data.medicineName} hết hạn ngày ${new Date(data.expiryDate).toLocaleDateString("vi-VN")}`,
        variant: "destructive",
      })
    })

    return () => {
      unsubAlert()
      unsubStock()
      unsubExpiring()
    }
  }, [subscribe, toast])

  const handleImport = async (data: {
    medicineId: string
    quantity: number
    expiryDate: string
    batchNumber?: string
    supplier: string
    price: number
    importDate?: string
  }) => {
    try {
      // Transform to backend structure
      // Backend expects LocalDateTime for importDate (ISO string format)
      const importDateValue = data.importDate 
        ? `${data.importDate}T00:00:00`
        : new Date().toISOString()
      
      // Backend expects LocalDate for expiryDate (YYYY-MM-DD format)
      const expiryDateValue = data.expiryDate
      
      // Find supplier by name (or use supplierId if provided)
      const medicine = medicines.find(m => m.id === data.medicineId)
      const supplierId = medicine?.supplierId ? Number(medicine.supplierId) : undefined

      // Ensure batchNumber is provided (required by backend)
      if (!data.batchNumber || data.batchNumber.trim() === "") {
        throw new Error("Mã lô là bắt buộc")
      }

      // Ensure price is positive (required by backend)
      if (!data.price || data.price <= 0) {
        throw new Error("Giá nhập phải lớn hơn 0")
      }

      const request = {
        supplierId: supplierId || undefined,
        importDate: importDateValue,
        notes: `Nhập ${data.quantity} ${medicine?.unit || ''} ${medicine?.name || ''}`,
        details: [
          {
            medicineId: Number(data.medicineId),
            batchNumber: data.batchNumber.trim(),
            quantity: data.quantity,
            unitPrice: Number(data.price.toFixed(2)), // Ensure proper decimal format
            expiryDate: expiryDateValue,
          },
        ],
      }

      await stockService.importStock(request)
      toast({
        title: "Thành công",
        description: "Đã nhập thuốc vào kho",
      })
      // Refresh medicines only
      const medicinesRes = await medicineService.getAll({ size: 100 })
      setMedicines(medicinesRes.content)
    } catch (error: any) {
      console.error("Import error:", error)
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể nhập thuốc. Vui lòng thử lại.",
        variant: "destructive",
      })
      throw error // Re-throw to let component handle it
    }
  }

  const handleExport = async (data: {
    patientId: string
    items: { medicineId: string; quantity: number }[]
    notes?: string
  }) => {
    try {
      // Validate input
      if (!data.patientId) {
        throw new Error("Vui lòng chọn bệnh nhân")
      }
      if (!data.items || data.items.length === 0) {
        throw new Error("Vui lòng thêm ít nhất một thuốc")
      }

      // Transform to backend structure
      // Backend expects LocalDateTime for exportDate (ISO string format)
      const exportDate = new Date().toISOString()
      
      const request = {
        patientId: Number(data.patientId),
        exportDate,
        notes: data.notes || undefined,
        details: data.items.map(item => ({
          medicineId: Number(item.medicineId),
          quantity: Number(item.quantity),
        })),
      }

      await stockService.exportStock(request)
      toast({
        title: "Thành công",
        description: "Đã xuất thuốc",
      })
      // Refresh medicines only
      const medicinesRes = await medicineService.getAll({ size: 100 })
      setMedicines(medicinesRes.content)
    } catch (error: any) {
      console.error("Export error:", error)
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể xuất thuốc. Vui lòng thử lại.",
        variant: "destructive",
      })
      throw error // Re-throw to let component handle it
    }
  }

  const handleMarkAlertRead = async (alertId: string) => {
    try {
      await alertService.markAsRead(alertId)
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a)))
      toast({
        title: "Thành công",
        description: "Đã đánh dấu cảnh báo đã đọc",
      })
    } catch (error: any) {
      // If API fails, still update UI locally
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a)))
      toast({
        title: "Cảnh báo",
        description: error?.message || "Đã cập nhật trạng thái cục bộ",
        variant: "default",
      })
    }
  }

  const handleUpdateMedicines = (updatedMedicines: Medicine[]) => {
    setMedicines(updatedMedicines)
  }

  const handleUpdateAlertRules = (updatedRules: AlertRule[]) => {
    setAlertRules(updatedRules)
  }

  const renderPage = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    switch (currentPage) {
      case "dashboard":
        return <DashboardOverview kpis={kpis!} medicines={medicines} transactions={transactions} />
      case "medicines":
        return <MedicinesManagement medicines={medicines} onUpdate={handleUpdateMedicines} />
      case "patients":
        return <PatientsManagement patients={patients} prescriptions={prescriptions} />
      case "import":
        return <ImportMedicine medicines={medicines} onImport={handleImport} />
      case "export":
        return <ExportMedicine medicines={medicines} patients={patients} onExport={handleExport} />
      case "reports":
        return <ReportsPage medicines={medicines} transactions={transactions} />
      case "alerts":
        return (
          <AlertsManagement
            alerts={alerts}
            alertRules={alertRules}
            medicines={medicines}
            onUpdateRules={handleUpdateAlertRules}
            onMarkRead={handleMarkAlertRead}
          />
        )
      case "medicine-requests":
        return <MedicineRequestsManagement onUpdate={() => fetchPageData("dashboard")} />
      default:
        return null
    }
  }

  const pageTitle: Record<AdminPage, string> = {
    dashboard: "Tổng quan",
    medicines: "Quản lý thuốc",
    patients: "Quản lý bệnh nhân",
    import: "Nhập thuốc",
    export: "Xuất thuốc",
    "medicine-requests": "Yêu cầu thuốc",
    reports: "Báo cáo & Thống kê",
    alerts: "Cảnh báo",
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className="flex flex-1 flex-col">
        <AdminHeader user={user} alerts={alerts} onLogout={onLogout} />

        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">{pageTitle[currentPage]}</h1>
          </div>
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
