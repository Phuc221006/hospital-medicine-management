"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"
import type { Alert, AlertRule, Medicine } from "@/lib/types"
import { alertService, stockService } from "@/lib/services"
import { useToast } from "@/components/ui/use-toast"

interface AlertsManagementProps {
  alerts: Alert[]
  alertRules: AlertRule[]
  medicines: Medicine[]
  onUpdateRules: (rules: AlertRule[]) => void
  onMarkRead: (alertId: string) => void
}

export function AlertsManagement({ alerts, alertRules, medicines, onUpdateRules, onMarkRead }: AlertsManagementProps) {
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newRule, setNewRule] = useState({
    medicineId: "",
    minStockThreshold: 50,
    expiryWarningDays: 30,
  })

  const { toast } = useToast()

  const handleAddRule = async () => {
    const medicine = medicines.find((m) => String(m.id) === String(newRule.medicineId))
    if (!medicine) return

    setIsLoading(true)
    try {
      const createdRule = await alertService.createAlertRule({
        medicineId: newRule.medicineId,
        minStockThreshold: newRule.minStockThreshold,
        expiryWarningDays: newRule.expiryWarningDays,
      })

      onUpdateRules([...alertRules, createdRule])
      setIsAddRuleOpen(false)
      setNewRule({
        medicineId: "",
        minStockThreshold: 50,
        expiryWarningDays: 30,
      })
      toast({
        title: "Thành công",
        description: "Đã thêm quy tắc cảnh báo",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm quy tắc. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRule = async (ruleId: string) => {
    console.log("Toggling rule", alertRules)
    const rule = alertRules.find((r) => r.id === ruleId)
    if (!rule) return

    try {
      const currentActive = (rule as any).isActive ?? (rule as any).active ?? false
      await alertService.toggleAlertRule(ruleId, !currentActive)
      onUpdateRules(
        alertRules.map((r) => (r.id === ruleId ? { ...r, isActive: !currentActive, active: !currentActive } : r)),
      )
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật quy tắc. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const deleteRule = async (ruleId: string) => {
    try {
      // Permanently delete the alert rule via backend
      await alertService.deleteAlertRule(ruleId)
      // Remove from local list
      onUpdateRules(alertRules.filter((r) => r.id !== ruleId))
      toast({
        title: "Thành công",
        description: "Đã xóa quy tắc cảnh báo",
      })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể xóa quy tắc. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const handleQuickImport = async (alert: Alert) => {
    try {
      await stockService.quickImport(alert.medicineId, 50)
      toast({
        title: "Thành công",
        description: `Đã nhập nhanh 50 ${alert.medicineName}`,
      })
      onMarkRead(alert.id)
    } catch (error) {
      console.error('Quick import failed:', error)
      toast({
        title: "Lỗi",
        description: "Không thể nhập nhanh. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await alertService.markAllAsRead()
      alerts.forEach((a) => onMarkRead(a.id))
      toast({
        title: "Thành công",
        description: "Đã đánh dấu tất cả đã đọc",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể đánh dấu đã đọc. Vui lòng thử lại.",
        variant: "destructive",
      })
    }
  }

  const unreadAlerts = alerts.filter((a) => !a.isRead)

  return (
    <div className="space-y-6">
      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icons.bell className="h-5 w-5 text-primary" />
              Cảnh báo hiện tại
              {unreadAlerts.length > 0 && <Badge variant="destructive">{unreadAlerts.length}</Badge>}
            </CardTitle>
            {unreadAlerts.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Icons.success className="mx-auto mb-2 h-12 w-12 text-success opacity-50" />
              <p>Không có cảnh báo nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert, idx) => {
                const key = alert.id ?? `${alert.medicineId}-${alert.createdAt}-${idx}`
                return (
                  <div
                    key={key}
                    className={[
                      "flex items-start justify-between rounded-lg border p-4",
                      alert.isRead ? "opacity-60" : "",
                      alert.severity === "critical"
                        ? "border-destructive/20 bg-destructive/5"
                        : "border-warning/20 bg-warning/5",
                    ].join(" ")}
                  >
                    <div className="flex items-start gap-3">
                      {alert.severity === "critical" ? (
                        <Icons.alert className="h-5 w-5 text-destructive mt-0.5" />
                      ) : (
                        <Icons.warning className="h-5 w-5 text-warning-foreground mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{alert.medicineName}</p>
                          <Badge
                            variant={
                              alert.type === "low_stock"
                                ? "secondary"
                                : alert.type === "expiring"
                                ? "outline"
                                : "destructive"
                            }
                          >
                            {alert.type === "low_stock"
                              ? "Sắp hết"
                              : alert.type === "expiring"
                              ? "Sắp hết hạn"
                              : "Đã hết hạn"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(alert.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!alert.isRead && (
                        <Button variant="ghost" size="sm" onClick={() => onMarkRead(alert.id)}>
                          Đánh dấu đã đọc
                        </Button>
                      )}
                      {alert.type === "low_stock" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 bg-transparent"
                          onClick={() => handleQuickImport(alert)}
                        >
                          <Icons.import className="h-3 w-3" />
                          Nhập nhanh
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icons.settings className="h-5 w-5 text-primary" />
              Cài đặt cảnh báo
            </CardTitle>
            <Dialog open={isAddRuleOpen} onOpenChange={setIsAddRuleOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Icons.plus className="h-4 w-4" />
                  Thêm quy tắc
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm quy tắc cảnh báo</DialogTitle>
                  <DialogDescription>Thiết lập ngưỡng cảnh báo cho thuốc</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Thuốc</Label>
                    <Select value={newRule.medicineId} onValueChange={(v) => setNewRule({ ...newRule, medicineId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn thuốc..." />
                      </SelectTrigger>
                      <SelectContent>
                        {medicines
                          .filter((m) => !alertRules.some((r) => String(r.medicineId) === String(m.id)))
                          .map((m) => (
                            <SelectItem key={String(m.id)} value={String(m.id)}>
                              {m.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Ngưỡng tồn kho tối thiểu</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newRule.minStockThreshold}
                      onChange={(e) =>
                        setNewRule({
                          ...newRule,
                          minStockThreshold: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Cảnh báo trước hạn (ngày)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newRule.expiryWarningDays}
                      onChange={(e) =>
                        setNewRule({
                          ...newRule,
                          expiryWarningDays: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddRuleOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleAddRule} disabled={isLoading || !newRule.medicineId}>
                    {isLoading && <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />}
                    Thêm quy tắc
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thuốc</TableHead>
                  <TableHead className="text-center">Ngưỡng tồn kho</TableHead>
                  <TableHead className="text-center">Cảnh báo trước hạn</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alertRules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Chưa có quy tắc cảnh báo nào
                    </TableCell>
                  </TableRow>
                ) : (
                  alertRules.map((rule) => {
                    const medField: any = (rule as any).medicine
                    const medicineLabel = medField
                      ? typeof medField === "object"
                        ? medField.name || medField.code || String(medField.id || "")
                        : String(medField)
                      : (rule as any).medicineName || "-"

                    return (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{medicineLabel}</TableCell>
                      <TableCell className="text-center">{rule.minStockThreshold}</TableCell>
                      <TableCell className="text-center">{rule.expiryWarningDays} ngày</TableCell>
                      <TableCell className="text-center">
                        <Switch checked={rule.isActive} onCheckedChange={() => toggleRule(rule.id)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)}>
                          <Icons.delete className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                }))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
