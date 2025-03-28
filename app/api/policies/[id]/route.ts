import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

// Schema for policy validation
const policySchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().optional(),
  content: z.string().min(1, "Content is required"),
  isPublished: z.boolean().default(true),
})

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const policy = await prisma.policy.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 })
    }

    return NextResponse.json(policy)
  } catch (error) {
    console.error("Error fetching policy:", error)
    return NextResponse.json({ error: "Error fetching policy" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const data = policySchema.parse(json)

    // Check if slug is unique (excluding current policy)
    const existingPolicy = await prisma.policy.findFirst({
      where: {
        slug: data.slug,
        id: {
          not: params.id,
        },
      },
    })

    if (existingPolicy) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }

    const policy = await prisma.policy.update({
      where: {
        id: params.id,
      },
      data,
    })

    return NextResponse.json(policy)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating policy:", error)
    return NextResponse.json({ error: "Error updating policy" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await prisma.policy.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting policy:", error)
    return NextResponse.json({ error: "Error deleting policy" }, { status: 500 })
  }
}

