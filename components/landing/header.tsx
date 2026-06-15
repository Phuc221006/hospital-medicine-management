"use client"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

interface HeaderProps {
  onLogin: () => void
}

export function Header({ onLogin }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Icons.pill className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Med</span>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Home
          </a>
          <a href="about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Giới thiệu
          </a>
          <a href="contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Liên hệ
          </a>
        </nav>

        <Button onClick={onLogin} size="sm">
          Đăng nhập
        </Button>
      </div>
    </header>
  )
}
