import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { subDays, format, startOfDay, endOfDay } from "date-fns"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get analytics data for the last 7 days
    const days = 7
    const data = []

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const startDate = startOfDay(date)
      const endDate = endOfDay(date)

      const analytics = await prisma.analytics.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      })

      // Sum page views and unique visitors for the day
      const pageViews = analytics.reduce((sum, item) => sum + item.pageViews, 0)
      const visitors = analytics.reduce((sum, item) => sum + item.uniqueVisitors, 0)

      data.push({
        name: format(date, "dd/MM"),
        pageViews,
        visitors,
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching overview data:", error)
    return NextResponse.json({ error: "Error fetching overview data" }, { status: 500 })
  }
}

