import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

// Schema for menu validation
const menuSchema = z.object({
  name: z.string().min(1, "Tên menu là bắt buộc"),
  location: z.string().min(1, "Vị trí menu là bắt buộc"),
  items: z.string().min(1, "Các mục menu là bắt buộc"),
  isActive: z.boolean().default(true),
})

// GET a single menu
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const menu = await prisma.menu.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 })
    }

    return NextResponse.json(menu)
  } catch (error) {
    console.error("Error fetching menu:", error)
    return NextResponse.json({ error: "Error fetching menu" }, { status: 500 })
  }
}

// UPDATE a menu
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const existingMenu = await prisma.menu.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingMenu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 })
    }

    const json = await request.json()
    
    // Parse items as JSON if it's a string
    let parsedData = { ...json }
    if (typeof json.items === 'string') {
      try {
        parsedData.items = JSON.parse(json.items)
      } catch (e) {
        return NextResponse.json({ error: "Invalid JSON in items field" }, { status: 400 })
      }
    }
    
    const data = menuSchema.parse(parsedData)

    // Check if the updated location conflicts with another menu
    if (data.location !== existingMenu.location) {
      const locationExists = await prisma.menu.findFirst({
        where: {
          location: data.location,
          id: { not: params.id },
        },
      })

      if (locationExists) {
        return NextResponse.json(
          { error: "A menu with this location already exists" },
          { status: 400 }
        )
      }
    }

    // Update the menu
    const updatedMenu = await prisma.menu.update({
      where: {
        id: params.id,
      },
      data: {
        name: data.name,
        location: data.location,
        items: data.items,
        isActive: data.isActive,
      },
    })

    return NextResponse.json(updatedMenu)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating menu:", error)
    return NextResponse.json({ error: "Error updating menu" }, { status: 500 })
  }
}

// DELETE a menu
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const existingMenu = await prisma.menu.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingMenu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 })
    }

    // Delete the menu
    await prisma.menu.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting menu:", error)
    return NextResponse.json({ error: "Error deleting menu" }, { status: 500 })
  }
}