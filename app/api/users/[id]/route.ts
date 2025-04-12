import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"
import bcrypt from "bcryptjs"

// Schema for user update (password is optional)
const userUpdateSchema = z.object({
  name: z.string().min(1, "Tên người dùng là bắt buộc"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").optional(),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
})

// GET a single user
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            addresses: true,
            carts: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Error fetching user" }, { status: 500 })
  }
}

// UPDATE a user
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const json = await request.json()
    const data = userUpdateSchema.parse(json)

    // Check if email is unique (if changed)
    if (data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: {
          email: data.email,
        },
      })

      if (emailExists) {
        return NextResponse.json(
          { error: "Email đã được sử dụng" },
          { status: 400 }
        )
      }
    }

    // Check if username is unique (if changed)
    if (data.name !== existingUser.name) {
      const nameExists = await prisma.user.findUnique({
        where: {
          name: data.name,
        },
      })

      if (nameExists) {
        return NextResponse.json(
          { error: "Tên người dùng đã được sử dụng" },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      name: data.name,
      email: data.email,
      role: data.role,
    }

    // Hash password if provided
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10)
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: {
        id: params.id,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Error updating user" }, { status: 500 })
  }
}

// DELETE a user
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Prevent deleting the last admin
    if (existingUser.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: {
          role: "ADMIN",
        },
      })

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Không thể xóa admin cuối cùng" },
          { status: 400 }
        )
      }
    }

    // Delete the user
    await prisma.user.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Error deleting user" }, { status: 500 })
  }
}