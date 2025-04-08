import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

// Schema for contact validation
const contactSchema = z.object({
  addresses: z.array(z.string().min(1, "Address is required")).min(1, "At least one address required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address"),
  workingHours: z.record(z.string()).optional(),
  mapUrl: z.string().optional(),
  socialLinks: z.record(z.string()).optional(),
})

export async function GET() {
  try {
    // Get the first contact record (there should only be one)
    const contact = await prisma.contact.findFirst()

    return NextResponse.json(contact || {})
  } catch (error) {
    console.error("Error fetching contact:", error)
    return NextResponse.json({ error: "Error fetching contact" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  console.log("API Contact Session:", session)

  if (!session) {
    console.log("No session found")
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  if (session.user.role !== "ADMIN") {
    console.log("User is not ADMIN. Role:", session.user.role)
    return NextResponse.json({ error: "Requires ADMIN role" }, { status: 403 })
  }

  try {
    const json = await request.json()
    const data = contactSchema.parse(json)

    // Check if contact record already exists
    const existingContact = await prisma.contact.findFirst()

    let contact

    if (existingContact) {
      // Update existing contact record
      contact = await prisma.contact.update({
        where: {
          id: existingContact.id,
        },
        data,
      })
    } else {
      // Create new contact record
      contact = await prisma.contact.create({
        data,
      })
    }

    return NextResponse.json(contact)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating contact:", error)
    return NextResponse.json({ error: "Error updating contact" }, { status: 500 })
  }
}

