import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import prisma from "@/lib/db"
import { getStoreInfo } from "@/lib/queries"
import { SearchBar } from "@/components/products/search-bar"
import { CategoryFilter } from "@/components/products/category-filter"
import { ProductCard } from "@/components/products/product-card"
import { ChevronRight } from "lucide-react"
import { SortSelect } from "@/components/products/sort-select"
import { NoProductsFound } from "@/components/products/no-products-found"

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
  
  const resolvedSearchParams = await searchParams
  const category = resolvedSearchParams.category
  const search = resolvedSearchParams.search
  const sort = resolvedSearchParams.sort

  if (category) {
    where.category = { slug: category }
  }

  if (search) {
    where.name = {
      contains: search,
    }
  }

  // Build orderBy
  let orderBy: any = { createdAt: 'desc' }
  if (sort === 'price-asc') {
    orderBy = { price: 'asc' }
  } else if (sort === 'price-desc') {
    orderBy = { price: 'desc' }
  }

  // Lấy giá trị sort hiện tại và chuyển thành string
  const currentSort = sort ? String(sort) : '';

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

  const storeInfo = await getStoreInfo()

  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Breadcrumb - Tối ưu cho mobile */}
        <div className="mb-6 flex items-center text-xs md:text-sm text-gray-400">
          <Link href="/" className="hover:text-red-600 transition-colors">
            Trang Chủ
          </Link>
          <ChevronRight className="mx-1 md:mx-2 h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
          <span className="text-white">Sản Phẩm</span>
        </div>

        {/* Header - Cải thiện spacing và responsive */}
        <div className="mb-8 md:mb-12">
          <h1 className="mb-2 text-center text-2xl md:text-4xl font-bold uppercase tracking-wider">
            Sản Phẩm
          </h1>
          <p className="text-center text-sm md:text-base text-gray-400">
            Các sản phẩm chính hãng của Hoàng Trí Moto
          </p>
        </div>

        {/* Filters - Cải thiện responsive và thêm shadow */}
        <div className="mb-8 p-4 bg-zinc-900/50 rounded-lg shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 md:max-w-md">
              <SearchBar />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <CategoryFilter categories={categories} />
              <SortSelect currentSort={currentSort} />
            </div>
          </div>
        </div>

        {/* Product Grid - Cải thiện spacing và animation */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => {
              const processedProduct = {
                ...product,
                price: Number(product.price),
                salePrice: product.salePrice ? Number(product.salePrice) : null
              } as Product
              return (
                <div key={product.id} className="transform transition-transform hover:scale-[1.02] duration-300">
                  <ProductCard product={processedProduct} storeLogoUrl={storeInfo?.logo ?? undefined} />
                </div>
              );
            })}
          </div>
        ) : (
          <NoProductsFound />
        )}
      </div>
    </div>
  )
}
