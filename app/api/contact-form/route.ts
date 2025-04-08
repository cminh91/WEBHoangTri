import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

// Schema for contact form validation
const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(1, "Message is required"),
})

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const readParam = searchParams.get("read")

    const where: any = {}

    if (readParam !== null) {
      where.read = readParam === "true"
    }

    const contactForms = await prisma.contactForm.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(contactForms)
  } catch (error) {
    console.error("Error fetching contact forms:", error)
    return NextResponse.json({ error: "Error fetching contact forms" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const data = contactFormSchema.parse(json)

    const contactForm = await prisma.contactForm.create({
      data,
    })

    return NextResponse.json(contactForm)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error creating contact form:", error)
    return NextResponse.json({ error: "Error creating contact form" }, { status: 500 })
  }
}

