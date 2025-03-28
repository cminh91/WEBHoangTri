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

// GET a single promotion
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const promotion = await prisma.promotion.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!promotion) {
      return NextResponse.json({ error: "Promotion not found" }, { status: 404 })
    }

    return NextResponse.json(promotion)
  } catch (error) {
    console.error("Error fetching promotion:", error)
    return NextResponse.json({ error: "Error fetching promotion" }, { status: 500 })
  }
}

// UPDATE a promotion
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const existingPromotion = await prisma.promotion.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingPromotion) {
      return NextResponse.json({ error: "Promotion not found" }, { status: 404 })
    }

    const json = await request.json()
    const data = promotionSchema.parse(json)

    // Check if code is unique (if changed)
    if (data.code && data.code !== existingPromotion.code) {
      const codeExists = await prisma.promotion.findUnique({
        where: {
          code: data.code,
        },
      })

      if (codeExists) {
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

    // Update the promotion
    const updatedPromotion = await prisma.promotion.update({
      where: {
        id: params.id,
      },
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
      },
    })

    return NextResponse.json(updatedPromotion)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating promotion:", error)
    return NextResponse.json({ error: "Error updating promotion" }, { status: 500 })
  }
}

// DELETE a promotion
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const existingPromotion = await prisma.promotion.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingPromotion) {
      return NextResponse.json({ error: "Promotion not found" }, { status: 404 })
    }

    // Delete the promotion
    await prisma.promotion.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting promotion:", error)
    return NextResponse.json({ error: "Error deleting promotion" }, { status: 500 })
  }
}