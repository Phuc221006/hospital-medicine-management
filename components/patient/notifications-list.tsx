import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import type { Alert } from "@/lib/types"

interface NotificationsListProps {
  alerts: Alert[]
}

export function NotificationsList({ alerts }: NotificationsListProps) {
  const patientAlerts = alerts.filter(
    (a) => a.type === "expiring" || a.type === "expired"
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icons.bell className="h-5 w-5 text-primary" />
          Thông báo
        </CardTitle>
      </CardHeader>

      <CardContent>
        {patientAlerts.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Icons.bell className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>Không có thông báo mới</p>
          </div>
        ) : (
          <div className="space-y-3">
            {patientAlerts.map((alert, idx) => {
              const key = alert.id ?? `${alert.medicineId}-${alert.createdAt}-${idx}`
              return (
                <div
                  key={key}
                  className={`flex items-start gap-3 rounded-lg border p-4 ${
                    alert.severity === "critical"
                      ? "border-destructive/20 bg-destructive/5"
                      : "border-warning/20 bg-warning/5"
                  }`}
                >
                  {alert.severity === "critical" ? (
                    <Icons.alert className="h-5 w-5 text-destructive mt-0.5" />
                  ) : (
                    <Icons.warning className="h-5 w-5 text-warning-foreground mt-0.5" />
                  )}

                  <div>
                    <p className="font-medium text-foreground">{alert.medicineName}</p>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
