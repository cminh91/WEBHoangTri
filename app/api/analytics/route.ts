import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "7days"
  const path = searchParams.get("path")

  try {
    // Calculate date range based on period
    const now = new Date()
    const startDate = new Date()

    switch (period) {
      case "today":
        startDate.setHours(0, 0, 0, 0)
        break
      case "yesterday":
        startDate.setDate(now.getDate() - 1)
        startDate.setHours(0, 0, 0, 0)
        break
      case "7days":
        startDate.setDate(now.getDate() - 7)
        break
      case "30days":
        startDate.setDate(now.getDate() - 30)
        break
      case "6months":
        startDate.setMonth(now.getMonth() - 6)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Build where clause
    const where: any = {
      date: {
        gte: startDate,
      },
    }

    if (path) {
      where.path = path
    }

    // Get analytics data
    const analytics = await prisma.analytics.findMany({
      where,
      orderBy: {
        date: "asc",
      },
    })

    // Get summary data
    const totalPageViews = await prisma.analytics.aggregate({
      where,
      _sum: {
        pageViews: true,
      },
    })

    const totalUniqueVisitors = await prisma.analytics.aggregate({
      where,
      _sum: {
        uniqueVisitors: true,
      },
    })

    // Get top pages
    const topPages = await prisma.$queryRaw`
      SELECT path, SUM(pageViews) as views
      FROM Analytics
      WHERE date >= ${startDate}
      GROUP BY path
      ORDER BY views DESC
      LIMIT 10
    `

    // Get device distribution
    const deviceDistribution = await prisma.$queryRaw`
      SELECT device, SUM(uniqueVisitors) as count
      FROM Analytics
      WHERE date >= ${startDate}
      GROUP BY device
      ORDER BY count DESC
    `

    return NextResponse.json({
      analytics,
      summary: {
        pageViews: totalPageViews._sum.pageViews || 0,
        uniqueVisitors: totalUniqueVisitors._sum.uniqueVisitors || 0,
      },
      topPages,
      deviceDistribution,
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Error fetching analytics" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const { path, referrer, device, browser, country } = json

    // Bỏ qua nếu truy cập trang admin
    if (path && path.startsWith('/admin')) {
      return NextResponse.json({ success: true, skipped: true })
    }

    // Get today's date with time set to 00:00:00
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if we already have an entry for this path and date
    const existingEntry = await prisma.analytics.findFirst({
      where: {
        path,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Next day
        },
      },
    })

    if (existingEntry) {
      // Update existing entry
      await prisma.analytics.update({
        where: {
          id: existingEntry.id,
        },
        data: {
          pageViews: { increment: 1 },
          uniqueVisitors: { increment: 1 }, // This is simplified; in reality, you'd track unique visitors differently
        },
      })
    } else {
      // Create new entry
      await prisma.analytics.create({
        data: {
          path,
          referrer,
          device,
          browser,
          country,
          pageViews: 1,
          uniqueVisitors: 1,
          date: today,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error recording analytics:", error)
    return NextResponse.json({ error: "Error recording analytics" }, { status: 500 })
  }
}

