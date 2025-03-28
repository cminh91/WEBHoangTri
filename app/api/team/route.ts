import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

// Schema for team member validation
const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  position: z.string().min(1, "Position is required"),
  bio: z.string().optional(),
  image: z.string().optional(),
  socialLinks: z.record(z.string()).optional(),
  order: z.number().default(0),
})

export async function GET() {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      orderBy: {
        order: "asc",
      },
    })

    return NextResponse.json(teamMembers)
  } catch (error) {
    console.error("Error fetching team members:", error)
    return NextResponse.json({ error: "Error fetching team members" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const data = teamMemberSchema.parse(json)

    const teamMember = await prisma.teamMember.create({
      data,
    })

    return NextResponse.json(teamMember)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error creating team member:", error)
    return NextResponse.json({ error: "Error creating team member" }, { status: 500 })
  }
}

