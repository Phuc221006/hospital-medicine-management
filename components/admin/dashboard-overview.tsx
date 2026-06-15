"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import type { DashboardKPIs, Transaction, Medicine, MedicineCategory } from "@/lib/types"
import { categoryLabels } from "@/lib/mock-data"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface DashboardOverviewProps {
  kpis: DashboardKPIs
  medicines: Medicine[]
  transactions: Transaction[]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export function DashboardOverview({ kpis, medicines, transactions }: DashboardOverviewProps) {
  const kpiCards = [
    {
      title: "Tổng số thuốc",
      value: kpis.totalMedicines,
      icon: "pill" as const,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Thuốc sắp hết",
      value: kpis.lowStockCount,
      icon: "warning" as const,
      color: "text-warning-foreground",
      bgColor: "bg-warning/10",
    },
    {
      title: "Thuốc hết hạn",
      value: kpis.expiredCount,
      icon: "alert" as const,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "Nhập hôm nay",
      value: kpis.todayImportsCount || kpis.todayImports || 0,
      icon: "import" as const,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ]

  // Prepare chart data from KPIs stockByCategory
  const categoryData = kpis.stockByCategory
    ? Object.entries(kpis.stockByCategory).map(([category, quantity]) => ({
        name: category,
        value: quantity,
      }))
    : Object.entries(
        medicines.reduce(
          (acc, med) => {
            const catName = med.categoryName || categoryLabels[med.category as MedicineCategory] || med.category || "Khác"
            acc[catName] = (acc[catName] || 0) + (med.totalStock || med.quantity || 0)
            return acc
          },
          {} as Record<string, number>,
        ),
      ).map(([category, quantity]) => ({
        name: category,
        value: quantity,
      }))

  const recentTransactions = transactions.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = Icons[kpi.icon]
          return (
            <Card key={kpi.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <p className="text-3xl font-bold text-foreground">{kpi.value}</p>
                  </div>
                  <div className={`rounded-lg p-3 ${kpi.bgColor}`}>
                    <Icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Stock by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tồn kho theo loại thuốc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Stock Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mức tồn kho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={medicines.slice(0, 6).map((m) => ({
                    name: m.name.length > 15 ? m.name.substring(0, 15) + "..." : m.name,
                    quantity: m.totalStock || m.quantity || 0,
                    min: m.minStock || 0,
                  }))}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#0088FE" name="Tồn kho" />
                  <Bar dataKey="min" fill="#FF8042" name="Tối thiểu" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className={`rounded-lg p-2 ${tx.type === "import" ? "bg-success/10" : "bg-info/10"}`}>
                    {tx.type === "import" ? (
                      <Icons.import className="h-4 w-4 text-success" />
                    ) : (
                      <Icons.export className="h-4 w-4 text-info" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {tx.type === "import" ? "Nhập kho" : "Xuất kho"}: {tx.medicineName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {tx.userName} • {(() => {
                        // Backend may return different date fields depending on transaction type
                        const rawDate = (tx as any).date || (tx as any).exportDate || (tx as any).createdAt || null
                        if (!rawDate) return "N/A"
                        try {
                          const date = new Date(rawDate)
                          return isNaN(date.getTime()) ? String(rawDate) : date.toLocaleDateString("vi-VN")
                        } catch {
                          return String(rawDate)
                        }
                      })()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${tx.type === "import" ? "text-success" : "text-info"}`}>
                    {tx.type === "import" ? "+" : "-"}
                    {tx.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
