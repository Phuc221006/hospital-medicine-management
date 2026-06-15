"use client"

import { useState } from 'react'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Button } from '../../components/ui/button'
import Link from 'next/link'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !message) {
      alert('Vui lòng điền đầy đủ thông tin.')
      return
    }

    setSubmitting(true)
    try {
      // Tạm thời chỉ log. Thay bằng fetch tới API khi cần.
      console.log('Contact submit', { name, email, message })
      alert('Cảm ơn bạn! Tin nhắn đã được gửi.')
      setName('')
      setEmail('')
      setMessage('')
    } catch (err) {
      console.error(err)
      alert('Gửi thất bại. Vui lòng thử lại sau.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">Liên hệ</h1>

      <p className="mb-6 text-muted-foreground">
        Gửi phản hồi, yêu cầu hỗ trợ hoặc đề xuất cải tiến cho hệ thống.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <div className="mb-1 font-medium">Họ và tên</div>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên của bạn" />
        </label>

        <label className="block">
          <div className="mb-1 font-medium">Email</div>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>

        <label className="block">
          <div className="mb-1 font-medium">Tin nhắn</div>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Nội dung tin nhắn" />
        </label>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
          </Button>
          <Link href="/" className="text-muted-foreground underline">
            Trở về
          </Link>
        </div>
      </form>
    </main>
  )
}
