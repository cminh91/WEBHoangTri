import { Button } from "@/components/ui/button"
import ProductClient from "./ProductClient"
import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import ImageSlider from "./_components/image-slider"
import RelatedProducts from "./_components/related-products"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface ProductPageProps {
  params: {
    param: string
  }
}

interface Product {
  id: string
  name: string
  slug: string
  description?: string | null
  longDescription?: string | null
  price: number
  salePrice?: number | null
  inStock: boolean
  featured: boolean
  specs?: any
  category?: {
    id: string
    name: string
  } | null
  images: {
    url: string
    alt?: string | null
  }[]
}

export const dynamicParams = true // Allow fallback for non-generated routes

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    select: { slug: true },
    where: { isActive: true } // Only generate for active products
  })
  // Explicitly type the product parameter
  return products.map((product: { slug: string }) => ({
    param: product.slug,
  }))
}


export default async function ProductPageWrapper({ params }: { params: any }) {
  const resolvedParams = await params
  const decodedSlug = decodeURIComponent(resolvedParams.param)

  const product = await prisma.product.findFirst({
    where: {
      slug: decodedSlug,
      isActive: true
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      longDescription: true,
      price: true,
      salePrice: true,
      inStock: true,
      featured: true,
      specs: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      images: {
        select: {
          url: true,
          alt: true
        }
      }
    }
  })

  if (!product) {
    return <div className="text-white p-8">Không tìm thấy sản phẩm</div>
  }

  const processedProduct = {
    ...product,
    price: Number(product.price),
    salePrice: product.salePrice ? Number(product.salePrice) : null
  }

  return <ProductClient product={processedProduct} />
}
