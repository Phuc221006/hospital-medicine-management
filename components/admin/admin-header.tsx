"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"
import type { User, Alert } from "@/lib/types"
import { useRouter } from "next/navigation"

interface AdminHeaderProps {
  user: User
  alerts?: Alert[]
  onLogout: () => void
}

export function AdminHeader({ user, alerts, onLogout }: AdminHeaderProps) {
  const router = useRouter()
  const displayName = user?.name ?? user?.fullName ?? user?.email ?? ""
  const safeAlerts = alerts ?? []
  const unreadAlerts = safeAlerts.filter((a) => !a.isRead)

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div className="relative w-96">
        <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Tìm kiếm thuốc, bệnh nhân..." className="pl-9 bg-muted/50" />
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Icons.bell className="h-5 w-5" />
              {unreadAlerts.length > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {unreadAlerts.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(safeAlerts || []).slice(0, 5).map((alert, idx) => {
              const key = alert.id ?? `${alert.medicineId}-${alert.createdAt}-${idx}`
              return (
                <DropdownMenuItem key={key} className="flex flex-col items-start gap-1 p-3">
                <div className="flex items-center gap-2">
                  {alert.severity === "critical" ? (
                    <Icons.alert className="h-4 w-4 text-destructive" />
                  ) : (
                    <Icons.warning className="h-4 w-4 text-warning-foreground" />
                  )}
                  <span className="font-medium">{alert.medicineName}</span>
                </div>
                <span className="text-sm text-muted-foreground">{alert.message}</span>
              </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {displayName ? displayName.charAt(0).toUpperCase() : "?"}
                  </AvatarFallback>
              </Avatar>
                <span className="hidden md:inline-block">{displayName}</span>
              <Icons.chevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <Icons.user className="mr-2 h-4 w-4" />
              Hồ sơ cá nhân
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icons.settings className="mr-2 h-4 w-4" />
              Cài đặt
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-destructive">
              <Icons.logout className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
