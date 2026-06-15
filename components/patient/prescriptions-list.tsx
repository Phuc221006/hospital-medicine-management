"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Icons } from "@/components/icons"
import type { Prescription, PrescriptionStatus } from "@/lib/types"
import { statusLabels } from "@/lib/mock-data"

interface PrescriptionsListProps {
  prescriptions: Prescription[]
  showSearch?: boolean
}

const statusColors: Record<PrescriptionStatus, string> = {
  pending: "bg-warning/10 text-warning-foreground border-warning/20",
  dispensed: "bg-success/10 text-success border-success/20",
  expired: "bg-destructive/10 text-destructive border-destructive/20",
}

export function PrescriptionsList({ prescriptions, showSearch }: PrescriptionsListProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredPrescriptions = prescriptions.filter((p) => {
    const matchesSearch =
      p.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      p.items.some((item) => item.medicineName.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = statusFilter === "all" || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icons.clipboard className="h-5 w-5 text-primary" />
          Đơn thuốc của tôi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSearch && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên thuốc, bác sĩ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Đang chờ</SelectItem>
                <SelectItem value="dispensed">Đã cấp</SelectItem>
                <SelectItem value="expired">Hết hạn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {filteredPrescriptions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Icons.clipboard className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>Không tìm thấy đơn thuốc nào</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {filteredPrescriptions.map((prescription) => (
              <AccordionItem key={prescription.id} value={prescription.id} className="rounded-lg border bg-card px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex flex-1 items-center justify-between pr-4">
                    <div className="text-left">
                      <p className="font-medium text-foreground">Đơn thuốc #{prescription.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {prescription.doctorName} • {new Date(prescription.examinationDate).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                    <Badge variant="outline" className={statusColors[prescription.status]}>
                      {statusLabels[prescription.status]}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="space-y-3">
                    {prescription.items.map((item) => (
                      <div key={item.id} className="flex items-start justify-between rounded-md bg-muted/50 p-3">
                        <div>
                          <p className="font-medium text-foreground">{item.medicineName}</p>
                          <p className="text-sm text-muted-foreground">{item.dosage}</p>
                          <p className="text-sm text-muted-foreground">{item.instructions}</p>
                        </div>
                        <Badge variant="secondary">SL: {item.quantity}</Badge>
                      </div>
                    ))}
                    {prescription.notes && (
                      <div className="flex items-start gap-2 rounded-md bg-primary/5 p-3">
                        <Icons.info className="h-4 w-4 text-primary mt-0.5" />
                        <p className="text-sm text-foreground">{prescription.notes}</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}
