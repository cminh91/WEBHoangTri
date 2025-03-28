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

export async function GET() {
  try {
    const sliders = await prisma.slider.findMany({
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json(sliders)
  } catch (error) {
    console.error("Error fetching sliders:", error)
    return NextResponse.json({ error: "Error fetching sliders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const data = sliderSchema.parse(json)

    const slider = await prisma.slider.create({
      data,
    })

    return NextResponse.json(slider)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error creating slider:", error)
    return NextResponse.json({ error: "Error creating slider" }, { status: 500 })
  }
}

