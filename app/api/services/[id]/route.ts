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
  longDescription: z.string().min(1, "Content is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  price: z.number().optional(),
  featured: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
  features: z.string().optional(),
  images: z
    .array(
      z.object({
        id: z.string().optional(),
        url: z.string(),
        alt: z.string().optional(),
      }),
    )
    .optional(),
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const service = await prisma.service.findUnique({
      where: {
        id: params.id,
      },
      include: {
        category: true,
        images: true,
      },
    })

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error fetching service:", error)
    return NextResponse.json({ error: "Error fetching service" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const data = serviceSchema.parse(json)

    // Check if slug is unique (excluding current service)
    const existingService = await prisma.service.findFirst({
      where: {
        slug: data.slug,
        id: {
          not: params.id,
        },
      },
    })

    if (existingService) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    // Update service with new data
    const service = await prisma.service.update({
      where: {
        id: params.id,
      },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        longDescription: data.longDescription,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords, // Thêm trường metaKeywords
        price: data.price,
        featured: data.featured,
        categoryId: data.categoryId,
        images: {
          deleteMany: {},
          create: data.images || [],
        },
      },
      include: {
        category: true,
        images: true,
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    // Improved error handling
    let errorMessage = "Error updating service"
    if (error instanceof z.ZodError) {
      errorMessage = error.errors[0]?.message || errorMessage
    } else if (error instanceof Error) {
      errorMessage = error.message
    }

    console.error("Error updating service:", errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Delete service (images will be deleted via cascade)
    await prisma.service.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ error: "Error deleting service" }, { status: 500 })
  }
}

