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
    // Get 5 most recent contact form submissions
    const recentMessages = await prisma.contactForm.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        read: true,
        createdAt: true,
      },
    })

    return NextResponse.json(recentMessages)
  } catch (error) {
    console.error("Error fetching recent messages:", error)
    return NextResponse.json({ error: "Error fetching recent messages" }, { status: 500 })
  }
}

