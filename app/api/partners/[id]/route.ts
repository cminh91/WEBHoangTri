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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const partner = await prisma.partner.findUnique({
      where: { id: params.id },
    })

    if (!partner) {
      return NextResponse.json(
        { error: "Partner not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(partner)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch partner" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const json = await request.json()
    const data = partnerSchema.parse(json)

    const partner = await prisma.partner.update({
      where: { id: params.id },
      data: {
        name: data.name,
        logo: data.logo,
        website: data.url,
        order: data.order,
        isActive: data.isActive,
      },
    })

    return NextResponse.json(partner)
  } catch (error) {
    console.error("Error updating partner:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update partner" },
      { status: 500 }
    )
  }
}

// DELETE /api/partners/[id] - Delete a partner
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if partner exists
    const partnerExists = await prisma.partner.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!partnerExists) {
      return NextResponse.json(
        { error: "Partner not found" },
        { status: 404 }
      )
    }

    // Delete partner
    await prisma.partner.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json(
      { message: "Partner deleted successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("[PARTNER_DELETE]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}