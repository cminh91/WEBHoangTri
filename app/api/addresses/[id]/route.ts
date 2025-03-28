import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

// Schema for address validation
const addressSchema = z.object({
  name: z.string().min(1, "Tên người nhận là bắt buộc"),
  phone: z.string().min(1, "Số điện thoại là bắt buộc"),
  address: z.string().min(1, "Địa chỉ là bắt buộc"),
  city: z.string().min(1, "Thành phố là bắt buộc"),
  district: z.string().min(1, "Quận/Huyện là bắt buộc"),
  ward: z.string().min(1, "Phường/Xã là bắt buộc"),
  isDefault: z.boolean().default(false),
})

// GET a single address
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const address = await prisma.address.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    // Check if the address belongs to the current user
    if (address.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(address)
  } catch (error) {
    console.error("Error fetching address:", error)
    return NextResponse.json({ error: "Error fetching address" }, { status: 500 })
  }
}

// UPDATE an address
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if address exists and belongs to the user
    const existingAddress = await prisma.address.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    if (existingAddress.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await request.json()
    const data = addressSchema.parse(json)

    // If this address is set as default, unset any existing default address
    if (data.isDefault && !existingAddress.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: existingAddress.userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      })
    }

    // Update the address
    const updatedAddress = await prisma.address.update({
      where: {
        id: params.id,
      },
      data,
    })

    return NextResponse.json(updatedAddress)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error updating address:", error)
    return NextResponse.json({ error: "Error updating address" }, { status: 500 })
  }
}

// DELETE an address
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if address exists and belongs to the user
    const existingAddress = await prisma.address.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 })
    }

    if (existingAddress.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete the address
    await prisma.address.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting address:", error)
    return NextResponse.json({ error: "Error deleting address" }, { status: 500 })
  }
}