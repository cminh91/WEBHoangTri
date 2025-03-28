import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, FileText, TrendingUp, Wrench, MessageSquare } from "lucide-react"
import prisma from "@/lib/db"

export default async function AdminDashboard() {
  // Get counts from database
  const productsCount = await prisma.product.count()
  const servicesCount = await prisma.service.count()
  const newsCount = await prisma.news.count()
  const messagesCount = await prisma.contactForm.count()
  const unreadMessagesCount = await prisma.contactForm.count({
    where: { read: false },
  })

  // Get recent activities (latest updates across all models)
  const recentProducts = await prisma.product.findMany({
    take: 5,
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, updatedAt: true },
  })

  const recentServices = await prisma.service.findMany({
    take: 5,
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true },
  })

  const recentNews = await prisma.news.findMany({
    take: 5,
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true },
  })

  // Combine and sort all recent activities
  const recentActivities = [
    ...recentProducts.map((p) => ({
      type: "product",
      id: p.id,
      name: p.name,
      updatedAt: p.updatedAt,
    })),
    ...recentServices.map((s) => ({
      type: "service",
      id: s.id,
      name: s.title,
      updatedAt: s.updatedAt,
    })),
    ...recentNews.map((n) => ({
      type: "news",
      id: n.id,
      name: n.title,
      updatedAt: n.updatedAt,
    })),
  ]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-400">
          Hôm nay:{" "}
          {new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-800 bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng Sản Phẩm</CardTitle>
            <ShoppingBag className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productsCount}</div>
            <p className="mt-1 flex items-center text-xs text-green-500">
              <TrendingUp className="mr-1 h-3 w-3" />
              Đã cập nhật
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng Dịch Vụ</CardTitle>
            <Wrench className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servicesCount}</div>
            <p className="mt-1 flex items-center text-xs text-green-500">
              <TrendingUp className="mr-1 h-3 w-3" />
              Đã cập nhật
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng Bài Viết</CardTitle>
            <FileText className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newsCount}</div>
            <p className="mt-1 flex items-center text-xs text-green-500">
              <TrendingUp className="mr-1 h-3 w-3" />
              Đã cập nhật
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tin Nhắn Mới</CardTitle>
            <MessageSquare className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadMessagesCount}</div>
            <p className="mt-1 flex items-center text-xs text-gray-400">Tổng: {messagesCount} tin nhắn</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-zinc-800 bg-zinc-950">
        <CardHeader>
          <CardTitle>Hoạt Động Gần Đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const typeMap = {
                product: "Sản phẩm",
                service: "Dịch vụ",
                news: "Tin tức",
              }

              const timeAgo = getTimeAgo(activity.updatedAt)

              return (
                <div
                  key={`${activity.type}-${activity.id}`}
                  className="flex items-center justify-between border-b border-zinc-800 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">
                      {typeMap[activity.type as keyof typeof typeMap]}: {activity.name}
                    </p>
                    <p className="text-sm text-gray-400">Đã cập nhật</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">{timeAgo}</p>
                  </div>
                </div>
              )
            })}

            {recentActivities.length === 0 && <div className="text-center text-gray-400">Chưa có hoạt động nào</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to format time ago
function getTimeAgo(date: Date) {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.round(diffMs / 1000)
  const diffMins = Math.round(diffSecs / 60)
  const diffHours = Math.round(diffMins / 60)
  const diffDays = Math.round(diffHours / 24)

  if (diffSecs < 60) {
    return `${diffSecs} giây trước`
  } else if (diffMins < 60) {
    return `${diffMins} phút trước`
  } else if (diffHours < 24) {
    return `${diffHours} giờ trước`
  } else if (diffDays < 30) {
    return `${diffDays} ngày trước`
  } else {
    return date.toLocaleDateString("vi-VN")
  }
}

