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
  }
  contactInfo?: ContactInfoType | null
}

export default function Footer({ storeInfo, contactInfo }: FooterProps) {
  const displayData = {
    name: storeInfo?.name || "MOTO EDIT",
    logoUrl: storeInfo?.logoUrl || "/logo.png",
    address: contactInfo?.address || "N/A",
    phone: contactInfo?.phone || "N/A",
    email: contactInfo?.email || "N/A",
    workingHoursFormatted: contactInfo?.workingHoursFormatted || "N/A",
    facebookUrl: contactInfo?.facebookUrl || "#",
    instagramUrl: contactInfo?.instagramUrl || "#",
    youtubeUrl: contactInfo?.youtubeUrl || "#",
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Giữ nguyên phần JSX cũ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="mb-6">
              <Link href="/">
                <Image 
                  src={displayData.logoUrl} 
                  alt={displayData.name} 
                  width={120} 
                  height={40} 
                  className="h-10 w-auto"
                />
              </Link>
            </div>
            <p className="text-gray-400 mb-6">
              Moto Edit là nhà phân phối các thiết bị và phụ kiện xe máy chính hãng
            </p>
            <div className="flex space-x-4">
              <a href={displayData.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <Facebook />
              </a>
              <a href={displayData.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <Instagram />
              </a>
              <a href={displayData.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                <Youtube />
              </a>
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
              <li className="flex items-start">
                <MapPin className="mr-2 text-red-500 mt-1" size={18} />
                <span className="text-gray-400">{displayData.address}</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2 text-red-500" size={18} />
                <a href={`tel:${displayData.phone}`} className="text-gray-400 hover:text-white">
                  {displayData.phone}
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 text-red-500" size={18} />
                <a href={`mailto:${displayData.email}`} className="text-gray-400 hover:text-white">
                  {displayData.email}
                </a>
              </li>
              <li className="flex items-start">
                <Clock className="mr-2 text-red-500 mt-1" size={18} />
                <span className="text-gray-400">
                  {displayData.workingHoursFormatted}
                </span>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-red-500">Chính Sách</h3>
            <ul className="space-y-3">
              <li><Link href="/bao-hanh" className="text-gray-400 hover:text-white">Bảo hành</Link></li>
              <li><Link href="/van-chuyen" className="text-gray-400 hover:text-white">Vận chuyển</Link></li>
              <li><Link href="/doi-tra" className="text-gray-400 hover:text-white">Đổi trả</Link></li>
              <li><Link href="/dieu-khoan" className="text-gray-400 hover:text-white">Điều khoản</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-gray-800 text-center text-gray-400">
          <p>© {new Date().getFullYear()} {displayData.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
