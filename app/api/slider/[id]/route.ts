import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

// Schema for slider validation
const sliderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  url: z.string().min(1, "Image URL is required"),
  link: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const slider = await prisma.slider.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!slider) {
      return NextResponse.json({ error: "Slider not found" }, { status: 404 })
    }

    return NextResponse.json(slider)
  } catch (error) {
    console.error("Error fetching slider:", error)
    return NextResponse.json({ error: "Error fetching slider" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const data = sliderSchema.parse(json)

    const slider = await prisma.slider.update({
      where: {
        id: params.id,
      },
      data,
    })

    return NextResponse.json(slider)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating slider:", error)
    return NextResponse.json({ error: "Error updating slider" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await prisma.slider.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting slider:", error)
    return NextResponse.json({ error: "Error deleting slider" }, { status: 500 })
  }
}

