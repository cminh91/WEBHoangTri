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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get("location")
    const isActive = searchParams.get("isActive") !== "false" // Default to true
    
    const where: any = {}
    
    if (location) {
      where.location = location
    }
    
    if (isActive !== null) {
      where.isActive = isActive
    }
    
    const menus = await prisma.menu.findMany({
      where,
      orderBy: {
        updatedAt: "desc",
      },
    })
    
    return NextResponse.json(menus)
  } catch (error) {
    console.error("Error fetching menus:", error)
    return NextResponse.json({ error: "Error fetching menus" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  try {
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
    
    // Check if a menu with the same location already exists
    const existingMenu = await prisma.menu.findFirst({
      where: {
        location: data.location,
      },
    })
    
    if (existingMenu) {
      return NextResponse.json(
        { error: "A menu with this location already exists" },
        { status: 400 }
      )
    }
    
    // Create the menu
    const menu = await prisma.menu.create({
      data: {
        name: data.name,
        location: data.location,
        items: data.items,
        isActive: data.isActive,
      },
    })
    
    return NextResponse.json(menu)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    
    console.error("Error creating menu:", error)
    return NextResponse.json({ error: "Error creating menu" }, { status: 500 })
  }
}