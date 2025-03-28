import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

// Schema for service validation
const serviceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),  // Thêm trường metaKeywords
  price: z.number().optional(),
  featured: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
  features: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string(),
        alt: z.string().optional(),
      }),
    )
    .optional(),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get("categoryId")
  const featured = searchParams.get("featured") === "true"
  const limit = Number.parseInt(searchParams.get("limit") || "100")

  try {
    const where: any = {}

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (featured) {
      where.featured = true
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        category: true,
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Error fetching services" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const data = serviceSchema.parse(json)

    // Check if slug is unique
    const existingService = await prisma.service.findUnique({
      where: {
        slug: data.slug,
      },
    })

    if (existingService) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    // Extract images from data
    const { images, ...serviceData } = data

    // Create service with nested images
    const service = await prisma.service.create({
      data: {
        ...serviceData,
        images: images
          ? {
              create: images,
            }
          : undefined,
      },
      include: {
        category: true,
        images: true,
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error creating service:", error)
    return NextResponse.json({ error: "Error creating service" }, { status: 500 })
  }
}

