"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icons } from "@/components/icons"
import type { User } from "@/lib/types"
import { patientService } from "@/lib/services"
import { useToast } from "@/components/ui/use-toast"

interface PatientProfileProps {
  user: User
  onUpdate: (user: User) => void
}

export function PatientProfile({ user, onUpdate }: PatientProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const displayName = user.name || user.fullName || user.email || "User"
  const avatarUrl = user.avatar || user.avatarUrl || "/placeholder.svg"

  const [formData, setFormData] = useState({
    name: displayName,
    phone: user.phone || "",
  })

  const { toast } = useToast()

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const updatedUser = await patientService.updateProfile(formData)
      onUpdate(updatedUser)
      setIsEditing(false)
      toast({
        title: "Thành công",
        description: "Thông tin cá nhân đã được cập nhật",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: displayName,
      phone: user.phone || "",
    })
    setIsEditing(false)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.user className="h-5 w-5 text-primary" />
            Thông tin cá nhân
          </CardTitle>
          <CardDescription>Quản lý thông tin tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="text-lg">{displayName && displayName.length > 0 ? displayName.charAt(0).toUpperCase() : "U"}</AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button variant="outline" size="sm">
                <Icons.upload className="mr-2 h-4 w-4" />
                Đổi ảnh
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              ) : (
                <p className="text-foreground">{displayName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <p className="text-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                />
              ) : (
                <p className="text-foreground">{user.phone || "Chưa cập nhật"}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading && <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />}
                  Lưu thay đổi
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                  Hủy
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Icons.edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.shield className="h-5 w-5 text-primary" />
            Bảo mật
          </CardTitle>
          <CardDescription>Quản lý bảo mật tài khoản</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-foreground">Đăng nhập bằng Google</p>
                <p className="text-sm text-muted-foreground">Tài khoản của bạn được liên kết với Google</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Đăng nhập lần cuối</p>
            <p className="text-sm text-muted-foreground">
              {user.lastLogin ? new Date(user.lastLogin).toLocaleString("vi-VN") : "Không xác định"}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Ngày tạo tài khoản</p>
            <p className="text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString("vi-VN")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
