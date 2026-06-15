"use client"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

interface HeroSectionProps {
  onLogin: () => void
}

export function HeroSection({ onLogin }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/20 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Icons.hospital className="h-4 w-4" />
            <span>Hệ thống quản lý dược phẩm</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
            Quản lý tủ thuốc bệnh viện
            <span className="block text-primary">trực quan, nhanh, chính xác</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground text-pretty">
            Giải pháp toàn diện cho việc quản lý thuốc, theo dõi tồn kho, cảnh báo hết hạn và báo cáo thống kê. Dành cho
            bệnh viện và phòng khám hiện đại.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" onClick={onLogin} className="gap-2 min-w-[200px]">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Đăng nhập bằng Google
            </Button>
            <Button size="lg" variant="outline" onClick={onLogin} className="min-w-[200px] bg-transparent">
              Đăng nhập Admin
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
    </section>
  )
}
