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

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const isDefault = searchParams.get("isDefault") === "true"
    
    const where: any = {
      userId: session.user.id,
    }

    if (isDefault) {
      where.isDefault = true
    }

    const addresses = await prisma.address.findMany({
      where,
      orderBy: [
        { isDefault: "desc" },
        { updatedAt: "desc" }
      ],
    })

    return NextResponse.json(addresses)
  } catch (error) {
    console.error("Error fetching addresses:", error)
    return NextResponse.json({ error: "Error fetching addresses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await request.json()
    const data = addressSchema.parse(json)

    // If this address is set as default, unset any existing default address
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      })
    }

    // Create the new address
    const address = await prisma.address.create({
      data: {
        ...data,
        userId: session.user.id,
      },
    })

    return NextResponse.json(address)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error creating address:", error)
    return NextResponse.json({ error: "Error creating address" }, { status: 500 })
  }
}