import type React from "react"
import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin", "vietnamese"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Med - Quản lý tủ thuốc bệnh viện",
  description: "Hệ thống quản lý tủ thuốc bệnh viện - trực quan, nhanh, chính xác",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`font-sans antialiased`}>{children}</body>
    </html>
  )
}
