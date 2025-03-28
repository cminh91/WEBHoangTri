// app/api/news/[id]/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

const newsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  author: z.string().optional(),
  publishDate: z.string().optional(),
  categoryId: z.string().nullable(),
  tags: z.string().optional(),
  featured: z.boolean().default(false),
  images: z.array(z.object({ url: z.string(), alt: z.string().optional() })).optional(),
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const news = await prisma.news.findUnique({
      where: { id: params.id },
      include: { images: true, category: true },
    })
    if (!news) return NextResponse.json({ error: "News not found" }, { status: 404 })
    return NextResponse.json(news)
  } catch (error) {
    console.error("Error fetching news:", error)
    return NextResponse.json({ error: "Error fetching news" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const data = newsSchema.parse(json)
    const { images, ...newsData } = data

    const updatedNews = await prisma.news.update({
      where: { id: params.id },
      data: {
        ...newsData,
        publishDate: newsData.publishDate ? new Date(newsData.publishDate) : undefined,
        images: images ? {
          deleteMany: {},
          create: images.map(img => ({ url: img.url, alt: img.alt })),
        } : undefined,
      },
      include: { images: true, category: true },
    })

    return NextResponse.json(updatedNews)
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 })
    console.error("Error updating news:", error)
    return NextResponse.json({ error: "Error updating news" }, { status: 500 })
  }
}