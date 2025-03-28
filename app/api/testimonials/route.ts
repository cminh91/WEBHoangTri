import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

// Schema for testimonial validation
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const isActive = searchParams.get("isActive") !== "false" // Default to true
  const limit = Number.parseInt(searchParams.get("limit") || "100")
  
  try {
    const where: any = {}
    
    if (isActive !== null) {
      where.isActive = isActive
    }
    
    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" }
      ],
      take: limit,
    })
    
    return NextResponse.json(testimonials)
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return NextResponse.json({ error: "Error fetching testimonials" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  try {
    const json = await request.json()
    const data = testimonialSchema.parse(json)
    
    const testimonial = await prisma.testimonial.create({
      data: {
        name: data.name,
        position: data.position,
        company: data.company,
        content: data.content,
        rating: data.rating,
        image: data.image,
        isActive: data.isActive,
        order: data.order,
      },
    })
    
    return NextResponse.json(testimonial)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    
    console.error("Error creating testimonial:", error)
    return NextResponse.json({ error: "Error creating testimonial" }, { status: 500 })
  }
} 