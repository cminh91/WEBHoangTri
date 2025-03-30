import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import prisma from "@/lib/db"
import { SearchBar } from "@/components/products/search-bar"
import { CategoryFilter } from "@/components/products/category-filter"
import { ProductCard } from "@/components/products/product-card"
import { ChevronRight } from "lucide-react"
interface Product {
  id: string
  name: string
  slug: string
  price: number
  salePrice: number | null
  featured: boolean
  inStock: boolean
  images: Array<{ url: string }>
  category?: {
    name: string
    slug: string
  } | null
}

interface PageProps {
  searchParams: {
    category?: string
    search?: string
    sort?: string
    page?: string
  }
}

export default async function ProductsPage({
  searchParams
}: PageProps) {
  // Build where clause
  const where: any = { isActive: true }
  
  if (searchParams.category) {
    where.category = { slug: searchParams.category }
  }

  if (searchParams.search) {
    where.name = {
      contains: searchParams.search,
    }
  }

  // Build orderBy
  let orderBy: any = { createdAt: 'desc' }
  if (searchParams.sort === 'price-asc') {
    orderBy = { price: 'asc' }
  } else if (searchParams.sort === 'price-desc') {
    orderBy = { price: 'desc' }
  }

  // Get categories for filter
  const categories = await prisma.category.findMany({
    where: { type: 'PRODUCT', isActive: true },
    select: { name: true, slug: true }
  })

  // Get products
  const products = await prisma.product.findMany({
    where,
    include: {
      images: true,
      category: { select: { name: true, slug: true } }
    },
    orderBy,
    take: 20
  })

  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16">
      <div className="mb-8 flex items-center text-sm text-gray-400">
          <Link href="/" className="hover:text-red-600">
            Trang Chủ
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="text-white">Sản Phẩm</span>
        </div>
      <h1 className="mb-2 text-center text-4xl font-bold uppercase">Sản Phẩm</h1>
      <p className="mb-12 text-center text-gray-400">Các sản phẩm của Hoàng Trí Moto</p>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row">
          <SearchBar />
          <CategoryFilter categories={categories} />
          <select
            className="rounded-md bg-zinc-800 px-4 py-2 text-white"
            defaultValue=""
          >
            <option value="">Sắp xếp</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
          </select>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => {
            const processedProduct = {
              ...product,
              price: Number(product.price),
              salePrice: product.salePrice ? Number(product.salePrice) : null
            }
            return <ProductCard key={product.id} product={processedProduct} />
          })}
        </div>
      </div>
    </div>
  )
}
