"use client"

import { useState, useMemo } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Icons } from "@/components/icons"
import type { PatientInfo, Prescription } from "@/lib/types"
import { patientService } from "@/lib/services/patient-service"
import { useToast } from "@/components/ui/use-toast"

interface PatientsManagementProps {
  patients: PatientInfo[]
  prescriptions: Prescription[]
}

export function PatientsManagement({ patients, prescriptions }: PatientsManagementProps) {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [selectedPatient, setSelectedPatient] = useState<PatientInfo | null>(null)
  const [editingPatient, setEditingPatient] = useState<PatientInfo | null>(null)
  const [deletingPatient, setDeletingPatient] = useState<PatientInfo | null>(null)
  const [newTag, setNewTag] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [localPatients, setLocalPatients] = useState(patients)
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const { toast } = useToast()

  const filteredPatients = useMemo(() => {
    if (!localPatients || localPatients.length === 0) return []
    const searchLower = debouncedSearch.toLowerCase()
    return localPatients.filter(
      (p) =>
        p.name?.toLowerCase().includes(searchLower) ||
        p.email?.toLowerCase().includes(searchLower) ||
        p.phone?.toLowerCase().includes(searchLower) ||
        p.tags?.some((tag) => tag.toLowerCase().includes(searchLower)),
    )
  }, [localPatients, debouncedSearch])

  const getPatientPrescriptions = (patientId: string) => prescriptions.filter((p) => p.patientId === patientId)

  const handleAddTag = async () => {
    if (!selectedPatient || !newTag.trim()) return
    setIsLoading(true)
    try {
      const updated = await patientService.addTag(selectedPatient.id, newTag.trim())
      setLocalPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setSelectedPatient(updated)
      setNewTag("")
      toast({
        title: "Thành công",
        description: "Đã thêm nhãn cho bệnh nhân",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm nhãn. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveTag = async (tag: string) => {
    if (!selectedPatient) return
    setIsLoading(true)
    try {
      const updated = await patientService.removeTag(selectedPatient.id, tag)
      setLocalPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setSelectedPatient(updated)
      toast({
        title: "Thành công",
        description: "Đã xóa nhãn",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa nhãn. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const openEditDialog = (patient: PatientInfo) => {
    setEditFormData({
      name: patient.name || "",
      email: patient.email || "",
      phone: patient.phone || "",
    })
    setEditingPatient(patient)
  }

  const handleUpdatePatient = async () => {
    if (!editingPatient) return
    setIsLoading(true)
    try {
      const updated = await patientService.updateById(editingPatient.id, {
        name: editFormData.name,
        phone: editFormData.phone,
      })
      setLocalPatients((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)))
      setEditingPatient(null)
      setEditFormData({ name: "", email: "", phone: "" })
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin bệnh nhân",
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

  const handleDeletePatient = async () => {
    if (!deletingPatient) return
    setIsLoading(true)
    try {
      await patientService.deleteById(deletingPatient.id)
      setLocalPatients((prev) => prev.filter((p) => p.id !== deletingPatient.id))
      setDeletingPatient(null)
      toast({
        title: "Thành công",
        description: "Đã xóa bệnh nhân",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa bệnh nhân. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icons.users className="h-5 w-5 text-primary" />
            Quản lý bệnh nhân
          </CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Icons.plus className="h-4 w-4" />
                Thêm bệnh nhân
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm bệnh nhân mới</DialogTitle>
                <DialogDescription>Nhập thông tin bệnh nhân mới</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-name">Họ và tên *</Label>
                  <Input
                    id="new-name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-email">Email *</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    placeholder="Nhập email"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-phone">Số điện thoại</Label>
                  <Input
                    id="new-phone"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditFormData({ name: "", email: "", phone: "" })
                    setIsCreateOpen(false)
                  }}
                >
                  Hủy
                </Button>
                <Button
                  onClick={async () => {
                    if (!editFormData.name || !editFormData.email) {
                      toast({
                        title: "Lỗi",
                        description: "Vui lòng nhập đầy đủ thông tin bắt buộc",
                        variant: "destructive",
                      })
                      return
                    }
                    setIsLoading(true)
                    try {
                      const newPatient = await patientService.create({
                        name: editFormData.name,
                        email: editFormData.email,
                        phone: editFormData.phone || "",
                        password: "Patient123!", // Default password, should be changed on first login
                      })
                      setLocalPatients((prev) => [...prev, newPatient])
                      setEditFormData({ name: "", email: "", phone: "" })
                      // Close the create dialog after successful creation
                      setIsCreateOpen(false)
                      toast({
                        title: "Thành công",
                        description: "Đã thêm bệnh nhân mới. Mật khẩu mặc định: Patient123!",
                      })
                    } catch (error: any) {
                      toast({
                        title: "Lỗi",
                        description: error?.message || "Không thể thêm bệnh nhân. Vui lòng thử lại.",
                        variant: "destructive",
                      })
                    } finally {
                      setIsLoading(false)
                    }
                  }}
                  disabled={isLoading}
                >
                  {isLoading && <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />}
                  Thêm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, email, số điện thoại, nhãn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên bệnh nhân</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead className="text-center">Số đơn thuốc</TableHead>
                <TableHead>Lần khám cuối</TableHead>
                <TableHead>Nhãn</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Không tìm thấy bệnh nhân nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{patient.phone || "-"}</TableCell>
                    <TableCell className="text-center">{patient.prescriptionCount}</TableCell>
                    <TableCell>
                      {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString("vi-VN") : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {patient.tags?.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog
                          open={selectedPatient?.id === patient.id}
                          onOpenChange={(open) => !open && setSelectedPatient(null)}
                        >
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedPatient(patient)}>
                              <Icons.view className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px]">
                          <DialogHeader>
                            <DialogTitle>Thông tin bệnh nhân</DialogTitle>
                            <DialogDescription>
                              {patient.name} - {patient.email}
                            </DialogDescription>
                          </DialogHeader>

                          <Tabs defaultValue="info" className="mt-4">
                            <TabsList>
                              <TabsTrigger value="info">Thông tin</TabsTrigger>
                              <TabsTrigger value="history">Lịch sử khám</TabsTrigger>
                              <TabsTrigger value="tags">Nhãn</TabsTrigger>
                            </TabsList>

                            <TabsContent value="info" className="space-y-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground">Họ và tên</p>
                                  <p className="font-medium">{patient.name}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Email</p>
                                  <p className="font-medium">{patient.email}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Số điện thoại</p>
                                  <p className="font-medium">{patient.phone || "Chưa cập nhật"}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Số đơn thuốc</p>
                                  <p className="font-medium">{patient.prescriptionCount}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Lần khám cuối</p>
                                  <p className="font-medium">
                                    {patient.lastVisit
                                      ? new Date(patient.lastVisit).toLocaleDateString("vi-VN")
                                      : "Chưa có"}
                                  </p>
                                </div>
                              </div>
                            </TabsContent>

                            <TabsContent value="history" className="max-h-[400px] overflow-y-auto space-y-4 py-4">
                              {getPatientPrescriptions(patient.id).length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">Không có lịch sử khám bệnh</p>
                              ) : (
                                getPatientPrescriptions(patient.id).map((rx) => (
                                  <div key={rx.id} className="rounded-lg border p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <p className="font-medium">Đơn thuốc #{rx.id}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(rx.examinationDate).toLocaleDateString("vi-VN")}
                                      </p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{rx.doctorName}</p>
                                    <div className="space-y-1">
                                      {rx.items.map((item) => (
                                        <p key={item.id} className="text-sm">
                                          • {item.medicineName} - {item.dosage}
                                        </p>
                                      ))}
                                    </div>
                                  </div>
                                ))
                              )}
                            </TabsContent>

                            <TabsContent value="tags" className="space-y-4 py-4">
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Nhập nhãn mới..."
                                  value={newTag}
                                  onChange={(e) => setNewTag(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                                />
                                <Button onClick={handleAddTag} disabled={isLoading || !newTag.trim()}>
                                  {isLoading && <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />}
                                  Thêm
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {selectedPatient?.tags?.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="gap-1 px-3 py-1">
                                    {tag}
                                    <button
                                      onClick={() => handleRemoveTag(tag)}
                                      className="ml-1 hover:text-destructive"
                                    >
                                      <Icons.close className="h-3 w-3" />
                                    </button>
                                  </Badge>
                                ))}
                                {(!selectedPatient?.tags || selectedPatient.tags.length === 0) && (
                                  <p className="text-sm text-muted-foreground">Chưa có nhãn nào</p>
                                )}
                              </div>
                            </TabsContent>
                          </Tabs>
                        </DialogContent>
                      </Dialog>
                        <Dialog
                          open={editingPatient?.id === patient.id}
                          onOpenChange={(open) => !open && setEditingPatient(null)}
                        >
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(patient)}>
                              <Icons.edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>Chỉnh sửa thông tin bệnh nhân</DialogTitle>
                              <DialogDescription>Cập nhật thông tin bệnh nhân</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="edit-name">Họ và tên</Label>
                                <Input
                                  id="edit-name"
                                  value={editFormData.name}
                                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                  id="edit-email"
                                  type="email"
                                  value={editFormData.email}
                                  disabled
                                  className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="edit-phone">Số điện thoại</Label>
                                <Input
                                  id="edit-phone"
                                  value={editFormData.phone}
                                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditingPatient(null)}>
                                Hủy
                              </Button>
                              <Button onClick={handleUpdatePatient} disabled={isLoading}>
                                {isLoading && <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />}
                                Lưu thay đổi
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" onClick={() => setDeletingPatient(patient)}>
                          <Icons.delete className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AlertDialog open={!!deletingPatient} onOpenChange={() => setDeletingPatient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bệnh nhân</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bệnh nhân "{deletingPatient?.name}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePatient}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading && <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
