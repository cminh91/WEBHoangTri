import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import ContactForm from "@/components/contact/ContactForm"
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
      addresses: true,
      phone: true,
      email: true,
      workingHours: true,
      mapUrl: true,
      hotline: true,
      zalo: true,
      whatsapp: true
    }
  })

  // Lấy workingHours từ contactData, đảm bảo kiểu dữ liệu là WorkingHours hoặc null
  const workingHours = contactData?.workingHours
    ? (contactData.workingHours as unknown as WorkingHours)
    : null;

  let addressText = "Địa chỉ chưa cập nhật";
  if (contactData?.addresses) {
    try {
      const parsed = typeof contactData.addresses === 'string' ? JSON.parse(contactData.addresses) : contactData.addresses;
      if (typeof parsed === 'string') {
        addressText = parsed;
      } else if (Array.isArray(parsed)) {
        addressText = parsed.filter(Boolean).join('<br/>');
      } else if (parsed && typeof parsed === 'object') {
        const values = Object.values(parsed).filter(v => typeof v === 'string' && v.trim() !== '');
        addressText = values.join('<br/>');
      }
    } catch (e) {
      // ignore parse error
    }
  }

  // Map để dịch tên ngày sang tiếng Việt
  const vietnameseDayMap: { [key in keyof WorkingHours]: string } = {
    monday: "Thứ 2",
    tuesday: "Thứ 3",
    wednesday: "Thứ 4",
    thursday: "Thứ 5",
    friday: "Thứ 6",
    saturday: "Thứ 7",
    sunday: "Chủ Nhật"
  };

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
              <p className="text-gray-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: addressText }}></p>
            </div>

            <div className="bg-zinc-900/50 p-6 backdrop-blur-sm border border-zinc-800/50 hover:border-red-600/30 transition-colors">
              <div className="mb-4 flex h-12 w-12 items-center justify-center bg-gradient-to-br from-red-600 to-red-500 shadow-lg">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Liên Hệ</h3>
              <div className="space-y-2">
                <p className="text-gray-400">
                  Điện thoại: <span className="text-white">{contactData?.phone || "Chưa cập nhật"}</span>
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
              <p className="text-gray-400 leading-relaxed">{contactData?.email || "Email chưa cập nhật"}</p>
            </div>

            <div className="rounded-xl bg-zinc-900/50 p-6 backdrop-blur-sm border border-zinc-800/50 hover:border-red-600/30 transition-colors">
              <h3 className="mb-4 text-xl font-bold">Giờ Làm Việc</h3>
              {workingHours ? (
                <ul className="space-y-3 text-gray-400">
                  {Object.entries(workingHours).map(([day, time]) => (
                    <li key={day} className="flex justify-between items-center py-1 border-b border-zinc-800/50 last:border-0">
                      <span>{vietnameseDayMap[day as keyof WorkingHours]}:</span>
                      <span className="font-medium text-white">{time || "N/A"}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Giờ làm việc chưa được cập nhật.</p>
              )}
            </div>
          </div>

          {/* Contact Form - remove rounded-xl class */}
          <div className="bg-zinc-900/50 p-8 lg:col-span-2 backdrop-blur-sm border border-zinc-800/50">
            <h2 className="mb-6 text-2xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
              Gửi Tin Nhắn Cho Chúng Tôi
            </h2>
            <ContactForm />

            {/* Map */}
            <div className="mt-8 overflow-hidden border border-zinc-800/50">
              {contactData?.mapUrl ? (
                <div dangerouslySetInnerHTML={{ __html: contactData.mapUrl }} style={{width: '100%', height: '450px'}}/>
              ) : (
                <p className="p-4 text-center text-gray-500">Bản đồ chưa được cập nhật.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

