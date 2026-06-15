"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"
import type { Medicine, PatientInfo } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

interface ExportMedicineProps {
  medicines: Medicine[]
  patients: PatientInfo[]
  onExport: (data: {
    patientId: string
    items: { medicineId: string; quantity: number }[]
    notes?: string
  }) => Promise<void>
}

interface ExportItem {
  medicineId: string
  medicineName: string
  quantity: number
  maxQuantity: number
}

export function ExportMedicine({ medicines, patients, onExport }: ExportMedicineProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [patientId, setPatientId] = useState("")
  const [patientSearch, setPatientSearch] = useState("")
  const debouncedPatientSearch = useDebounce(patientSearch, 300)
  const [items, setItems] = useState<ExportItem[]>([])
  const [selectedMedicineId, setSelectedMedicineId] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { toast } = useToast()

  const selectedPatient = patients.find((p) => p.id === patientId)
  // `selectedMedicineId` is a string (from Select). Compare as string to match numeric ids.
  const selectedMedicine = medicines.find((m) => String(m.id) === String(selectedMedicineId))

  const filteredPatients = useMemo(() => {
    if (!patients || patients.length === 0) return []
    const searchLower = debouncedPatientSearch.toLowerCase()
    return patients.filter(
      (p) =>
        p.name?.toLowerCase().includes(searchLower) ||
        p.email?.toLowerCase().includes(searchLower),
    )
  }, [patients, debouncedPatientSearch])

  const addItem = () => {
    console.log("Adding item", { selectedMedicineId, quantity })
    if (!selectedMedicine || quantity <= 0) return

    const availableStock = selectedMedicine.totalStock || selectedMedicine.quantity || 0

    if (quantity > availableStock) {
      toast({
        title: "Lỗi",
        description: `Số lượng vượt quá tồn kho (còn ${availableStock})`,
        variant: "destructive",
      })
      return
    }

    const existingIndex = items.findIndex((i) => i.medicineId === selectedMedicineId.toString())

    if (existingIndex >= 0) {
      const updated = [...items]
      const newQuantity = updated[existingIndex].quantity + quantity
      if (newQuantity > availableStock) {
        toast({
          title: "Lỗi",
          description: `Tổng số lượng vượt quá tồn kho`,
          variant: "destructive",
        })
        return
      }
      updated[existingIndex].quantity = newQuantity
      setItems(updated)
    } else {
      setItems([
        ...items,
        {
          medicineId: selectedMedicine.id.toString(),
          medicineName: selectedMedicine.name,
          quantity,
          maxQuantity: availableStock,
        },
      ])
    }

    setSelectedMedicineId("")
    setQuantity(1)
  }

  const removeItem = (medicineId: string) => {
    setItems(items.filter((i) => i.medicineId !== medicineId))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!patientId) {
      newErrors.patientId = "Vui lòng chọn bệnh nhân"
    }
    if (items.length === 0) {
      newErrors.items = "Vui lòng thêm ít nhất một thuốc"
    }

    const invalidItem = items.find((i) => i.quantity > i.maxQuantity)
    if (invalidItem) {
      newErrors.items = `Số lượng ${invalidItem.medicineName} vượt quá tồn kho`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Check if form is valid for enabling submit button
  const isFormValid = Boolean(patientId) && items.length > 0 && !isLoading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsLoading(true)
    try {
      await onExport({
        patientId,
        items: items.map((item) => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
        })),
        notes: notes || undefined,
      })

      // Reset form
      setPatientId("")
      setPatientSearch("")
      setItems([])
      setNotes("")
      setErrors({})
    } catch (error: any) {
      // Error is already handled in handleExport, but show user-friendly message
      if (error?.message) {
        toast({
          title: "Lỗi",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Lỗi",
          description: "Không thể xuất thuốc. Vui lòng thử lại.",
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
          <Icons.export className="h-5 w-5 text-primary" />
          Xuất thuốc cho bệnh nhân
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection with Search */}
          <div className="grid gap-2">
            <Label>Bệnh nhân *</Label>
            <div className="space-y-2">
              <Input
                placeholder="Tìm kiếm bệnh nhân..."
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
              />
              <Select value={patientId || ""} onValueChange={setPatientId}>
                <SelectTrigger className={errors.patientId ? "border-destructive" : ""}>
                  <SelectValue placeholder="Chọn bệnh nhân..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredPatients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} - {p.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPatient && (
              <p className="text-sm text-muted-foreground">
                Đã chọn: {selectedPatient.name} ({selectedPatient.email})
              </p>
            )}
            {errors.patientId && <p className="text-sm text-destructive">{errors.patientId}</p>}
          </div>

          {/* Add Medicine */}
          <div className="space-y-4">
            <Label>Thuốc xuất *</Label>
            <div className="flex gap-3">
              <Select value={selectedMedicineId || ""} onValueChange={setSelectedMedicineId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Chọn thuốc..." />
                </SelectTrigger>
                <SelectContent>
                  {medicines
                    .filter((m) => (m.totalStock || m.quantity || 0) > 0)
                    .map((m) => (
                      <SelectItem key={m.id.toString()} value={m.id.toString()}>
                        {m.name} (Còn: {m.totalStock || m.quantity || 0})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="1"
                max={selectedMedicine ? (selectedMedicine.totalStock || selectedMedicine.quantity || 0) : 999}
                value={quantity.toString()}
                onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                className="w-24"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={addItem} 
                disabled={!selectedMedicineId || quantity <= 0}
                title={!selectedMedicineId ? "Vui lòng chọn thuốc" : quantity <= 0 ? "Số lượng phải lớn hơn 0" : "Thêm vào danh sách"}
              >
                <Icons.plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Items List */}
            {items.length > 0 ? (
              <div className="space-y-2 rounded-lg border p-4">
                {items.map((item) => (
                  <div key={item.medicineId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.medicineName}</span>
                      <Badge variant="secondary">x{item.quantity}</Badge>
                      <span className="text-xs text-muted-foreground">(Còn: {item.maxQuantity})</span>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(item.medicineId)}>
                      <Icons.close className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                Chưa có thuốc nào. Vui lòng chọn thuốc và nhấn nút <strong>+</strong> để thêm vào danh sách.
              </div>
            )}
            {errors.items && <p className="text-sm text-destructive">{errors.items}</p>}
          </div>

          {/* Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Theo đơn thuốc #123"
            />
          </div>

          <div className="flex gap-3">
            <Button 
              type="submit" 
              className="gap-2" 
              disabled={!isFormValid}
              title={!patientId ? "Vui lòng chọn bệnh nhân" : items.length === 0 ? "Vui lòng thêm thuốc vào danh sách" : ""}
            >
              {isLoading && <Icons.refresh className="h-4 w-4 animate-spin" />}
              <Icons.export className="h-4 w-4" />
              Xuất thuốc
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPatientId("")
                setPatientSearch("")
                setItems([])
                setNotes("")
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
