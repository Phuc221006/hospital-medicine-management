"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export type AdminPage = "dashboard" | "medicines" | "patients" | "import" | "export" | "reports" | "alerts" | "medicine-requests"

interface AdminSidebarProps {
  currentPage: AdminPage
  onPageChange: (page: AdminPage) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

const menuItems: { id: AdminPage; label: string; icon: keyof typeof Icons }[] = [
  { id: "dashboard", label: "Tổng quan", icon: "dashboard" },
  { id: "medicines", label: "Quản lý thuốc", icon: "pill" },
  { id: "patients", label: "Bệnh nhân", icon: "users" },
  { id: "import", label: "Nhập thuốc", icon: "import" },
  { id: "export", label: "Xuất thuốc", icon: "export" },
  { id: "medicine-requests", label: "Yêu cầu thuốc", icon: "bell" },
  { id: "reports", label: "Báo cáo", icon: "chart" },
  { id: "alerts", label: "Cảnh báo", icon: "alert" },
]

export function AdminSidebar({ currentPage, onPageChange, isCollapsed, onToggleCollapse }: AdminSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <Icons.pill className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <span className="font-bold text-sidebar-foreground">Med</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? <Icons.chevronRight className="h-4 w-4" /> : <Icons.menu className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {menuItems.map((item) => {
          const Icon = Icons[item.icon]
          return (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3",
                currentPage === item.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isCollapsed && "justify-center px-2",
              )}
              onClick={() => onPageChange(item.id)}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Button>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isCollapsed && "justify-center px-2",
          )}
        >
          <Icons.settings className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Cài đặt</span>}
        </Button>
      </div>
    </aside>
  )
}
