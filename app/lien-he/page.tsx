import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronRight, Mail, MapPin, Phone } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center text-sm text-gray-400">
          <Link href="/" className="hover:text-red-600">
            Trang Chủ
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="text-white">Liên Hệ</span>
        </div>

        <h1 className="mb-2 text-center text-4xl font-bold uppercase">Liên Hệ</h1>
        <p className="mb-12 text-center text-gray-400">
          Hãy liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi hoặc yêu cầu nào
        </p>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Contact Info */}
          <div className="space-y-8 lg:col-span-1">
            <div className="rounded-lg bg-zinc-900 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-600">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Địa Chỉ</h3>
              <p className="text-gray-400">123 Nguyễn Văn Linh, TP. Buôn Ma Thuột, Đắk Lắk</p>
            </div>

            <div className="rounded-lg bg-zinc-900 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-600">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Điện Thoại</h3>
              <p className="text-gray-400">0905.678.910</p>
              <p className="text-gray-400">0789.123.456</p>
            </div>

            <div className="rounded-lg bg-zinc-900 p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-600">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Email</h3>
              <p className="text-gray-400">info@hoangtrimo.to</p>
              <p className="text-gray-400">support@hoangtrimo.to</p>
            </div>

            <div className="rounded-lg bg-zinc-900 p-6">
              <h3 className="mb-2 text-xl font-bold">Giờ Làm Việc</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex justify-between">
                  <span>Thứ Hai - Thứ Sáu:</span>
                  <span>8:00 - 18:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Thứ Bảy:</span>
                  <span>8:00 - 17:00</span>
                </li>
                <li className="flex justify-between">
                  <span>Chủ Nhật:</span>
                  <span>9:00 - 15:00</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-lg bg-zinc-900 p-8 lg:col-span-2">
            <h2 className="mb-6 text-2xl font-bold">Gửi Tin Nhắn Cho Chúng Tôi</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Họ và Tên <span className="text-red-600">*</span>
                  </label>
                  <Input
                    id="name"
                    placeholder="Nhập họ và tên"
                    className="border-zinc-700 bg-zinc-800 focus:border-red-600"
                    required
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
                />
              </div>

              <Button type="submit" className="w-full bg-red-600 py-6 text-lg hover:bg-red-700">
                Gửi Tin Nhắn
              </Button>
            </form>
          </div>
        </div>

        {/* Map */}
        <div className="mt-16 h-[400px] w-full rounded-lg bg-zinc-900">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15637.57385455332!2d108.03746282542055!3d12.666600291236432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31721d9e86a3325f%3A0x4a9a7d7fb2ed1d10!2zQnXDtG4gTWEgVGh14buZdCwgxJDhuq9rIEzhuq9rLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1652345678901!5m2!1svi!2s"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-lg"
          ></iframe>
        </div>
      </div>
    </div>
  )
}

