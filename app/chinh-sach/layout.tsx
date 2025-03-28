"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function ChinhSachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  const policyLinks = [
    { href: "/chinh-sach/bao-hanh", title: "Chính Sách Bảo Hành" },
    { href: "/chinh-sach/thanh-toan", title: "Phương Thức Thanh Toán" },
    { href: "/chinh-sach/bao-mat", title: "Chính Sách Bảo Mật" },
    { href: "/chinh-sach/van-chuyen", title: "Chính Sách Vận Chuyển" },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="mb-8 inline-flex items-center text-red-600 hover:text-red-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại trang chủ
        </Link>
      </div>
      
      <div className="grid gap-8 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="sticky top-8 rounded-lg border border-zinc-800 bg-zinc-950 p-6">
            <h3 className="mb-4 text-lg font-bold">Chính Sách</h3>
            <nav className="space-y-2">
              {policyLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded-md p-2 ${
                    pathname === link.href
                      ? "bg-red-600 text-white"
                      : "text-gray-400 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="md:col-span-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
} 