"use client"

import type React from "react"

import { useState, useRef, useMemo, useCallback, useEffect } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Icons } from "@/components/icons"
import type { Medicine, MedicineBatch, MedicineCategoryOption, SupplierOption } from "@/lib/types"
import { medicineService, categoryService, supplierService } from "@/lib/services"
import { useToast } from "@/components/ui/use-toast"

interface MedicinesManagementProps {
  medicines: Medicine[]
  onUpdate: (medicines: Medicine[]) => void
}

// Move MedicineForm to top-level to avoid remounts when parent renders.
function MedicineForm({
  isEdit = false,
  formData,
  setFormData,
  categories,
  suppliers,
}: {
  isEdit?: boolean
  formData: any
  setFormData: (v: any) => void
  categories: any[]
  suppliers: any[]
}) {
  return (
    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="code">
            Mã thuốc <span className="text-destructive">*</span>
          </Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => {
              const value = e.target.value.toUpperCase().replace(/\s+/g, "-")
              setFormData({ ...formData, code: value })
            }}
            placeholder="VD: MED001"
            disabled={isEdit}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="name">
            Tên thuốc <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="VD: Amoxicillin 500mg"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="genericName">Tên gốc</Label>
        <Input
          id="genericName"
          value={formData.genericName}
          onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
          placeholder="VD: Amoxicillin"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="categoryId">
            Loại thuốc <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.categoryId != null ? formData.categoryId.toString() : ""}
            onValueChange={(v) => setFormData({ ...formData, categoryId: v ? Number(v) : undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại thuốc" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="supplierId">
            Nhà cung cấp <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.supplierId != null ? formData.supplierId.toString() : ""}
            onValueChange={(v) => setFormData({ ...formData, supplierId: v ? Number(v) : undefined })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn nhà cung cấp" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((sup) => (
                <SelectItem key={sup.id} value={sup.id.toString()}>
                  {sup.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="unit">
            Đơn vị <span className="text-destructive">*</span>
          </Label>
          <Input
            id="unit"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="VD: Viên, Chai, Hộp..."
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="price">
            Giá (VNĐ) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="price"
            type="number"
            min="0"
            value={formData.price.toString()}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Mô tả về thuốc..."
          rows={3}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="usageInstructions">Hướng dẫn sử dụng</Label>
        <Textarea
          id="usageInstructions"
          value={formData.usageInstructions}
          onChange={(e) => setFormData({ ...formData, usageInstructions: e.target.value })}
          placeholder="Hướng dẫn sử dụng thuốc..."
          rows={2}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="sideEffects">Tác dụng phụ</Label>
        <Textarea
          id="sideEffects"
          value={formData.sideEffects}
          onChange={(e) => setFormData({ ...formData, sideEffects: e.target.value })}
          placeholder="Các tác dụng phụ có thể gặp..."
          rows={2}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="contraindications">Chống chỉ định</Label>
        <Textarea
          id="contraindications"
          value={formData.contraindications}
          onChange={(e) => setFormData({ ...formData, contraindications: e.target.value })}
          placeholder="Các trường hợp không nên sử dụng..."
          rows={2}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="storageConditions">Điều kiện bảo quản</Label>
        <Input
          id="storageConditions"
          value={formData.storageConditions}
          onChange={(e) => setFormData({ ...formData, storageConditions: e.target.value })}
          placeholder="VD: Bảo quản ở nhiệt độ phòng, tránh ánh sáng..."
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="requiresPrescription"
          checked={formData.requiresPrescription}
          onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="requiresPrescription" className="cursor-pointer">
          Yêu cầu kê đơn
        </Label>
      </div>
    </div>
  )
}

export function MedicinesManagement({ medicines, onUpdate }: MedicinesManagementProps) {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 300)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)
  const [deletingMedicine, setDeletingMedicine] = useState<Medicine | null>(null)
  const [viewingMedicine, setViewingMedicine] = useState<Medicine | null>(null)
  const [medicineBatches, setMedicineBatches] = useState<MedicineBatch[]>([])
  const [isLoadingBatches, setIsLoadingBatches] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<MedicineCategoryOption[]>([])
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    genericName: "",
    categoryId: undefined as number | undefined,
    supplierId: undefined as number | undefined,
    unit: "Viên",
    price: 0,
    description: "",
    usageInstructions: "",
    sideEffects: "",
    contraindications: "",
    storageConditions: "",
    requiresPrescription: false,
  })

  // Load categories and suppliers
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [categoriesRes, suppliersRes] = await Promise.all([
          categoryService.getAll(),
          supplierService.getAll(),
        ])
        setCategories(categoriesRes)
        setSuppliers(suppliersRes)
      } catch (error) {
        console.error("Failed to load options:", error)
      }
    }
    loadOptions()
  }, [])

  const filteredMedicines = useMemo(() => {
    if (!medicines || medicines.length === 0) return []
    const searchLower = debouncedSearch.toLowerCase()
    return medicines.filter((m) => {
      const matchesSearch =
        m.name?.toLowerCase().includes(searchLower) ||
        m.code?.toLowerCase().includes(searchLower) ||
        m.supplierName?.toLowerCase().includes(searchLower) ||
        m.categoryName?.toLowerCase().includes(searchLower) ||
        m.description?.toLowerCase().includes(searchLower)
      const matchesCategory =
        categoryFilter === "all" || m.categoryId?.toString() === categoryFilter || m.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [medicines, debouncedSearch, categoryFilter])

  const resetForm = useCallback(() => {
    setFormData({
      code: "",
      name: "",
      genericName: "",
      categoryId: undefined,
      supplierId: undefined,
      unit: "Viên",
      price: 0,
      description: "",
      usageInstructions: "",
      sideEffects: "",
      contraindications: "",
      storageConditions: "",
      requiresPrescription: false,
    })
  }, [])

  const openAddDialog = useCallback(() => {
    resetForm()
    setIsAddDialogOpen(true)
  }, [resetForm])

  const openEditDialog = useCallback(
    (medicine: Medicine) => {
      setFormData({
        code: medicine.code || "",
        name: medicine.name,
        genericName: medicine.genericName || "",
        categoryId: medicine.categoryId,
        supplierId: medicine.supplierId,
        unit: medicine.unit,
        price: medicine.price,
        description: medicine.description || "",
        usageInstructions: medicine.usageInstructions || "",
        sideEffects: medicine.sideEffects || "",
        contraindications: medicine.contraindications || "",
        storageConditions: medicine.storageConditions || "",
        requiresPrescription: medicine.requiresPrescription || false,
      })
      setEditingMedicine(medicine)
      setIsEditDialogOpen(true)
    },
    [],
  )

  const handleAddMedicine = useCallback(async () => {
    if (!formData.code || !formData.name) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã thuốc và tên thuốc",
        variant: "destructive",
      })
      return
    }
    if (!formData.categoryId || !formData.supplierId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn loại thuốc và nhà cung cấp",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)
    try {
      const newMedicine = await medicineService.create(formData)
      onUpdate([...medicines, newMedicine])
      setIsAddDialogOpen(false)
      resetForm()
      toast({
        title: "Thành công",
        description: "Đã thêm thuốc mới",
      })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể thêm thuốc. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [formData, medicines, onUpdate, toast, resetForm])

  const handleEditMedicine = useCallback(async () => {
    if (!editingMedicine) return
    if (!formData.code || !formData.name) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã thuốc và tên thuốc",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)
    try {
      const updated = await medicineService.update(editingMedicine.id.toString(), formData)
      onUpdate(medicines.map((m) => (m.id === editingMedicine.id ? updated : m)))
      setIsEditDialogOpen(false)
      setEditingMedicine(null)
      resetForm()
      toast({
        title: "Thành công",
        description: "Đã cập nhật thuốc",
      })
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error?.message || "Không thể cập nhật thuốc. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [editingMedicine, formData, medicines, onUpdate, toast, resetForm])

  const handleDeleteMedicine = async () => {
    if (!deletingMedicine) return
    setIsLoading(true)
    try {
      await medicineService.delete(deletingMedicine.id.toString())
      onUpdate(medicines.filter((m) => m.id !== deletingMedicine.id))
      setDeletingMedicine(null)
      toast({
        title: "Thành công",
        description: "Đã xóa thuốc",
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa thuốc. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    try {
      const result = await medicineService.importCSV(file)
      toast({
        title: "Thành công",
        description: `Đã import ${result.imported} thuốc`,
      })
      const response = await medicineService.getAll({ size: 100 })
      onUpdate(response.content)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể import file. Vui lòng kiểm tra định dạng.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const openViewDialog = async (medicine: Medicine) => {
    setViewingMedicine(medicine)
    setIsLoadingBatches(true)
    try {
      const batches = await medicineService.getBatches(medicine.id.toString())
      setMedicineBatches(batches)
    } catch (error) {
      console.error("Failed to load batches:", error)
      setMedicineBatches([])
    } finally {
      setIsLoadingBatches(false)
    }
  }

  const handleRemoveExpiredBatches = async (medicineId: string | number) => {
    setIsLoading(true)
    try {
      await medicineService.removeExpiredBatches(medicineId.toString())
      toast({
        title: "Thành công",
        description: "Đã loại bỏ các lô thuốc hết hạn",
      })
      if (viewingMedicine) {
        const batches = await medicineService.getBatches(medicineId.toString())
        setMedicineBatches(batches)
        const response = await medicineService.getAll({ size: 100 })
        onUpdate(response.content)
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể loại bỏ thuốc hết hạn. Vui lòng thử lại.",
        variant: "destructive",
    })
    } finally {
      setIsLoading(false)
    }
  }
  

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Icons.pill className="h-5 w-5 text-primary" />
              Quản lý thuốc
            </CardTitle>
            <div className="flex gap-2">
              <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Icons.upload className="h-4 w-4" />
                Import CSV
              </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                  <Button className="gap-2" onClick={openAddDialog}>
                  <Icons.plus className="h-4 w-4" />
                  Thêm thuốc
                </Button>
              </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Thêm thuốc mới</DialogTitle>
                  <DialogDescription>Nhập thông tin thuốc mới vào hệ thống</DialogDescription>
                </DialogHeader>
                <MedicineForm formData={formData} setFormData={setFormData} categories={categories} suppliers={suppliers} />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleAddMedicine} disabled={isLoading}>
                    {isLoading && <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />}
                    Thêm thuốc
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Icons.search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, mã, nhà cung cấp, mô tả..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Loại thuốc" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên thuốc</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                  <TableHead>Hạn dùng</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead className="text-right">Giá</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Không tìm thấy thuốc nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMedicines.map((medicine) => (
                    <TableRow key={medicine.id}>
                      <TableCell className="font-medium">{medicine.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{medicine.categoryName || "-"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            (medicine.totalStock || 0) <= (medicine.minStock || 0)
                              ? "text-destructive font-medium"
                              : ""
                          }
                        >
                          {medicine.totalStock || 0} {medicine.unit}
                        </span>
                      </TableCell>
                      <TableCell>
                        {medicine.nearestExpiryDate
                          ? new Date(medicine.nearestExpiryDate).toLocaleDateString("vi-VN")
                          : "-"}
                      </TableCell>
                      <TableCell>{medicine.supplierName || "-"}</TableCell>
                      <TableCell className="text-right">{medicine.price.toLocaleString("vi-VN")}đ</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openViewDialog(medicine)}>
                            <Icons.view className="h-4 w-4" />
                          </Button>
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(medicine)}>
                                <Icons.edit className="h-4 w-4" />
                              </Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeletingMedicine(medicine)}>
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
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thuốc</DialogTitle>
            <DialogDescription>Cập nhật thông tin thuốc</DialogDescription>
          </DialogHeader>
          <MedicineForm isEdit formData={formData} setFormData={setFormData} categories={categories} suppliers={suppliers} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditMedicine} disabled={isLoading}>
              {isLoading && <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewingMedicine} onOpenChange={(open) => !open && setViewingMedicine(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết thuốc: {viewingMedicine?.name}</DialogTitle>
            <DialogDescription>Thông tin chi tiết và các lô thuốc</DialogDescription>
          </DialogHeader>
          {viewingMedicine && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Mã thuốc</p>
                  <p className="font-medium">{viewingMedicine.code || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tên thuốc</p>
                  <p className="font-medium">{viewingMedicine.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tên gốc</p>
                  <p className="font-medium">{viewingMedicine.genericName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loại thuốc</p>
                  <p className="font-medium">{viewingMedicine.categoryName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số lượng tồn kho</p>
                  <p className="font-medium">
                    {viewingMedicine.totalStock || 0} {viewingMedicine.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nhà cung cấp</p>
                  <p className="font-medium">{viewingMedicine.supplierName || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Giá</p>
                  <p className="font-medium">{viewingMedicine.price.toLocaleString("vi-VN")}đ</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hạn sử dụng gần nhất</p>
                  <p className="font-medium">
                    {viewingMedicine.nearestExpiryDate
                      ? new Date(viewingMedicine.nearestExpiryDate).toLocaleDateString("vi-VN")
                      : "-"}
                  </p>
                </div>
                {viewingMedicine.description && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Mô tả</p>
                    <p className="font-medium">{viewingMedicine.description}</p>
                  </div>
                )}
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium">Các lô thuốc (Batches)</p>
                  {medicineBatches.some(
                    (b) => new Date(b.expiryDate) <= new Date() && b.remainingQuantity > 0,
                  ) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveExpiredBatches(viewingMedicine.id)}
                      disabled={isLoading}
                    >
                      {isLoading && <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />}
                      Loại bỏ thuốc hết hạn
                    </Button>
                  )}
                </div>
                {isLoadingBatches ? (
                  <div className="flex items-center justify-center py-8">
                    <Icons.refresh className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : medicineBatches.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Chưa có lô thuốc nào</p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã lô</TableHead>
                          <TableHead className="text-right">Số lượng</TableHead>
                          <TableHead className="text-right">Còn lại</TableHead>
                          <TableHead>Ngày nhập</TableHead>
                          <TableHead>Hạn sử dụng</TableHead>
                          <TableHead>Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {medicineBatches.map((batch) => {
                          const isExpired = new Date(batch.expiryDate) <= new Date()
                          const daysUntilExpiry = Math.ceil(
                            (new Date(batch.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                          )
                          return (
                            <TableRow key={batch.id}>
                              <TableCell className="font-medium">{batch.batchNumber || "-"}</TableCell>
                              <TableCell className="text-right">{batch.quantity}</TableCell>
                              <TableCell className="text-right">{batch.remainingQuantity || 0}</TableCell>
                              <TableCell>
                                {batch.importDate
                                  ? new Date(batch.importDate).toLocaleDateString("vi-VN")
                                  : "-"}
                              </TableCell>
                              <TableCell>{new Date(batch.expiryDate).toLocaleDateString("vi-VN")}</TableCell>
                              <TableCell>
                                {isExpired ? (
                                  <Badge variant="destructive">Đã hết hạn</Badge>
                                ) : daysUntilExpiry <= 30 ? (
                                  <Badge variant="outline" className="text-warning-foreground">
                                    Sắp hết hạn ({daysUntilExpiry} ngày)
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">Còn hạn</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingMedicine(null)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingMedicine} onOpenChange={() => setDeletingMedicine(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa thuốc</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thuốc "{deletingMedicine?.name}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMedicine}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading && <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
