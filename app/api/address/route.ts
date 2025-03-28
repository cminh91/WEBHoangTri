import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

// Base address schema
const addressBaseSchema = {
  name: z.string().min(1, "Tên người nhận là bắt buộc"),
  phone: z.string().min(10, "Số điện thoại phải có ít nhất 10 số"),
  address: z.string().min(1, "Địa chỉ là bắt buộc"),
  city: z.string().min(1, "Thành phố là bắt buộc"),
  district: z.string().min(1, "Quận/huyện là bắt buộc"),
  ward: z.string().min(1, "Phường/xã là bắt buộc"),
  isDefault: z.boolean().default(false),
}

// Schema for POST (create)
const addressCreateSchema = z.object({
  ...addressBaseSchema
})

// Schema for PUT (update)
const addressUpdateSchema = z.object({
  id: z.string().min(1, "ID địa chỉ là bắt buộc"),
  ...addressBaseSchema
}).partial()

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const addresses = await prisma.address.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        isDefault: "desc"
      }
    })

    return NextResponse.json(addresses)
  } catch (error) {
    console.error("Error fetching addresses:", error)
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách địa chỉ" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const data = addressCreateSchema.parse(json)

    // Nếu đặt làm mặc định, hủy mặc định của các địa chỉ khác
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      })
    }

    const address = await prisma.address.create({
      data: {
        ...data,
        userId: session.user.id
      }
    })

    return NextResponse.json(address)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error creating address:", error)
    return NextResponse.json(
      { error: "Lỗi khi tạo địa chỉ mới" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const data = addressUpdateSchema.parse(json)
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json(
        { error: "Thiếu ID địa chỉ" },
        { status: 400 }
      )
    }

    // Kiểm tra user sở hữu địa chỉ
    const existingAddress = await prisma.address.findUnique({
      where: { id }
    })

    if (!existingAddress || existingAddress.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Nếu đặt làm mặc định, hủy mặc định của các địa chỉ khác
    if (updateData.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
          NOT: { id }
        },
        data: {
          isDefault: false
        }
      })
    }

    const updatedAddress = await prisma.address.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(updatedAddress)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating address:", error)
    return NextResponse.json(
      { error: "Lỗi khi cập nhật địa chỉ" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!id) {
    return NextResponse.json(
      { error: "Thiếu ID địa chỉ" },
      { status: 400 }
    )
  }

  try {
    // Kiểm tra user sở hữu địa chỉ
    const existingAddress = await prisma.address.findUnique({
      where: { id }
    })

    if (!existingAddress || existingAddress.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Không cho xóa địa chỉ mặc định
    if (existingAddress.isDefault) {
      return NextResponse.json(
        { error: "Không thể xóa địa chỉ mặc định" },
        { status: 400 }
      )
    }

    await prisma.address.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting address:", error)
    return NextResponse.json(
      { error: "Lỗi khi xóa địa chỉ" },
      { status: 500 }
    )
  }
}