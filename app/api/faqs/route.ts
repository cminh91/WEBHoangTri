import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

// Schema for FAQ validation
const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  category: z.string().optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const isActive = searchParams.get("isActive") !== "false" // Default to true
  const limit = Number.parseInt(searchParams.get("limit") || "100")
  
  try {
    const where: any = {}
    
    if (category) {
      where.category = category
    }
    
    if (isActive !== null) {
      where.isActive = isActive
    }
    
    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" }
      ],
      take: limit,
    })
    
    return NextResponse.json(faqs)
  } catch (error) {
    console.error("Error fetching FAQs:", error)
    return NextResponse.json({ error: "Error fetching FAQs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  try {
    const json = await request.json()
    const data = faqSchema.parse(json)
    
    const faq = await prisma.fAQ.create({
      data: {
        question: data.question,
        answer: data.answer,
        category: data.category,
        order: data.order,
        isActive: data.isActive,
      },
    })
    
    return NextResponse.json(faq)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    
    console.error("Error creating FAQ:", error)
    return NextResponse.json({ error: "Error creating FAQ" }, { status: 500 })
  }
} 