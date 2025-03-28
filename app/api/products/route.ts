import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

// Schema for product validation
const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  price: z.number().min(0, "Price must be a positive number"),
  salePrice: z.number().min(0, "Sale price must be a positive number"),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
  specs: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string(),
        alt: z.string().optional(),
      }),
    )
    .optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  isActive: z.boolean().default(true),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryId = searchParams.get("categoryId")
  const featured = searchParams.get("featured") === "true"
  const isActive = searchParams.get("isActive") !== "false" // Default to true
  const inStock = searchParams.get("inStock") === "true"
  const limit = Number.parseInt(searchParams.get("limit") || "100")
  const sort = searchParams.get("sort") || "createdAt"
  const order = searchParams.get("order") || "desc"

  try {
    const where: any = {
      isActive: isActive, // Add isActive filter
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (featured) {
      where.featured = true
    }

    if (inStock) {
      where.inStock = true
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        images: true,
      },
      orderBy: {
        [sort]: order,
      },
      take: limit,
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Error fetching products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const data = productSchema.parse(json)

    // Check if slug is unique
    const existingProduct = await prisma.product.findFirst({
      where: {
        slug: data.slug
      },
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      )
    }

    // Create product with all fields
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        longDescription: data.longDescription,
        price: data.price,
        salePrice: data.salePrice,
        inStock: data.inStock,
        featured: data.featured,
        isActive: data.isActive,
        categoryId: data.categoryId,
        specs: data.specs,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords,
        images: data.images ? {
          create: data.images
        } : undefined,
      },
      include: {
        category: true,
        images: true,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Error creating product" }, { status: 500 })
  }
}

