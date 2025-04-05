import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronRight, Mail, MapPin, Phone } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/db"

interface WorkingHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export default async function ContactPage() {
  const contactData = await prisma.contact.findFirst({
    select: {
      address: true,
      phone: true,
      email: true,
      workingHours: true,
      mapUrl: true,
      hotline: true,
      zalo: true,
      whatsapp: true
    }
  })

  const defaultWorkingHours: WorkingHours = {
    monday: "8:00 - 18:00",
    tuesday: "8:00 - 18:00",
    wednesday: "8:00 - 18:00",
    thursday: "8:00 - 18:00",
    friday: "8:00 - 18:00",
    saturday: "8:00 - 17:00",
    sunday: "9:00 - 15:00"
  }

  const workingHours = contactData?.workingHours 
    ? {
        monday: String((contactData.workingHours as any).monday),
        tuesday: String((contactData.workingHours as any).tuesday),
        wednesday: String((contactData.workingHours as any).wednesday),
        thursday: String((contactData.workingHours as any).thursday),
        friday: String((contactData.workingHours as any).friday),
        saturday: String((contactData.workingHours as any).saturday),
        sunday: String((contactData.workingHours as any).sunday)
      } as WorkingHours 
    : defaultWorkingHours

  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center text-sm text-gray-400">
          <Link href="/" className="hover:text-red-600 transition-colors">
            Trang Chủ
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="text-white">Liên Hệ</span>
        </div>

        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl md:text-4xl font-bold uppercase bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
            Liên Hệ
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Hãy liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi hoặc yêu cầu nào
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-3">
          {/* Contact Info */}
          <div className="space-y-6 lg:space-y-8">
            <div className="bg-zinc-900/50 p-6 backdrop-blur-sm border border-zinc-800/50 hover:border-red-600/30 transition-colors">
              <div className="mb-4 flex h-12 w-12 items-center justify-center bg-gradient-to-br from-red-600 to-red-500 shadow-lg">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Địa Chỉ</h3>
              <p className="text-gray-400 leading-relaxed">{contactData?.address}</p>
            </div>

            <div className="bg-zinc-900/50 p-6 backdrop-blur-sm border border-zinc-800/50 hover:border-red-600/30 transition-colors">
              <div className="mb-4 flex h-12 w-12 items-center justify-center bg-gradient-to-br from-red-600 to-red-500 shadow-lg">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Liên Hệ</h3>
              <div className="space-y-2">
                <p className="text-gray-400">
                  Điện thoại: <span className="text-white">{contactData?.phone}</span>
                </p>
                {contactData?.hotline && (
                  <p className="text-gray-400">
                    Hotline: <span className="text-red-500">{contactData.hotline}</span>
                  </p>
                )}
                {contactData?.zalo && (
                  <p className="text-gray-400">
                    Zalo: <span className="text-white">{contactData.zalo}</span>
                  </p>
                )}
                {contactData?.whatsapp && (
                  <p className="text-gray-400">
                    WhatsApp: <span className="text-white">{contactData.whatsapp}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-zinc-900/50 p-6 backdrop-blur-sm border border-zinc-800/50 hover:border-red-600/30 transition-colors">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-500 shadow-lg">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Email</h3>
              <p className="text-gray-400 leading-relaxed">{contactData?.email}</p>
            </div>

            <div className="rounded-xl bg-zinc-900/50 p-6 backdrop-blur-sm border border-zinc-800/50 hover:border-red-600/30 transition-colors">
              <h3 className="mb-4 text-xl font-bold">Giờ Làm Việc</h3>
              <ul className="space-y-3 text-gray-400">
                {Object.entries(workingHours).map(([day, time]) => (
                  <li key={day} className="flex justify-between items-center py-1 border-b border-zinc-800/50 last:border-0">
                    <span className="capitalize">{day}:</span>
                    <span className="font-medium text-white">{time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Form - remove rounded-xl class */}
          <div className="bg-zinc-900/50 p-8 lg:col-span-2 backdrop-blur-sm border border-zinc-800/50">
            <h2 className="mb-6 text-2xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
              Gửi Tin Nhắn Cho Chúng Tôi
            </h2>
            <form className="space-y-6">
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

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-red-600 to-red-500 py-6 text-lg font-medium
                hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-lg"
              >
                Gửi Tin Nhắn
              </Button>
            </form>
          </div>
        </div>

        {/* Map - remove rounded-xl class */}
        <div className="mt-12 overflow-hidden border border-zinc-800/50">
          {contactData?.mapUrl ? (
            <div dangerouslySetInnerHTML={{ __html: contactData.mapUrl }} style={{width: '100%', height: '450px'}}/>
          ) : (
            <p className="p-4 text-gray-400">Không có mã nhúng bản đồ.</p>
          )}
        </div>
      </div>
    </div>
  )
}

