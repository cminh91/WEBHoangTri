import { NextResponse } from "next/server"
import prisma from "@/lib/prismadb"

// Lấy danh sách tất cả gói dịch vụ
export async function GET() {
  try {
    const packages = await prisma.servicePackage.findMany({
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(packages)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Lỗi khi lấy danh sách gói dịch vụ" }, { status: 500 })
  }
}

// Tạo mới gói dịch vụ
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, price, description, features } = body

    const newPackage = await prisma.servicePackage.create({
      data: {
        name,
        price,
        description,
        features
      }
    })

    return NextResponse.json(newPackage)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Lỗi khi tạo gói dịch vụ" }, { status: 500 })
  }
}

// Cập nhật gói dịch vụ
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, price, description, features } = body

    const updated = await prisma.servicePackage.update({
      where: { id },
      data: {
        name,
        price,
        description,
        features
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Lỗi khi cập nhật gói dịch vụ" }, { status: 500 })
  }
}

// Xóa gói dịch vụ
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Thiếu id" }, { status: 400 })
    }

    await prisma.servicePackage.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Lỗi khi xóa gói dịch vụ" }, { status: 500 })
  }
}