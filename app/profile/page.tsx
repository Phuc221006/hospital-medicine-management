"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PatientProfile } from "@/components/patient/patient-profile"
import type { User } from "@/lib/types"
import { patientService } from "@/lib/services/patient-service"
import { authService } from "@/lib/services/auth-service"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    let mounted = true
    patientService
      .getProfile()
      .then((u) => mounted && setUser(u))
      .catch((err) => {
        console.error("Failed to load profile:", err)
        toast({ title: "Lỗi", description: "Không thể tải hồ sơ. Vui lòng thử lại.", variant: "destructive" })
      })
    return () => {
      mounted = false
    }
  }, [toast])

  const handleUpdate = (updated: User) => {
    setUser(updated)
    toast({ title: "Thành công", description: "Hồ sơ đã được cập nhật" })
  }

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa tài khoản của mình? Hành động này không thể hoàn tác.")) return
    try {
      setIsDeleting(true)
      await patientService.deleteAccount()
      await authService.logout()
      authService.clearTokens()
      toast({ title: "Đã xóa", description: "Tài khoản của bạn đã bị xóa" })
      router.push("/")
    } catch (error) {
      console.error("Failed to delete account:", error)
      toast({ title: "Lỗi", description: "Không thể xóa tài khoản. Vui lòng thử lại.", variant: "destructive" })
    } finally {
      setIsDeleting(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icons.refresh className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <PatientProfile user={user} onUpdate={handleUpdate} />

      <div className="mt-6">
        <div className="rounded-md border p-4">
          <a href="/" className="text-blue-600 hover:underline">Quay lại trang chủ</a>
        </div>
      </div>
    </main>
  )
}
