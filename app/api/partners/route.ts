import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

const partnerSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  logo: z.string(),
  url: z.string().url().optional().nullable(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await request.json()
    const data = partnerSchema.parse(json)

    const partner = await prisma.partner.create({
      data: {
        name: data.name,
        logo: data.logo,
        website: data.url || null,
        order: data.order,
        isActive: data.isActive
      }
    })

    return NextResponse.json(partner)
  } catch (error) {
    console.error("Error creating partner:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json(
      { error: "Failed to create partner" }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const partners = await prisma.partner.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
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