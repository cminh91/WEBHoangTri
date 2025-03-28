"use client"

import { useState, useEffect } from "react"
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Partner {
  id: string
  name: string
  logo: string | null
  url: string | null
  order: number
  isActive: boolean
}

interface StoreInfo {
  name?: string
  address?: string
  phone?: string
  email?: string
  workingHours?: string | { 
    monday?: string
    tuesday?: string
    wednesday?: string
    thursday?: string
    friday?: string
    saturday?: string
    sunday?: string
  }
  workingHoursFormatted?: string
  facebookUrl?: string
  instagramUrl?: string
  youtubeUrl?: string
  logoUrl?: string
}

interface FooterProps {
  storeInfo?: StoreInfo
}

export default function Footer({ storeInfo }: FooterProps) {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [storeData, setStoreData] = useState<StoreInfo | null>(null)

  useEffect(() => {
    // Nếu có dữ liệu từ server component, sử dụng nó
    if (storeInfo) {
      setStoreData(storeInfo)
    } else {
      // Nếu không có dữ liệu từ server, fetch từ API
      const fetchStoreInfo = async () => {
        try {
          const response = await fetch('/api/store')
          if (response.ok) {
            const data = await response.json()
            setStoreData(data)
          }
        } catch (error) {
          console.error('Error fetching store info:', error)
        }
      }
      
      fetchStoreInfo()
    }

    const fetchPartners = async () => {
      try {
        const response = await fetch('/api/partners/public')
        if (response.ok) {
          const data = await response.json()
          setPartners(data)
        }
      } catch (error) {
        console.error('Error fetching partners:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPartners()
  }, [storeInfo])

  // Fallback data nếu không có dữ liệu từ API
  const defaultStoreInfo = {
    name: "MOTO EDIT",
    address: "123 Đường Lớn, Quận 1, TP. Hồ Chí Minh",
    phone: "0123456789",
    email: "info@motoedit.vn",
    workingHours: "8:00 - 17:30 (Thứ 2 - Thứ 7)",
    workingHoursFormatted: "8:00 - 17:30 (Thứ 2 - Thứ 7)",
    facebookUrl: "https://facebook.com",
    instagramUrl: "https://instagram.com",
    youtubeUrl: "https://youtube.com",
    logoUrl: "/logo.png"
  }

  const info = storeData || defaultStoreInfo

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="mb-6">
              <Link href="/">
                <Image 
                  src={info.logoUrl || "/logo.png"} 
                  alt={info.name || "MOTO EDIT"} 
                  width={120} 
                  height={40} 
                  className="h-10 w-auto"
                />
              </Link>
            </div>
            <p className="text-gray-400 mb-6">
              Moto Edit là nhà phân phối các thiết bị và phụ kiện xe máy chính hãng, 
              với nhiều năm kinh nghiệm trong lĩnh vực độ xe và nâng cấp xe máy.
            </p>
            <div className="flex space-x-4">
              <a 
                href={info.facebookUrl || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook />
              </a>
              <a 
                href={info.instagramUrl || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram />
              </a>
              <a 
                href={info.youtubeUrl || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Youtube />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-red-500">Liên Kết Nhanh</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/gioi-thieu" className="text-gray-400 hover:text-white transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/san-pham" className="text-gray-400 hover:text-white transition-colors">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/dich-vu" className="text-gray-400 hover:text-white transition-colors">
                  Dịch vụ
                </Link>
              </li>
              <li>
                <Link href="/tin-tuc" className="text-gray-400 hover:text-white transition-colors">
                  Tin tức
                </Link>
              </li>
              <li>
                <Link href="/lien-he" className="text-gray-400 hover:text-white transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-red-500">Thông Tin Liên Hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="mr-2 text-red-500 flex-shrink-0 mt-1" size={18} />
                <span className="text-gray-400">{info.address || "123 Đường ABC, Quận XYZ"}</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2 text-red-500 flex-shrink-0" size={18} />
                <a href={`tel:${info.phone || ""}`} className="text-gray-400 hover:text-white transition-colors">
                  {info.phone || "0123456789"}
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 text-red-500 flex-shrink-0" size={18} />
                <a href={`mailto:${info.email || ""}`} className="text-gray-400 hover:text-white transition-colors">
                  {info.email || "example@email.com"}
                </a>
              </li>
              <li className="flex items-start">
                <Clock className="mr-2 text-red-500 flex-shrink-0 mt-1" size={18} />
                <span className="text-gray-400">
                  {info.workingHoursFormatted || 
                   (typeof info.workingHours === 'string' 
                     ? info.workingHours 
                     : "8:00 - 17:30 (Thứ 2 - Thứ 7)")}
                </span>
              </li>
            </ul>
          </div>

          {/* Policies & Working Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-red-500">Chính Sách</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/chinh-sach-bao-hanh" className="text-gray-400 hover:text-white transition-colors">
                  Chính sách bảo hành
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-van-chuyen" className="text-gray-400 hover:text-white transition-colors">
                  Chính sách vận chuyển
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-doi-tra" className="text-gray-400 hover:text-white transition-colors">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link href="/dieu-khoan-su-dung" className="text-gray-400 hover:text-white transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Partners */}
        {partners.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-800">
            <h3 className="text-lg font-semibold mb-6 text-center text-red-500">Đối Tác</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {partners.map((partner) => (
                <div key={partner.id} className="flex items-center justify-center">
                  {partner.url ? (
                    <a 
                      href={partner.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white p-2 rounded-md flex items-center justify-center h-16"
                    >
                      {partner.logo ? (
                        <Image 
                          src={partner.logo} 
                          alt={partner.name} 
                          width={80} 
                          height={40}
                          className="max-h-full w-auto object-contain"
                        />
                      ) : (
                        <span className="text-gray-800 text-sm font-medium">{partner.name}</span>
                      )}
                    </a>
                  ) : (
                    <div className="bg-white p-2 rounded-md flex items-center justify-center h-16">
                      {partner.logo ? (
                        <Image 
                          src={partner.logo} 
                          alt={partner.name} 
                          width={80} 
                          height={40}
                          className="max-h-full w-auto object-contain"
                        />
                      ) : (
                        <span className="text-gray-800 text-sm font-medium">{partner.name}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-gray-800 text-center text-gray-400">
          <p>© {new Date().getFullYear()} {info.name || "MOTO EDIT"}. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}

