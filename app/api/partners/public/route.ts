import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Fetch active partners ordered by order field
    const partners = await prisma.partner.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json(partners)
  } catch (error) {
    console.error("Error fetching partners:", error)
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500 }
    )
  }
} 