"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Icons } from "@/components/icons"
import type { Medicine, Transaction, MedicineCategory } from "@/lib/types"
import { categoryLabels } from "@/lib/mock-data"
import { reportService } from "@/lib/services"
import { useToast } from "@/components/ui/use-toast"

interface ReportsPageProps {
  medicines: Medicine[]
  transactions: Transaction[]
}

type ReportType = "inventory" | "transactions" | "expiring"

export function ReportsPage({ medicines, transactions }: ReportsPageProps) {
  // Defensive defaults in case parent passes undefined/null
  const txList = Array.isArray(transactions) ? transactions : []
  const meds = Array.isArray(medicines) ? medicines : []
  const [reportType, setReportType] = useState<ReportType>("inventory")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  const { toast } = useToast()

  const filteredTransactions = txList.filter((tx) => {
    if (!startDate && !endDate) return true
    const raw = (tx as any).date ?? (tx as any).importDate ?? (tx as any).exportDate ?? (tx as any).createdAt
    const txDate = raw ? new Date(raw) : new Date(0)
    const start = startDate ? new Date(startDate) : new Date(0)
    const end = endDate ? new Date(endDate) : new Date()
    return txDate >= start && txDate <= end
  })

  const expiringMedicines = meds.filter((m) => {
    const expiryDate = m.nearestExpiryDate || m.nearestExpiry
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiry <= thirtyDaysFromNow
  })

  const handleExportCSV = async () => {
    setIsExporting(true)
    try {
      // Try API first, fallback to local export
      if (startDate && endDate) {
        await reportService.downloadReport({
          startDate,
          endDate,
          type: reportType,
          format: "csv",
        })
      } else {
        // Local export fallback
        let csvContent = ""
        let filename = ""

          const escape = (s: any) => {
            if (s === null || s === undefined) return ""
            return String(s).replace(/"/g, '""')
          }

          if (reportType === "inventory") {
          csvContent = "ID,Tên thuốc,Loại,Số lượng,Đơn vị,Giá,Nhà cung cấp,Hạn dùng\n"
          meds.forEach((m) => {
            const catLabel = m.categoryName || (categoryLabels as any)[m.category as MedicineCategory] || m.category || ""
            csvContent += `${m.id},"${escape(m.name)}","${escape(catLabel)}",${m.quantity},"${escape(m.unit)}",${m.price},"${escape(m.supplier)}","${escape(m.nearestExpiry || "")}"\n`
          })
          filename = "bao-cao-ton-kho.csv"
        } else if (reportType === "transactions") {
          csvContent = "ID,Loại,Tên thuốc,Số lượng,Ngày,Người thực hiện,Bệnh nhân,Ghi chú\n"
          filteredTransactions.forEach((tx) => {
            const raw = (tx as any).date ?? (tx as any).importDate ?? (tx as any).exportDate ?? (tx as any).createdAt
            const txDate = raw ? new Date(raw).toLocaleDateString("vi-VN") : ""
            const details = Array.isArray((tx as any).details) ? (tx as any).details : []
            const medicineNames = details.length
              ? details.map((d: any) => `${d.medicineName || d.name || "-"} (${d.quantity ?? d.qty ?? 0})`).join("; ")
              : (tx as any).medicineName || "-"
            const totalQty = details.length ? details.reduce((s: number, d: any) => s + (Number(d.quantity ?? d.qty ?? 0) || 0), 0) : (tx as any).quantity || 0
            const performer = (tx as any).importedByName || (tx as any).exportedByName || (tx as any).performedByName || (tx as any).userName || (tx as any).createdByName || (tx as any).user || ""
            const patient = (tx as any).patientName || (tx as any).patient?.name || (tx as any).patient || ""

            csvContent += `${tx.id},"${tx.type === "import" ? "Nhập" : "Xuất"}","${escape(medicineNames)}",${totalQty},"${escape(txDate)}","${escape(performer)}","${escape(patient)}","${escape((tx as any).notes || "")}"\n`
          })
          filename = "bao-cao-giao-dich.csv"
        } else {
          csvContent = "ID,Tên thuốc,Số lượng,Hạn dùng\n"
          expiringMedicines.forEach((m) => {
            csvContent += `${m.id},"${escape(m.name)}",${m.quantity},"${escape(m.nearestExpiry)}"\n`
          })
          filename = "bao-cao-het-han.csv"
        }

        const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = filename
        link.click()
      }

      toast({
        title: "Thành công",
        description: "Đã xuất báo cáo thành công",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xuất báo cáo. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportPDF = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn khoảng thời gian để xuất PDF",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)
    try {
      await reportService.downloadReport({
        startDate,
        endDate,
        type: reportType,
        format: "pdf",
      })
      toast({
        title: "Thành công",
        description: "Đã xuất báo cáo PDF thành công",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xuất PDF. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icons.chart className="h-5 w-5 text-primary" />
            Báo cáo & Thống kê
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="grid gap-2">
              <Label>Loại báo cáo</Label>
              <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inventory">Tồn kho hiện tại</SelectItem>
                  <SelectItem value="transactions">Lịch sử nhập/xuất</SelectItem>
                  <SelectItem value="expiring">Thuốc sắp hết hạn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === "transactions" && (
              <>
                <div className="grid gap-2">
                  <Label>Từ ngày</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>Đến ngày</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </>
            )}

            <div className="flex items-end gap-2">
              <Button onClick={handleExportCSV} className="gap-2" disabled={isExporting}>
                {isExporting && <Icons.refresh className="h-4 w-4 animate-spin" />}
                <Icons.download className="h-4 w-4" />
                Xuất CSV
              </Button>
              <Button
                onClick={handleExportPDF}
                variant="outline"
                className="gap-2 bg-transparent"
                disabled={isExporting}
              >
                {isExporting && <Icons.refresh className="h-4 w-4 animate-spin" />}
                <Icons.download className="h-4 w-4" />
                Xuất PDF
              </Button>
            </div>
          </div>

          {/* Report Content */}
          <div className="rounded-md border">
            {reportType === "inventory" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên thuốc</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                    <TableHead className="text-right">Giá</TableHead>
                    <TableHead>Nhà cung cấp</TableHead>
                    <TableHead>Hạn dùng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meds.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>{m.categoryName || categoryLabels[m.category as MedicineCategory] || "-"}</TableCell>
                      <TableCell className="text-right">
                        {m.totalStock || m.quantity || 0} {m.unit}
                      </TableCell>
                      <TableCell className="text-right">{m.price.toLocaleString("vi-VN")}đ</TableCell>
                      <TableCell>{m.supplierName || m.supplier || "-"}</TableCell>
                      <TableCell>
                        {m.nearestExpiryDate
                          ? new Date(m.nearestExpiryDate).toLocaleDateString("vi-VN")
                          : m.nearestExpiry
                            ? new Date(m.nearestExpiry).toLocaleDateString("vi-VN")
                            : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {reportType === "transactions" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Loại</TableHead>
                    <TableHead>Tên thuốc</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Người thực hiện</TableHead>
                    <TableHead>Bệnh nhân</TableHead>
                    <TableHead>Ghi chú</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => {
                    const details = Array.isArray((tx as any).details) ? (tx as any).details : []
                    const medicineNames = details.length
                      ? details.map((d: any) => d.medicineName || d.name || "-").join("; ")
                      : (tx as any).medicineName || "-"
                    const totalQty = details.length
                      ? details.reduce((s: number, d: any) => s + (Number(d.quantity ?? d.qty ?? 0) || 0), 0)
                      : (tx as any).quantity || 0

                    const raw = (tx as any).date ?? (tx as any).importDate ?? (tx as any).exportDate ?? (tx as any).createdAt
                    const txDate = raw ? new Date(raw) : null
                    const dateStr = txDate && !isNaN(txDate.getTime()) ? txDate.toLocaleDateString("vi-VN") : "-"

                    const performer = (tx as any).importedByName || (tx as any).exportedByName || (tx as any).performedByName || (tx as any).userName || (tx as any).createdByName || (tx as any).user || "-"
                    const patient = (tx as any).patientName || (tx as any).patient?.name || (tx as any).patient || "-"

                    return (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <span className={tx.type === "import" ? "text-success font-medium" : "text-info font-medium"}>
                            {tx.type === "import" ? "Nhập" : "Xuất"}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{medicineNames}</TableCell>
                        <TableCell className="text-right">{totalQty}</TableCell>
                        <TableCell>{dateStr}</TableCell>
                        <TableCell>{performer}</TableCell>
                        <TableCell>{patient}</TableCell>
                        <TableCell>{tx.notes || "-"}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}

            {reportType === "expiring" && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên thuốc</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                    <TableHead>Hạn dùng</TableHead>
                    <TableHead>Còn lại</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiringMedicines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        Không có thuốc sắp hết hạn
                      </TableCell>
                    </TableRow>
                  ) : (
                    expiringMedicines
                      .filter((m) => m.nearestExpiryDate || m.nearestExpiry)
                      .map((m) => {
                        const expiryDate = m.nearestExpiryDate || m.nearestExpiry!
                        const daysLeft = Math.ceil(
                          (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                        )
                        return (
                          <TableRow key={m.id}>
                            <TableCell className="font-medium">{m.name}</TableCell>
                            <TableCell className="text-right">
                              {m.totalStock || m.quantity || 0} {m.unit}
                            </TableCell>
                            <TableCell>{new Date(expiryDate).toLocaleDateString("vi-VN")}</TableCell>
                            <TableCell>
                              <span
                                className={
                                  daysLeft <= 7
                                    ? "text-destructive font-medium"
                                    : daysLeft <= 14
                                      ? "text-warning-foreground font-medium"
                                      : ""
                                }
                              >
                                {daysLeft} ngày
                              </span>
                            </TableCell>
                          </TableRow>
                        )
                      })
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
