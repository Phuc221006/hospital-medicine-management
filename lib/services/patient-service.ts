import { apiClient } from "../api-client"
import { API_ENDPOINTS } from "../api-config"
import type { PatientInfo, Prescription, Appointment, User } from "../types"

export interface PatientFilter {
  search?: string
  tag?: string
  page?: number
  size?: number
}

export interface UpdateProfileRequest {
  name?: string
  phone?: string
  avatar?: string
}

export interface CreatePatientRequest {
  name: string
  email: string
  phone?: string
  password: string
}

export interface MedicineRequestData {
  medicineId?: string
  medicineName: string
  quantity: number
  reason: string
}

export interface BookAppointmentRequest {
  doctorName: string
  department: string
  date: string
  time: string
  notes?: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export const patientService = {
  // Admin: Manage Patients
  async create(data: CreatePatientRequest): Promise<PatientInfo> {
    const response = await apiClient.post<any>(API_ENDPOINTS.ADMIN.PATIENTS, {
      fullName: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
    })
    return {
      ...response,
      name: response.fullName || response.name || "",
      id: String(response.id),
    }
  },

  async getAll(filter?: PatientFilter): Promise<PageResponse<PatientInfo>> {
    const response = await apiClient.get<PageResponse<any>>(
      API_ENDPOINTS.ADMIN.PATIENTS,
      filter as Record<string, string | number | boolean | undefined>,
    )
    // Map fullName to name for PatientInfo
    return {
      ...response,
      content: response.content.map((p: any) => ({
        ...p,
        name: p.fullName || p.name || "",
        id: String(p.id),
      })),
    }
  },

  async getById(id: string): Promise<PatientInfo> {
    const response = await apiClient.get<any>(`${API_ENDPOINTS.ADMIN.PATIENTS}/${id}`)
    // Map fullName to name for PatientInfo
    return {
      ...response,
      name: response.fullName || response.name || "",
      id: String(response.id),
    }
  },

  async updateById(id: string, data: UpdateProfileRequest): Promise<PatientInfo> {
    const response = await apiClient.put<any>(`${API_ENDPOINTS.ADMIN.PATIENTS}/${id}`, data)
    return {
      ...response,
      name: response.fullName || response.name || "",
      id: String(response.id),
    }
  },

  async deleteById(id: string): Promise<void> {
    return apiClient.delete(`${API_ENDPOINTS.ADMIN.PATIENTS}/${id}`)
  },

  async getPatientPrescriptions(patientId: string): Promise<Prescription[]> {
    return apiClient.get<Prescription[]>(`${API_ENDPOINTS.ADMIN.PATIENTS}/${patientId}/prescriptions`)
  },

  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    return apiClient.get<Appointment[]>(`${API_ENDPOINTS.ADMIN.PATIENTS}/${patientId}/appointments`)
  },

  async addTag(patientId: string, tag: string): Promise<PatientInfo> {
    const response = await apiClient.post<any>(`${API_ENDPOINTS.ADMIN.PATIENTS}/${patientId}/tags`, { tag })
    return {
      ...response,
      name: response.fullName || response.name || "",
      id: String(response.id),
    }
  },

  async removeTag(patientId: string, tag: string): Promise<PatientInfo> {
    const response = await apiClient.delete<any>(`${API_ENDPOINTS.ADMIN.PATIENTS}/${patientId}/tags/${tag}`)
    return {
      ...response,
      name: response.fullName || response.name || "",
      id: String(response.id),
    }
  },

  // Patient: Own Profile
  async getProfile(): Promise<User> {
    return apiClient.get<User>(API_ENDPOINTS.PATIENT.PROFILE)
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    return apiClient.put<User>(API_ENDPOINTS.PATIENT.PROFILE, data)
  },

  async deleteAccount(): Promise<void> {
    return apiClient.delete(`${API_ENDPOINTS.PATIENT.PROFILE}`)
  },

