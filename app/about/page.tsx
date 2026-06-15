import Link from 'next/link'

export const metadata = {
  title: 'Giới thiệu',
  description: 'Giới thiệu về hệ thống quản lý thuốc bệnh viện',
}

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Giới thiệu</h1>

      <p className="mb-4 text-muted-foreground">
        Đây là hệ thống Quản lý Thuốc dành cho khoa Nội Bệnh viện, giúp quản lý
        tồn kho, yêu cầu thuốc, đơn thuốc và báo cáo. Mục tiêu của ứng dụng là
        tối ưu hóa quy trình, giảm thiểu sai sót và cung cấp giao diện thân thiện
        cho nhân viên y tế.
      </p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Tính năng chính</h2>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Quản lý kho thuốc và nhà cung cấp</li>
          <li>Yêu cầu và xuất phát thuốc cho bệnh nhân</li>
          <li>Báo cáo tồn kho và sử dụng thuốc</li>
          <li>Quản lý bệnh nhân và đơn thuốc</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Đội ngũ phát triển</h2>
        <p className="text-muted-foreground">Nhóm nội bộ bệnh viện & đội phát triển phần mềm.</p>
      </section>

      <div className="flex items-center gap-4">
        <Link href="/contact" className="underline text-primary">
          Liên hệ với chúng tôi
        </Link>
        <Link href="/" className="text-muted-foreground underline">
          Trở về trang chủ
        </Link>
      </div>
    </main>
  )
}
