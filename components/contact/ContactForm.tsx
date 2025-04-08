"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch("/api/contact-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, message }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Có lỗi xảy ra, vui lòng thử lại")
      } else {
        setSuccess(true)
        setName("")
        setEmail("")
        setPhone("")
        setSubject("")
        setMessage("")
      }
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-gray-300">
            Họ và Tên <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            placeholder="Nhập họ và tên"
            className="border-zinc-700/50 bg-zinc-800/50 focus:border-red-500 transition-colors"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email <span className="text-red-600">*</span>
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Nhập email"
            className="border-zinc-700 bg-zinc-800 focus:border-red-600"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Số Điện Thoại <span className="text-red-600">*</span>
          </label>
          <Input
            id="phone"
            placeholder="Nhập số điện thoại"
            className="border-zinc-700 bg-zinc-800 focus:border-red-600"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="subject" className="text-sm font-medium">
            Chủ Đề
          </label>
          <Input
            id="subject"
            placeholder="Nhập chủ đề"
            className="border-zinc-700 bg-zinc-800 focus:border-red-600"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium">
          Tin Nhắn <span className="text-red-600">*</span>
        </label>
        <Textarea
          id="message"
          placeholder="Nhập tin nhắn"
          className="min-h-[150px] border-zinc-700 bg-zinc-800 focus:border-red-600"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {error && <p className="text-red-500">{typeof error === "string" ? error : "Có lỗi xảy ra"}</p>}
      {success && <p className="text-green-500">Gửi tin nhắn thành công!</p>}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-red-600 to-red-500 py-6 text-lg font-medium hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-lg"
      >
        {loading ? "Đang gửi..." : "Gửi Tin Nhắn"}
      </Button>
    </form>
  )
}