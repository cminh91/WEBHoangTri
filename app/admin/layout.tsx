import type React from "react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Toaster } from "@/components/ui/toaster"
import Link from "next/link"
import {
  LayoutDashboard,
  ShoppingBag,
  Wrench,
  FileText,
  MessageSquare,
  Settings,
  BarChart,
  FileCode,
  Users,
  Phone,
  Info,
  LogOut,
  House,
  Key,
  HelpCircle,
  Star,
  Briefcase
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Add this interface at the top of your file
interface SidebarItem {
  icon: React.ReactNode
  label: string
  href: string
  children?: SidebarItem[]
}

// Tách layout riêng cho trang đăng nhập
export function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-900">
      {children}
      <Toaster />
    </div>
  )
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Admin sidebar items
  const sidebarItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/admin" },
    { icon: <ShoppingBag size={20} />, label: "Danh mục", href: "/admin/categories" },
    { icon: <ShoppingBag size={20} />, label: "Sản Phẩm", href: "/admin/products" },
    { icon: <Briefcase size={20} />, label: "Gói Dịch Vụ", href: "/admin/service-packages" },
    { icon: <Users size={20} />, label: "Khách Hàng", href: "/admin/khach-hang" },
    { icon: <Wrench size={20} />, label: "Dịch Vụ", href: "/admin/services" },
    { icon: <FileText size={20} />, label: "Tin Tức", href: "/admin/news" },
    { icon: <MessageSquare size={20} />, label: "Tin Nhắn", href: "/admin/messages" },
    { icon: <BarChart size={20} />, label: "Thống Kê", href: "/admin/analytics" },
    { icon: <FileCode size={20} />, label: "Chính Sách", href: "/admin/policies" },
    { icon: <HelpCircle size={20} />, label: "FAQ", href: "/admin/faqs" },
    { icon: <Star size={20} />, label: "Đánh Giá", href: "/admin/testimonials" },
    { icon: <Briefcase size={20} />, label: "Đối Tác", href: "/admin/partners" },
    { icon: <Users size={20} />, label: "Đội Ngũ", href: "/admin/team" },
    { icon: <Phone size={20} />, label: "Liên Hệ", href: "/admin/contact" },
    { icon: <Info size={20} />, label: "Giới Thiệu", href: "/admin/about" },
    { icon: <House size={20} />, label: "Thông tin cửa hàng", href: "/admin/store" },
    { icon: <Info size={20} />, label: "Slider", href: "/admin/slider" },
    { icon: <Settings size={20} />, label: "Cài Đặt", href: "/admin/settings", children: [
      { icon: <Key size={20} />, label: "Thay đổi mật khẩu", href: "/admin/settings/password" }
    ]},
  ]

  return (
    <div className="flex min-h-screen bg-zinc-900">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-zinc-800 bg-zinc-950 md:flex">
        <div className="flex h-16 items-center border-b border-zinc-800 px-6">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600">
              <span className="text-sm font-bold text-white">HT</span>
            </div>
            <span className="text-lg font-bold">Admin Panel</span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-auto p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item, index) => (
              <li key={index}>
                <Link href={item.href}>
                  <Button variant="ghost" className="w-full justify-start hover:bg-zinc-800">
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Button>
                </Link>
                {item.children && (
                  <ul className="ml-6 mt-2 space-y-2">
                    {item.children.map((child, childIndex) => (
                      <li key={`${index}-${childIndex}`}>
                        <Link href={child.href}>
                          <Button variant="ghost" className="w-full justify-start hover:bg-zinc-800">
                            {child.icon}
                            <span className="ml-2">{child.label}</span>
                          </Button>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{session?.user?.name}</p>
              <p className="text-sm text-gray-400">{session?.user?.email}</p>
            </div>
            <form action="/api/auth/signout" method="POST">
              <Button variant="ghost" size="icon" className="text-red-500 hover:bg-zinc-800 hover:text-red-400">
                <LogOut size={20} />
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="fixed inset-x-0 top-0 z-40 border-b border-zinc-800 bg-zinc-950 md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600">
              <span className="text-sm font-bold text-white">HT</span>
            </div>
            <span className="text-lg font-bold">Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm">{session?.user?.name}</span>
            <form action="/api/auth/signout" method="POST">
              <Button variant="ghost" size="icon" className="text-red-500 hover:bg-zinc-800 hover:text-red-400">
                <LogOut size={20} />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 md:ml-64">
        <div className="pt-16 md:pt-0">
          {children}
          {/* Chỉ để Toaster ở đây, không có Footer */}
          <Toaster />
        </div>
      </main>
    </div>
  )
}

