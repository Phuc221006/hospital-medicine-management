"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"
import type { Medicine } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

interface ImportMedicineProps {
  medicines: Medicine[]
  onImport: (data: {
    medicineId: string
    quantity: number
    expiryDate: string
    batchNumber?: string
    supplier: string
    price: number
    importDate?: string
  }) => Promise<void>
}

export function ImportMedicine({ medicines, onImport }: ImportMedicineProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    medicineId: "",
    quantity: 0,
    importDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    supplier: "",
    batchNumber: "",
    price: 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const selectedMedicine = medicines.find((m) => m.id === formData.medicineId)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.medicineId) {
      newErrors.medicineId = "Vui lòng chọn thuốc"
    }
    if (formData.quantity <= 0) {
      newErrors.quantity = "Số lượng phải lớn hơn 0"
    }
    if (!formData.expiryDate) {
      newErrors.expiryDate = "Vui lòng nhập hạn sử dụng"
    } else if (new Date(formData.expiryDate) <= new Date()) {
      newErrors.expiryDate = "Hạn sử dụng phải sau ngày hôm nay"
    }
    if (!formData.batchNumber) {
      newErrors.batchNumber = "Vui lòng nhập mã lô"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsLoading(true)
    try {
      await onImport({
        medicineId: formData.medicineId,
        quantity: formData.quantity,
        expiryDate: formData.expiryDate,
        supplier: formData.supplier,
        batchNumber: formData.batchNumber || undefined,
        price: formData.price || selectedMedicine?.price || 0,
        importDate: formData.importDate,
      })

      // Reset form
      setFormData({
        medicineId: "",
        quantity: 0,
        importDate: new Date().toISOString().split("T")[0],
        expiryDate: "",
        supplier: "",
        batchNumber: "",
        price: 0,
      })
      setErrors({})
    } catch (error: any) {
      // Error is already handled in handleImport, but show user-friendly message
      if (error?.message) {
        toast({
          title: "Lỗi",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể nhập thuốc. Vui lòng thử lại.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icons.import className="h-5 w-5 text-primary" />
          Nhập thuốc vào kho
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="medicine">Thuốc *</Label>
              <Select value={formData.medicineId} onValueChange={(v) => setFormData({ ...formData, medicineId: v })}>
                <SelectTrigger className={errors.medicineId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Chọn thuốc hoặc tạo mới" />
                </SelectTrigger>
                <SelectContent>
                  {medicines.map((m) => (
                    <SelectItem key={m.id.toString()} value={m.id.toString()}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.medicineId && <p className="text-sm text-destructive">{errors.medicineId}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Số lượng *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity > 0 ? formData.quantity.toString() : ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: Number(e.target.value) || 0,
                    })
                  }
                  className={errors.quantity ? "border-destructive" : ""}
                />
                {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Giá nhập (VNĐ)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={(formData.price || selectedMedicine?.price || 0).toString()}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="importDate">Ngày nhập</Label>
                <Input
                  id="importDate"
                  type="date"
                  value={formData.importDate}
                  onChange={(e) => setFormData({ ...formData, importDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiryDate">Hạn sử dụng *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className={errors.expiryDate ? "border-destructive" : ""}
                />
                {errors.expiryDate && <p className="text-sm text-destructive">{errors.expiryDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="batchNumber">Mã lô (Batch) *</Label>
                <Input
                  id="batchNumber"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                  placeholder="VD: AMX-2024-001"
                  className={errors.batchNumber ? "border-destructive" : ""}
                />
                {errors.batchNumber && <p className="text-sm text-destructive">{errors.batchNumber}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="supplier">Nhà cung cấp</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="VD: Dược Hậu Giang"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="gap-2" disabled={isLoading}>
              {isLoading && <Icons.refresh className="h-4 w-4 animate-spin" />}
              <Icons.import className="h-4 w-4" />
              Nhập kho
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  medicineId: "",
                  quantity: 0,
                  importDate: new Date().toISOString().split("T")[0],
                  expiryDate: "",
                  supplier: "",
                  batchNumber: "",
                  price: 0,
                })
                setErrors({})
              }}
            >
              Xóa form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
