import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  price: z.number().min(0, "Price must be a positive number"),
  salePrice: z.number().optional(),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  categoryId: z.string().optional().nullable(),
  specs: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  images: z.array(
    z.object({
      url: z.string(),
      alt: z.string().optional(),
    })
  ).optional(),
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: params.id,
      },
      include: {
        category: true,
        images: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching product" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params
    const data = await request.json()
    const validatedData = productSchema.parse(data)

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        longDescription: validatedData.longDescription,
        price: validatedData.price,
        salePrice: validatedData.salePrice,
        inStock: validatedData.inStock,
        featured: validatedData.featured,
        isActive: validatedData.isActive,
        categoryId: validatedData.categoryId,
        specs: validatedData.specs,
        metaTitle: validatedData.metaTitle,
        metaDescription: validatedData.metaDescription,
        metaKeywords: validatedData.metaKeywords,
        images: {
          deleteMany: {},
          create: validatedData.images || [],
        }
      },
      include: {
        images: true,
        category: true,
      },
    })

    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error updating product" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await prisma.product.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error deleting product" }, { status: 500 })
  }
}