  // Patient: Prescriptions
  async getMyPrescriptions(status?: string): Promise<Prescription[]> {
    const resp = await apiClient.get<any>(API_ENDPOINTS.PATIENT.PRESCRIPTIONS, { status })

    // Backend may return a paged wrapper { content: [...] } or a plain array.
    const list = Array.isArray(resp) ? resp : resp?.content ?? resp?.data ?? []

    // Normalize backend prescription shape -> frontend `Prescription` shape
    return (list as any[]).map((p) => ({
      id: String(p.id),
      patientId: String(p.patientId || p.patientId || p.patient?.id || ""),
      patientName: p.patientName || p.patient?.fullName || p.patient?.name || "",
      doctorName: p.doctorName || "",
      status: (p.status || "").toLowerCase() as any,
      items: (Array.isArray(p.details) ? p.details : p.items || []).map((it: any) => ({
        id: String(it.id),
        medicineId: String(it.medicineId || it.medicine?.id || ""),
        medicineName: it.medicineName || it.medicine?.name || it.name || "",
        dosage: it.dosage || "",
        quantity: it.quantity || 0,
        instructions: it.instructions || "",
      })),
      createdAt: p.createdAt || p.prescriptionDate || "",
      examinationDate: p.prescriptionDate || p.createdAt || "",
      notes: p.notes || "",
    }))
  },

  // Patient: Appointments
  async getMyAppointments(): Promise<Appointment[]> {
    const appointments = await apiClient.get<any[]>(API_ENDPOINTS.PATIENT.APPOINTMENTS)
    // Transform backend format (appointmentDate) to frontend format (date, time)
    return appointments.map((apt: any) => {
      const appointmentDate = apt.appointmentDate ? new Date(apt.appointmentDate) : null
      return {
        id: String(apt.id),
        patientId: String(apt.patient?.id || apt.patientId || ""),
        patientName: apt.patient?.fullName || apt.patientName || "",
        doctorName: apt.doctorName || "",
        date: appointmentDate ? appointmentDate.toISOString().split("T")[0] : "",
        time: appointmentDate ? appointmentDate.toTimeString().slice(0, 5) : "",
        department: apt.department || "",
        status: apt.status?.toLowerCase() || "scheduled",
        notes: apt.notes || "",
      } as Appointment
    })
  },

  async bookAppointment(data: BookAppointmentRequest): Promise<Appointment> {
    const appointment = await apiClient.post<any>(API_ENDPOINTS.PATIENT.APPOINTMENTS, data)
    // Transform backend format to frontend format
    const appointmentDate = appointment.appointmentDate ? new Date(appointment.appointmentDate) : null
    return {
      id: String(appointment.id),
      patientId: String(appointment.patient?.id || appointment.patientId || ""),
      patientName: appointment.patient?.fullName || appointment.patientName || "",
      doctorName: appointment.doctorName || "",
      date: appointmentDate ? appointmentDate.toISOString().split("T")[0] : "",
      time: appointmentDate ? appointmentDate.toTimeString().slice(0, 5) : "",
      department: appointment.department || "",
      status: appointment.status?.toLowerCase() || "scheduled",
      notes: appointment.notes || "",
    } as Appointment
  },

  async cancelAppointment(id: string): Promise<void> {
    return apiClient.delete(`${API_ENDPOINTS.PATIENT.APPOINTMENTS}/${id}`)
  },

  // Patient: Medicine Requests
  async requestMedicine(data: MedicineRequestData): Promise<void> {
    return apiClient.post(API_ENDPOINTS.PATIENT.MEDICINE_REQUESTS, data)
  },

  async getMyRequests(): Promise<MedicineRequestData[]> {
    const requests = await apiClient.get<any[]>(API_ENDPOINTS.PATIENT.MEDICINE_REQUESTS)
    // Transform backend format to frontend format
    return requests.map((req: any) => ({
      id: String(req.id),
      patientId: String(req.patientId),
      patientName: req.patientName || "",
      medicineId: req.medicineId ? String(req.medicineId) : undefined,
      medicineName: req.medicineName || "",
      quantity: req.quantity || 0,
      reason: req.reason || "",
      status: (req.status?.toLowerCase() || "pending") as "pending" | "approved" | "rejected",
      createdAt: req.createdAt || "",
      processedAt: req.processedAt || undefined,
      processedBy: req.processedByName || undefined,
      notes: req.notes || undefined,
    }))
  },
}
