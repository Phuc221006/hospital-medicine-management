"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons"
import type { MedicineRequest } from "@/lib/types"

interface MedicineRequestsListProps {
  requests: MedicineRequest[]
  showAll?: boolean
}

const statusColors = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved: "bg-success/10 text-success border-success/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
}

const statusLabels = {
  pending: "Đang chờ",
  approved: "Đã duyệt",
  rejected: "Đã từ chối",
}

export function MedicineRequestsList({ requests, showAll }: MedicineRequestsListProps) {
  const sortedRequests = [...requests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  const displayRequests = showAll ? sortedRequests : sortedRequests.slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icons.pill className="h-5 w-5 text-primary" />
          Yêu cầu bổ sung thuốc
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayRequests.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Icons.pill className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>Không có yêu cầu nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-medium text-foreground">{request.medicineName}</p>
                    <Badge variant="outline" className={statusColors[request.status]}>
                      {statusLabels[request.status]}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium">Số lượng:</span> {request.quantity}
                    </p>
                    <p>
                      <span className="font-medium">Lý do:</span> {request.reason}
                    </p>
                    {request.processedBy && (
                      <p>
                        <span className="font-medium">Xử lý bởi:</span> {request.processedBy}
                        {request.processedAt && ` vào ${new Date(request.processedAt).toLocaleDateString("vi-VN")}`}
                      </p>
                    )}
                    {request.notes && (
                      <p>
                        <span className="font-medium">Ghi chú:</span> {request.notes}
                      </p>
                    )}
                    <p className="text-xs">
                      {new Date(request.createdAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

