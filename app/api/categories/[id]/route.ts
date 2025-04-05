import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"
import { revalidatePath } from 'next/cache'

// Schema for category validation
const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  type: z.enum(["PRODUCT", "SERVICE", "NEWS"]),
  parentId: z.string().optional().nullable(),
  // Removed icon field
  imageUrl: z.string().optional().nullable(), // Added imageUrl
  // featured: z.boolean().optional().default(false),
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const category = await prisma.category.findUnique({
      where: {
        id: params.id,
      },
      include: {
        parent: true,
        subcategories: true,
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error fetching category:", error)
    return NextResponse.json({ error: "Error fetching category" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params; // Get id from params
    const json = await request.json()
    const data = categorySchema.parse(json)

    // Check if slug is unique (excluding current category)
    const existingCategory = await prisma.category.findFirst({
      where: {
        slug: data.slug,
        id: {
          not: id, // Use id here
        },
      },
    })

    if (existingCategory) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    // Prevent category from being its own parent
    if (data.parentId === id) { // Use id here
      return NextResponse.json({ error: "Category cannot be its own parent" }, { status: 400 })
    }

    const category = await prisma.category.update({
      where: {
        id: id, // Use id here
      },
      data,
    })

    // Revalidate cache after update
    revalidatePath('/', 'layout')

    return NextResponse.json(category)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating category:", error)
    return NextResponse.json({ error: "Error updating category" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if category has subcategories
    const subcategories = await prisma.category.findMany({
      where: {
        parentId: params.id,
      },
    })

    if (subcategories.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete category with subcategories. Please delete or reassign subcategories first.",
        },
        { status: 400 },
      )
    }

    // Delete category
    await prisma.category.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ error: "Error deleting category" }, { status: 500 })
  }
}

