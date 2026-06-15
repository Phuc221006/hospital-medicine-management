import { Icons } from "@/components/icons"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Icons.pill className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Med</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Về chúng tôi
            </a>
            <a href="/contact" className="hover:text-foreground transition-colors">
              Liên hệ
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Hỗ trợ
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Điều khoản
            </a>
          </div>

          <div className="text-sm text-muted-foreground">Phiên bản 1.0.0 &copy; 2025</div>
        </div>
      </div>
    </footer>
  )
}
