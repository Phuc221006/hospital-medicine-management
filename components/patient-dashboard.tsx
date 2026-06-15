"use client"

import { useState, useEffect } from "react"
import { PatientHeader } from "@/components/patient/patient-header"
import { PatientInfoCard } from "@/components/patient/patient-info-card"
import { PrescriptionsList } from "@/components/patient/prescriptions-list"
import { AppointmentsList } from "@/components/patient/appointments-list"
import { NotificationsList } from "@/components/patient/notifications-list"
import { PatientProfile } from "@/components/patient/patient-profile"
import { MedicineRequestDialog } from "@/components/patient/medicine-request-dialog"
import { MedicineRequestsList } from "@/components/patient/medicine-requests-list"
import { BookAppointmentDialog } from "@/components/patient/book-appointment-dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icons } from "@/components/icons"
import type { User, Prescription, Appointment, Alert, MedicineRequest, Medicine } from "@/lib/types"
import { patientService, notificationService, medicineService } from "@/lib/services"
import { useWebSocket } from "@/lib/hooks/use-websocket"
import { useToast } from "@/components/ui/use-toast"

interface PatientDashboardProps {
  user: User
  onLogout: () => void
  onUpdateUser: (user: User) => void
}

export function PatientDashboard({ user, onLogout, onUpdateUser }: PatientDashboardProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [medicineRequests, setMedicineRequests] = useState<MedicineRequest[]>([])
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [notifications, setNotifications] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [isMedicineDialogOpen, setIsMedicineDialogOpen] = useState(false)
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false)

  const { subscribe } = useWebSocket()
  const { toast } = useToast()
  const displayName = user.name || user.fullName || user.email || "User"

  useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true)
        try {
          const [prescriptionsData, appointmentsData, medicineRequestsData, notificationsData] = await Promise.all([
              patientService.getMyPrescriptions(),
              patientService.getMyAppointments(),
              patientService.getMyRequests(),
              notificationService.getNotifications(),
            ])
          // fetch medicines for the request dialog (list of medicines available in cabinet)
          try {
            const medsResp = await medicineService.getAllPublic({ size: 200 })
            const medsList = Array.isArray(medsResp) ? medsResp : (medsResp as any)?.content ?? []
            setMedicines(medsList)
          } catch (err) {
            console.warn("Failed to load medicines for request dialog", err)
            setMedicines([])
          }
        // Normalize prescriptions and appointments to arrays — backend may return
        // an array, or a paged/wrapped object with `.content` or `.data`.
        const rawPrescriptions = Array.isArray(prescriptionsData)
          ? prescriptionsData
          : (prescriptionsData as any)?.data ?? (prescriptionsData as any)?.content ?? []

        const rawAppointments = Array.isArray(appointmentsData)
          ? appointmentsData
          : (appointmentsData as any)?.data ?? (appointmentsData as any)?.content ?? []

          setPrescriptions(rawPrescriptions)
          setAppointments(rawAppointments)
          // Medicine requests are already transformed in the service
          setMedicineRequests(Array.isArray(medicineRequestsData) ? medicineRequestsData : [])
          // Normalize notificationsData: backend may return an array, a wrapper { data: [...] },
        // or a paged response { content: [...] }. Accept all shapes.
        const rawNotifications = Array.isArray(notificationsData)
          ? notificationsData
          : (notificationsData as any)?.data ?? (notificationsData as any)?.content ?? []

        setNotifications(
          (rawNotifications || []).map((n: any) => ({
            id: n.id,
            type: "low_stock" as const,
            medicineId: "",
            medicineName: "",
            message: n.message,
            severity: n.type === "error" ? ("critical" as const) : ("warning" as const),
            createdAt: n.createdAt,
            isRead: n.isRead,
          })),
        )
      } catch (error) {
        console.error("Failed to fetch patient data:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu. Vui lòng thử lại.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  useEffect(() => {
    const unsubPrescription = subscribe("PRESCRIPTION_UPDATE", (message) => {
      const updatedPrescription = message.payload as Prescription
      setPrescriptions((prev) => prev.map((p) => (p.id === updatedPrescription.id ? updatedPrescription : p)))
      toast({
        title: "Đơn thuốc được cập nhật",
        description: `Đơn thuốc #${updatedPrescription.id} đã được cập nhật`,
      })
    })

    const unsubAppointment = subscribe("APPOINTMENT_UPDATE", (message) => {
      const updatedAppointment = message.payload as Appointment
      setAppointments((prev) => prev.map((a) => (a.id === updatedAppointment.id ? updatedAppointment : a)))
    })

    const unsubNotification = subscribe("NOTIFICATION", (message) => {
      toast({
        title: (message.payload as { title: string }).title,
        description: (message.payload as { message: string }).message,
      })
    })

    return () => {
      unsubPrescription()
      unsubAppointment()
      unsubNotification()
    }
  }, [subscribe, toast])

  const handleMedicineRequest = async (data: { medicineName: string; quantity: number; reason: string }) => {
    try {
      await patientService.requestMedicine(data)
      // Refresh medicine requests list
      const requests = await patientService.getMyRequests()
      setMedicineRequests(requests)
      toast({
        title: "Thành công",
        description: "Yêu cầu bổ sung thuốc đã được gửi",
      })
      setIsMedicineDialogOpen(false)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể gửi yêu cầu. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const handleBookAppointment = async (data: {
    doctorName: string
    department: string
    date: string
    time: string
    notes?: string
  }) => {
    try {
      const newAppointment = await patientService.bookAppointment(data)
      setAppointments((prev) => [...prev, newAppointment])
      toast({
        title: "Thành công",
        description: "Đã đặt lịch khám thành công",
      })
      setIsAppointmentDialogOpen(false)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể đặt lịch khám. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const handleCancelAppointment = async (id: string) => {
    try {
      await patientService.cancelAppointment(id)
      setAppointments((prev) => prev.filter((a) => a.id !== id))
      toast({
        title: "Thành công",
        description: "Đã hủy lịch khám",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể hủy lịch khám. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PatientHeader user={user} onLogout={onLogout} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Xin chào, {displayName}!</h1>
            <p className="text-muted-foreground">Quản lý đơn thuốc và lịch khám của bạn</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-transparent" onClick={() => setIsAppointmentDialogOpen(true)}>
              <Icons.calendar className="h-4 w-4" />
              Đặt lịch khám
            </Button>
            <Button className="gap-2" onClick={() => setIsMedicineDialogOpen(true)}>
              <Icons.plus className="h-4 w-4" />
              Yêu cầu bổ sung thuốc
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="prescriptions">Đơn thuốc</TabsTrigger>
            <TabsTrigger value="appointments">Lịch khám</TabsTrigger>
            <TabsTrigger value="medicine-requests">Yêu cầu thuốc</TabsTrigger>
            <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Icons.refresh className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6">
                  <PatientInfoCard user={user} />
                  <NotificationsList alerts={notifications} />
                </div>
                <div className="space-y-6 lg:col-span-2">
                  <PrescriptionsList prescriptions={prescriptions.slice(0, 3)} />
                  <AppointmentsList appointments={appointments.slice(0, 3)} onCancel={handleCancelAppointment} />
                  <MedicineRequestsList requests={medicineRequests.slice(0, 3)} />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="prescriptions">
            <PrescriptionsList prescriptions={prescriptions} showSearch />
          </TabsContent>

          <TabsContent value="appointments">
            <AppointmentsList appointments={appointments} showAll onCancel={handleCancelAppointment} />
          </TabsContent>

          <TabsContent value="medicine-requests">
            <MedicineRequestsList requests={medicineRequests} showAll />
          </TabsContent>

          <TabsContent value="profile">
            <PatientProfile user={user} onUpdate={onUpdateUser} />
          </TabsContent>
        </Tabs>
      </main>

      <MedicineRequestDialog
        open={isMedicineDialogOpen}
        onOpenChange={setIsMedicineDialogOpen}
        onSubmit={handleMedicineRequest}
        medicines={medicines.map((m) => ({ id: m.id, name: m.name }))}
      />

      <BookAppointmentDialog
        open={isAppointmentDialogOpen}
        onOpenChange={setIsAppointmentDialogOpen}
        onSubmit={handleBookAppointment}
      />
    </div>
  )
}
