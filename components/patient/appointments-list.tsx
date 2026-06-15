"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import type { Appointment } from "@/lib/types"
import { statusLabels } from "@/lib/mock-data"

interface AppointmentsListProps {
  appointments: Appointment[]
  showAll?: boolean
  onCancel?: (id: string) => void
}

const statusColors = {
  scheduled: "bg-info/10 text-info border-info/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
}

export function AppointmentsList({ appointments, showAll, onCancel }: AppointmentsListProps) {
  const sortedAppointments = [...appointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icons.calendar className="h-5 w-5 text-primary" />
          Lịch khám
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedAppointments.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Icons.calendar className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>Không có lịch khám nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10">
                    <span className="text-xs font-medium text-primary">
                      {new Date(appointment.date).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                      })}
                    </span>
                    <span className="text-xs text-primary">
                      {new Date(appointment.date).toLocaleDateString("vi-VN", {
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{appointment.department}</p>
                    <p className="text-sm text-muted-foreground">{appointment.doctorName}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Icons.clock className="h-3 w-3" />
                      {appointment.time}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={statusColors[appointment.status]}>
                    {statusLabels[appointment.status]}
                  </Badge>
                  {appointment.status === "scheduled" && onCancel && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCancel(appointment.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Icons.delete className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
