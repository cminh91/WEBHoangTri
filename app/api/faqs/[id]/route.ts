import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

const faqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  category: z.string().optional(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const faq = await prisma.fAQ.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!faq) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 })
    }

    return NextResponse.json(faq)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching FAQ" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params
    const data = await request.json()
    const validatedData = faqSchema.parse(data)

    const updatedFaq = await prisma.fAQ.update({
      where: { id },
      data: {
        question: validatedData.question,
        answer: validatedData.answer,
        category: validatedData.category,
        order: validatedData.order,
        isActive: validatedData.isActive,
      },
    })

    return NextResponse.json(updatedFaq)
  } catch (error) {
    console.error("Error updating FAQ:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error updating FAQ" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await prisma.fAQ.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Error deleting FAQ" }, { status: 500 })
  }
} 