import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

// Schema for storeinfo validation
const storeInfoSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  hotline: z.string().min(1, "Hotline is required"),
  footer: z.string().optional(),
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const storeInfo = await prisma.storeInfo.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!storeInfo) {
      return NextResponse.json({ error: "Store info not found" }, { status: 404 })
    }

    return NextResponse.json(storeInfo)
  } catch (error) {
    console.error("Error fetching store info:", error)
    return NextResponse.json({ error: "Error fetching store info" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const data = storeInfoSchema.parse(json)

    const storeInfo = await prisma.storeInfo.update({
      where: {
        id: params.id,
      },
      data,
    })

    return NextResponse.json(storeInfo)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating store info:", error)
    return NextResponse.json({ error: "Error updating store info" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await prisma.storeInfo.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting store info:", error)
    return NextResponse.json({ error: "Error deleting store info" }, { status: 500 })
  }
}