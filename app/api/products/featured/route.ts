import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        featured: true,
        isActive: true
      },
      include: {
        images: {
          select: {
            url: true,
            alt: true
          }
        },
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      take: 10,
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-'),
      price: product.price ? Number(product.price) : 0,
      salePrice: product.salePrice ? Number(product.salePrice) : undefined,
      images: product.images.map(img => img.url),
      category: product.category
    }))

    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error('Failed to fetch featured products:', error)
    return NextResponse.json([], { status: 500 })
  }
}