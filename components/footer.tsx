"use client"

import { Facebook, Instagram, Youtube, MapPin, Phone, Mail, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface ContactInfoType {
  address?: string | null
  phone?: string | null
  email?: string | null
  workingHours?: any | null
  workingHoursFormatted?: string | null
  facebookUrl?: string | null
  instagramUrl?: string | null
  youtubeUrl?: string | null
}

interface FooterProps {
  storeInfo?: {
    name?: string
    logoUrl?: string
    footer?: string
    logo?: string
  } | null
  contactInfo?: ContactInfoType | null
  policies?: Array<{
    id: string
    title: string
    slug: string
    excerpt?: string | null
    order?: number
  }> | null
}

export default function Footer({ storeInfo, contactInfo, policies }: FooterProps) {

  // Hàm helper để dịch ngày sang tiếng Việt
  const formatWorkingHoursVietnamese = (hoursString: string | null | undefined): string => {
    if (!hoursString) return "Thông tin giờ làm việc chưa cập nhật";

    const dayMap: { [key: string]: string } = {
      "Mon": "Thứ 2",
      "Tue": "Thứ 3",
      "Wed": "Thứ 4",
      "Thu": "Thứ 5",
      "Fri": "Thứ 6",
      "Sat": "Thứ 7",
      "Sun": "Chủ Nhật",
      "Monday": "Thứ 2",
      "Tuesday": "Thứ 3",
      "Wednesday": "Thứ 4",
      "Thursday": "Thứ 5",
      "Friday": "Thứ 6",
      "Saturday": "Thứ 7",
      "Sunday": "Chủ Nhật"
    };

    let formattedString = hoursString;
    // Thay thế các từ viết tắt hoặc tên đầy đủ
    Object.keys(dayMap).forEach(key => {
      // Sử dụng regex để đảm bảo chỉ thay thế từ đứng riêng lẻ (word boundary \b)
      // và không phân biệt chữ hoa/thường (i)
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      formattedString = formattedString.replace(regex, dayMap[key]);
    });

    // Có thể thêm các thay thế khác nếu cần (ví dụ: AM/PM)
    // formattedString = formattedString.replace(/AM/gi, 'Sáng');
    // formattedString = formattedString.replace(/PM/gi, 'Chiều');

    return formattedString;
  };
  const displayData = {
    name: storeInfo?.name || "",
    logoUrl: storeInfo?.logoUrl || storeInfo?.logo || "",
    footer: storeInfo?.footer || "",
    address: contactInfo?.address || "",
    phone: contactInfo?.phone || "",
    email: contactInfo?.email || "",
    workingHoursFormatted: contactInfo?.workingHoursFormatted || "",
    facebookUrl: contactInfo?.facebookUrl || "",
    instagramUrl: contactInfo?.instagramUrl || "",
    youtubeUrl: contactInfo?.youtubeUrl || "",
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="mb-6">
              <Link href="/">
                {displayData.logoUrl && (
                  <Image 
                    src={displayData.logoUrl} 
                    alt={displayData.name} 
                    width={120} 
                    height={40} 
                    className="h-10 w-auto"
                  />
                )}
              </Link>
            </div>
            {displayData.footer && (
              <div 
                className="text-gray-400 mb-6"
                dangerouslySetInnerHTML={{ __html: displayData.footer }} 
              />
            )}
            <div className="flex space-x-4">
              {displayData.facebookUrl && (
                <a href={displayData.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <Facebook />
                </a>
              )}
              {displayData.instagramUrl && (
                <a href={displayData.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <Instagram />
                </a>
              )}
              {displayData.youtubeUrl && (
                <a href={displayData.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                  <Youtube />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-red-500">Liên Kết Nhanh</h3>
            <ul className="space-y-3">
              <li><Link href="/gioi-thieu" className="text-gray-400 hover:text-white">Giới thiệu</Link></li>
              <li><Link href="/san-pham" className="text-gray-400 hover:text-white">Sản phẩm</Link></li>
              <li><Link href="/dich-vu" className="text-gray-400 hover:text-white">Dịch vụ</Link></li>
              <li><Link href="/tin-tuc" className="text-gray-400 hover:text-white">Tin tức</Link></li>
              <li><Link href="/lien-he" className="text-gray-400 hover:text-white">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-red-500">Thông Tin Liên Hệ</h3>
            <ul className="space-y-4">
              {displayData.address && (
                <li className="flex items-start">
                  <MapPin className="mr-2 text-red-500 mt-1" size={18} />
                  <span className="text-gray-400">{displayData.address}</span>
                </li>
              )}
              {displayData.phone && (
                <li className="flex items-center">
                  <Phone className="mr-2 text-red-500" size={18} />
                  <a href={`tel:${displayData.phone}`} className="text-gray-400 hover:text-white">
                    {displayData.phone}
                  </a>
                </li>
              )}
              {displayData.email && (
                <li className="flex items-center">
                  <Mail className="mr-2 text-red-500" size={18} />
                  <a href={`mailto:${displayData.email}`} className="text-gray-400 hover:text-white">
                    {displayData.email}
                  </a>
                </li>
              )}
              {displayData.workingHoursFormatted && (
                <li className="flex items-start">
                  <Clock className="mr-2 text-red-500 mt-1" size={18} />
                  <span className="text-gray-400">
                    {formatWorkingHoursVietnamese(displayData.workingHoursFormatted)}
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-red-500">Chính Sách</h3>
            <ul className="space-y-3">
              {policies && policies.length > 0 ? (
                policies.map(policy => (
                  <li key={policy.id}>
                    <Link 
                      href={`/chinh-sach/${policy.slug}`} 
                      className="text-gray-400 hover:text-white"
                    >
                      {policy.title}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-400">Không có chính sách nào</li>
              )}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-gray-800 text-center text-gray-400">
         Bản quyền © 2025. Thiết kế bởi Evosea
        </div>
      </div>
    </footer>
  )
}
