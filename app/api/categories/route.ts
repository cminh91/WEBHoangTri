import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

// Schema for category validation
const categorySchema = z.object({
  name: z.string().min(1, "Tên danh mục là bắt buộc"),
  slug: z.string().min(1, "Slug là bắt buộc"),
  description: z.string().optional().nullable(),
  type: z.enum(["PRODUCT", "SERVICE", "NEWS"], {
    required_error: "Loại danh mục là bắt buộc",
  }),
  parentId: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  // featured: z.boolean().optional().default(false),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  const parentId = searchParams.get("parentId")
  const hierarchical = searchParams.get("hierarchical") === "true"

  try {
    const where: any = {}

    if (type) {
      where.type = type
    }

    if (parentId === "null") {
      where.parentId = null
    } else if (parentId) {
      where.parentId = parentId
    }

    // Step 1: Get all categories that match our criteria
    const allCategories = await prisma.category.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        type: true,
        parentId: true,
        isActive: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: "asc",
      },
    })

    // Step 2: If hierarchical is not requested, return flat list with additional info
    if (!hierarchical) {
      // Get count information
      const categoriesWithCount = await Promise.all(
        allCategories.map(async (category) => {
          const [productsCount, servicesCount, newsCount] = await Promise.all([
            prisma.product.count({ where: { categoryId: category.id } }),
            prisma.service.count({ where: { categoryId: category.id } }),
            prisma.news.count({ where: { categoryId: category.id } }),
          ])

          return {
            ...category,
            _count: {
              products: productsCount,
              services: servicesCount,
              news: newsCount,
            }
          }
        })
      )
      
      return NextResponse.json(categoriesWithCount)
    }

    // Step 3: Build hierarchical structure if requested
    // Define type for category tree
    type CategoryTree = {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      type: string;
      parentId: string | null;
      isActive: boolean;
      imageUrl: string | null;
      createdAt: Date;
      updatedAt: Date;
      subcategories: CategoryTree[];
    };

    // Helper function to build tree structure
    const buildCategoryTree = (parentId: string | null): CategoryTree[] => {
      return allCategories
        .filter(category => category.parentId === parentId)
        .map(category => ({
          ...category,
          subcategories: buildCategoryTree(category.id)
        }))
    }

    // Start with root categories
    const hierarchicalCategories = buildCategoryTree(null)
    return NextResponse.json(hierarchicalCategories)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Error fetching categories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate with zod schema
    const result = categorySchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = result.data

    // Create category with validated data
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        type: data.type,
        parentId: data.parentId === "null" ? null : data.parentId,
        imageUrl: data.imageUrl || null,
        isActive: data.isActive,
        // featured: data.featured ?? false,
      }
    })

    return NextResponse.json(category)

  } catch (error: any) { // Add type annotation
    // Check for Prisma error
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: "Slug đã tồn tại" },
        { status: 400 }
      )
    }
    
    // Log full error for debugging
    console.error("Error creating category:", error)
    
    return NextResponse.json(
      { error: "Lỗi khi tạo danh mục" },
      { status: 500 }
    )
  }
}

