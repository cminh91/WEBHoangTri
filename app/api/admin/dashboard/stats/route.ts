import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get total products
    const totalProducts = await prisma.product.count()

    // Get total services
    const totalServices = await prisma.service.count()

    // Get total news
    const totalNews = await prisma.news.count()

    // Get total messages and unread messages
    const totalMessages = await prisma.contactForm.count()
    const unreadMessages = await prisma.contactForm.count({
      where: {
        read: false,
      },
    })

    return NextResponse.json({
      totalProducts,
      totalServices,
      totalNews,
      totalMessages,
      unreadMessages,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Error fetching dashboard stats" }, { status: 500 })
  }
}

