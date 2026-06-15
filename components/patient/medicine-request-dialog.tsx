"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Icons } from "@/components/icons"

interface MedicineRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { medicineName: string; quantity: number; reason: string }) => Promise<void>
  medicines?: { id: number | string; name: string }[]
}

export function MedicineRequestDialog({ open, onOpenChange, onSubmit, medicines }: MedicineRequestDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    medicineName: "",
    quantity: 1,
    reason: "",
  })

  const [selectedMedicineId, setSelectedMedicineId] = useState<string | undefined>(undefined)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit(formData)
      setFormData({ medicineName: "", quantity: 1, reason: "" })
      setSelectedMedicineId(undefined)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yêu cầu bổ sung thuốc</DialogTitle>
          <DialogDescription>Gửi yêu cầu bổ sung thuốc cho quản trị viên</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="medicineName">Tên thuốc</Label>
              {Array.isArray(medicines) && medicines.length > 0 ? (
                <Select
                  value={selectedMedicineId}
                  onValueChange={(v) => {
                    setSelectedMedicineId(v || undefined)
                    const sel = medicines.find((m) => String(m.id) === v)
                    setFormData({ ...formData, medicineName: sel ? sel.name : "" })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thuốc trong tủ" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicines.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="medicineName"
                  value={formData.medicineName}
                  onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
                  placeholder="Nhập tên thuốc cần bổ sung"
                  required
                />
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Số lượng</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number.parseInt(e.target.value) || 1 })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">Lý do yêu cầu</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Mô tả lý do bạn cần bổ sung thuốc này..."
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Icons.refresh className="mr-2 h-4 w-4 animate-spin" />}
              Gửi yêu cầu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
