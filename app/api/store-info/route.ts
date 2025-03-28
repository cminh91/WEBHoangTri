import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

const storeInfoSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  hotline: z.string().min(1, "Hotline is required"),
  footer: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await request.json()
    const data = storeInfoSchema.parse(json)

    const storeInfo = await prisma.storeInfo.create({
      data: {
        name: data.name,
        logo: data.logo,
        favicon: data.favicon,
        hotline: data.hotline,
        footer: data.footer,
      },
    })

    return NextResponse.json(storeInfo)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error creating store info:", error)
    return NextResponse.json({ error: "Error creating store info" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const storeInfo = await prisma.storeInfo.findFirst({
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!storeInfo) {
      return NextResponse.json(null)
    }

    return NextResponse.json(storeInfo)
  } catch (error) {
    console.error("Error fetching store info:", error)
    return NextResponse.json({ error: "Error fetching store info" }, { status: 500 })
  }
}