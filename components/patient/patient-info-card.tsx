import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import type { User } from "@/lib/types"

interface PatientInfoCardProps {
  user: User
}

export function PatientInfoCard({ user }: PatientInfoCardProps) {
  const displayName = user.name || user.fullName || user.email || "User"
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icons.user className="h-5 w-5 text-primary" />
          Thông tin cá nhân
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <span className="text-2xl font-bold text-primary">{displayName && displayName.length > 0 ? displayName.charAt(0).toUpperCase() : "U"}</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{displayName}</h3>
            <p className="text-sm text-muted-foreground">Bệnh nhân</p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <Icons.mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Icons.phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{user.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Icons.calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Tham gia từ: {new Date(user.createdAt).toLocaleDateString("vi-VN")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
