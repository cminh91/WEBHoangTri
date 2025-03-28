import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 10
    
    const services = await prisma.service.findMany({
      where: {
        featured: true,
        isActive: true
      },
      include: {
        images: true
      },
      take: limit,
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Chuyển đổi kiểu dữ liệu để đảm bảo tương thích với client
    const servicesForClient = services.map(service => ({
      ...service,
      price: service.price ? Number(service.price) : null,
      images: service.images.map(img => ({ url: img.url, alt: img.alt }))
    }))
    
    return NextResponse.json(servicesForClient)
  } catch (error) {
    console.error('Error fetching featured services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured services' },
      { status: 500 }
    )
  }
} 