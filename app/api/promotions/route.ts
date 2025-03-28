import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

// Schema for promotion validation
const promotionSchema = z.object({
  title: z.string().min(1, "Tiêu đề là bắt buộc"),
  description: z.string().optional(),
  code: z.string().min(1, "Mã khuyến mãi là bắt buộc"),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.number().min(0, "Giá trị khuyến mãi phải là số dương"),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  isActive: z.boolean().default(true),
  image: z.string().optional(),
  usageLimit: z.number().optional(),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get("isActive") !== "false" // Default to true
    const code = searchParams.get("code")
    const current = searchParams.get("current") === "true"
    
    const where: any = {}
    
    if (isActive !== null) {
      where.isActive = isActive
    }
    
    if (code) {
      where.code = code
    }
    
    // If current=true, only return promotions that are currently active (between start and end dates)
    if (current) {
      const now = new Date()
      where.startDate = { lte: now }
      where.endDate = { gte: now }
    }
    
    const promotions = await prisma.promotion.findMany({
      where,
      orderBy: [
        { endDate: "asc" },
        { startDate: "asc" }
      ],
    })
    
    return NextResponse.json(promotions)
  } catch (error) {
    console.error("Error fetching promotions:", error)
    return NextResponse.json({ error: "Error fetching promotions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  try {
    const json = await request.json()
    const data = promotionSchema.parse(json)
    
    // Check if code is unique
    if (data.code) {
      const existingPromotion = await prisma.promotion.findUnique({
        where: {
          code: data.code,
        },
      })
      
      if (existingPromotion) {
        return NextResponse.json(
          { error: "Mã khuyến mãi đã tồn tại" },
          { status: 400 }
        )
      }
    }
    
    // Ensure startDate is before endDate
    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)
    
    if (startDate > endDate) {
      return NextResponse.json(
        { error: "Ngày bắt đầu phải trước ngày kết thúc" },
        { status: 400 }
      )
    }
    
    // Create the promotion
    const promotion = await prisma.promotion.create({
      data: {
        title: data.title,
        description: data.description,
        code: data.code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        startDate,
        endDate,
        isActive: data.isActive,
        image: data.image,
        usageLimit: data.usageLimit,
        usageCount: 0, // Initialize usage count to 0
      },
    })
    
    return NextResponse.json(promotion)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    
    console.error("Error creating promotion:", error)
    return NextResponse.json({ error: "Error creating promotion" }, { status: 500 })
  }
}