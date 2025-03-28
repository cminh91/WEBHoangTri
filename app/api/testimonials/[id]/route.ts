import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  position: z.string().optional(),
  company: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  rating: z.number().int().min(1).max(5).default(5),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const testimonial = await prisma.testimonial.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 })
    }

    return NextResponse.json(testimonial)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching testimonial" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params
    const data = await request.json()
    const validatedData = testimonialSchema.parse(data)

    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        name: validatedData.name,
        position: validatedData.position,
        company: validatedData.company,
        content: validatedData.content,
        rating: validatedData.rating,
        image: validatedData.image,
        isActive: validatedData.isActive,
        order: validatedData.order,
      },
    })

    return NextResponse.json(updatedTestimonial)
  } catch (error) {
    console.error("Error updating testimonial:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error updating testimonial" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await prisma.testimonial.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error deleting testimonial" }, { status: 500 })
  }
} 