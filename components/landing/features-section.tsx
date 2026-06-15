import { Card, CardContent } from "@/components/ui/card"
import { Icons } from "@/components/icons"

const features = [
  {
    icon: "clipboard",
    title: "Kiểm tra đơn thuốc",
    description: "Bệnh nhân dễ dàng tra cứu đơn thuốc, liều dùng và hướng dẫn sử dụng trực tuyến.",
  },
  {
    icon: "warning",
    title: "Cảnh báo hết hạn",
    description: "Tự động thông báo thuốc sắp hết hạn, giúp quản lý kho hiệu quả.",
  },
  {
    icon: "chart",
    title: "Báo cáo tồn kho",
    description: "Thống kê chi tiết về nhập/xuất thuốc, tồn kho theo thời gian thực.",
  },
  {
    icon: "pill",
    title: "Quản lý thuốc",
    description: "CRUD đầy đủ với phân loại, nhà cung cấp, giá và số lượng tồn.",
  },
  {
    icon: "import",
    title: "Nhập kho thông minh",
    description: "Ghi nhận lô hàng với mã batch, ngày nhập, hạn sử dụng chi tiết.",
  },
  {
    icon: "users",
    title: "Quản lý bệnh nhân",
    description: "Theo dõi lịch sử khám chữa bệnh và đơn thuốc của từng bệnh nhân.",
  },
] as const

export function FeaturesSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">Tính năng nổi bật</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Hệ thống được thiết kế để đáp ứng mọi nhu cầu quản lý dược phẩm của bệnh viện
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = Icons[feature.icon as keyof typeof Icons]
            return (
              <Card key={feature.title} className="border-border/50 bg-card hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-card-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
