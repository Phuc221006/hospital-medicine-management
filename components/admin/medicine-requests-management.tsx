"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Icons } from "@/components/icons"
import type { MedicineRequest } from "@/lib/types"
import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/api-config"
import { useToast } from "@/components/ui/use-toast"

interface MedicineRequestsManagementProps {
  onUpdate?: () => void
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

export function MedicineRequestsManagement({ onUpdate }: MedicineRequestsManagementProps) {
  const [requests, setRequests] = useState<MedicineRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<MedicineRequest | null>(null)
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null)
  const [notes, setNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.ADMIN.MEDICINE_REQUESTS || "/admin/medicine-requests")
      // apiClient unwraps { success, data } so response is already PageResponse
      // Backend returns PageResponse with content array
      const requestsArray = Array.isArray(response) 
        ? response 
        : (response?.content || (Array.isArray(response?.data) ? response.data : []) || [])
      const transformed = requestsArray.map((req: any) => ({
        id: String(req.id),
        patientId: String(req.patientId),
        patientName: req.patientName || "",
        medicineId: req.medicineId ? String(req.medicineId) : undefined,
        medicineName: req.medicineName || "",
        quantity: req.quantity || 0,
        reason: req.reason || "",
        status: (req.status?.toLowerCase() || "pending") as "pending" | "approved" | "rejected",
        createdAt: req.createdAt || "",
        processedAt: req.processedAt || undefined,
        processedBy: req.processedByName || undefined,
        notes: req.notes || undefined,
      }))
      setRequests(transformed)
    } catch (error) {
      console.error("Failed to fetch medicine requests:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách yêu cầu. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedRequest) return
    setIsProcessing(true)
    try {
      const endpoint = `${API_ENDPOINTS.ADMIN.MEDICINE_REQUESTS || "/admin/medicine-requests"}/${selectedRequest.id}/approve`
      const url = notes ? `${endpoint}?notes=${encodeURIComponent(notes)}` : endpoint
      console.debug("Approving medicine request - PATCH", url)
      await apiClient.patch(url)
      toast({
        title: "Thành công",
        description: "Đã phê duyệt yêu cầu và xuất kho thuốc",
      })
      setSelectedRequest(null)
      setActionType(null)
      setNotes("")
      fetchRequests()
      onUpdate?.()
    } catch (error: any) {
      console.error('Approve request failed:', error)
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể phê duyệt yêu cầu. Vui lòng thử lại.",
        variant: "destructive",
      })
      // Refresh list and close dialog to avoid stuck modal when backend reports non-pending
      try {
        await fetchRequests()
      } catch (e) {
        console.error('Failed to refresh requests after approve error:', e)
      }
      setSelectedRequest(null)
      setActionType(null)
      setNotes("")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return
    setIsProcessing(true)
    try {
      const endpoint = `${API_ENDPOINTS.ADMIN.MEDICINE_REQUESTS || "/admin/medicine-requests"}/${selectedRequest.id}/reject`
      const url = notes ? `${endpoint}?notes=${encodeURIComponent(notes)}` : endpoint
      await apiClient.patch(url)
      toast({
        title: "Thành công",
        description: "Đã từ chối yêu cầu",
      })
      setSelectedRequest(null)
      setActionType(null)
      setNotes("")
      fetchRequests()
      onUpdate?.()
    } catch (error: any) {
      console.error('Reject request failed:', error)
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể từ chối yêu cầu. Vui lòng thử lại.",
        variant: "destructive",
      })
      // Refresh list and close dialog to avoid stuck modal when backend reports non-pending
      try {
        await fetchRequests()
      } catch (e) {
        console.error('Failed to refresh requests after reject error:', e)
      }
      setSelectedRequest(null)
      setActionType(null)
      setNotes("")
    } finally {
      setIsProcessing(false)
    }
  }

  const openActionDialog = (request: MedicineRequest, type: "approve" | "reject") => {
    setSelectedRequest(request)
    setActionType(type)
    setNotes("")
  }

  const pendingRequests = requests.filter((r) => r.status === "pending")

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icons.bell className="h-5 w-5 text-primary" />
            Yêu cầu bổ sung thuốc
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Icons.refresh className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bệnh nhân</TableHead>
                    <TableHead>Thuốc</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Lý do</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Không có yêu cầu nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.patientName}</TableCell>
                        <TableCell>{request.medicineName}</TableCell>
                        <TableCell>{request.quantity}</TableCell>
                        <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[request.status]}>
                            {statusLabels[request.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.createdAt
                            ? new Date(request.createdAt).toLocaleDateString("vi-VN")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {request.status === "pending" && (
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openActionDialog(request, "approve")}
                                className="text-success"
                              >
                                Duyệt
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openActionDialog(request, "reject")}
                                className="text-destructive"
                              >
                                Từ chối
                              </Button>
                            </div>
                          )}
                          {request.status !== "pending" && request.processedBy && (
                            <span className="text-sm text-muted-foreground">
                              {request.processedBy}
                              {request.processedAt &&
                                ` - ${new Date(request.processedAt).toLocaleDateString("vi-VN")}`}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={selectedRequest !== null && actionType !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequest(null)
            setActionType(null)
            setNotes("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Phê duyệt yêu cầu" : "Từ chối yêu cầu"}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  Bệnh nhân: {selectedRequest.patientName}
                  <br />
                  Thuốc: {selectedRequest.medicineName} - Số lượng: {selectedRequest.quantity}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="notes">Ghi chú {actionType === "reject" ? "(bắt buộc)" : "(tùy chọn)"}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={actionType === "approve" ? "Ghi chú khi phê duyệt..." : "Lý do từ chối..."}
                rows={3}
                required={actionType === "reject"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRequest(null)
                setActionType(null)
                setNotes("")
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={actionType === "approve" ? handleApprove : handleReject}
              disabled={isProcessing || (actionType === "reject" && !notes.trim())}
              variant={actionType === "reject" ? "destructive" : "default"}
            >
              {isProcessing && <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />}
              {actionType === "approve" ? "Phê duyệt" : "Từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

