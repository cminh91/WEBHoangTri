import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get current date
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get first day of current month
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Get stats
    const [totalProducts, totalServices, totalNews, totalMessages, totalCategories, todayViews, monthlyViews] =
      await Promise.all([
        prisma.product.count(),
        prisma.service.count(),
        prisma.news.count(),
        prisma.contactForm.count(),
        prisma.category.count(),
        prisma.analytics.findFirst({
          where: {
            date: {
              gte: today,
            },
          },
          select: {
            pageViews: true,
          },
        }),
        prisma.analytics.findFirst({
          where: {
            date: {
              gte: firstDayOfMonth,
            },
          },
          select: {
            pageViews: true,
          },
        }),
      ])

    // Get analytics data for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const analyticsData = await prisma.analytics.findMany({
      where: {
        date: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        date: "asc",
      },
    })

    // Format analytics data for charts
    const formattedAnalytics = {
      labels: analyticsData.map((item) => new Date(item.date).toLocaleDateString("vi-VN")),
      pageViews: analyticsData.map((item) => item.pageViews),
      uniqueVisitors: analyticsData.map((item) => item.uniqueVisitors),
    }

    return NextResponse.json({
      stats: {
        totalProducts,
        totalServices,
        totalNews,
        totalMessages,
        totalCategories,
        todayViews: todayViews?.pageViews || 0,
        monthlyViews: monthlyViews?.pageViews || 0,
        recentViews: analyticsData.reduce((sum, item) => sum + item.pageViews, 0),
      },
      analytics: formattedAnalytics,
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Error fetching dashboard data" }, { status: 500 })
  }
}

