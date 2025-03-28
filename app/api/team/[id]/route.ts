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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const teamMember = await prisma.teamMember.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!teamMember) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 })
    }

    return NextResponse.json(teamMember)
  } catch (error) {
    console.error("Error fetching team member:", error)
    return NextResponse.json({ error: "Error fetching team member" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const data = teamMemberSchema.parse(json)

    const teamMember = await prisma.teamMember.update({
      where: {
        id: params.id,
      },
      data,
    })

    return NextResponse.json(teamMember)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating team member:", error)
    return NextResponse.json({ error: "Error updating team member" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    await prisma.teamMember.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting team member:", error)
    return NextResponse.json({ error: "Error deleting team member" }, { status: 500 })
  }
}

