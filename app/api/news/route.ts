import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

// Schema for news validation
const newsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  author: z.string().optional(),
  publishDate: z.string().optional(),
  featured: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
  tags: z.string().optional(),
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
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 10
    
    const news = await prisma.news.findMany({
      where: {
        isActive: true
      },
      include: {
        images: true,
        category: true
      },
      take: limit,
      orderBy: {
        publishDate: 'desc'
      }
    })
    
    // Chuyển đổi dữ liệu để phù hợp với client
    const newsForClient = news.map(item => ({
      ...item,
      images: item.images.map(img => img.url),
      categoryName: item.category?.name || null
    }))
    
    return NextResponse.json(newsForClient)
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const data = newsSchema.parse(json)

    // Check if slug is unique
    const existingNews = await prisma.news.findUnique({
      where: {
        slug: data.slug,
      },
    })

    if (existingNews) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    // Extract images from data
    const { images, publishDate, ...newsData } = data

    // Create news with nested images
    const news = await prisma.news.create({
      data: {
        ...newsData,
        publishDate: publishDate ? new Date(publishDate) : new Date(),
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

    return NextResponse.json(news)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error creating news:", error)
    return NextResponse.json({ error: "Error creating news" }, { status: 500 })
  }
}

