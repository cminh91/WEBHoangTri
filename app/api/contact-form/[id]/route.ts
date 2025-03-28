import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const contactForm = await prisma.contactForm.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!contactForm) {
      return NextResponse.json({ error: "Contact form not found" }, { status: 404 })
    }

    return NextResponse.json(contactForm)
  } catch (error) {
    console.error("Error fetching contact form:", error)
    return NextResponse.json({ error: "Error fetching contact form" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const { read } = json

    const contactForm = await prisma.contactForm.update({
      where: {
        id: params.id,
      },
      data: {
        read,
      },
    })

    return NextResponse.json(contactForm)
  } catch (error) {
    console.error("Error updating contact form:", error)
    return NextResponse.json({ error: "Error updating contact form" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await prisma.contactForm.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting contact form:", error)
    return NextResponse.json({ error: "Error deleting contact form" }, { status: 500 })
  }
}

