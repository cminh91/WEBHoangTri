"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useCart } from "@/components/cart/cart-provider"
import Image from "next/image"
import Link from "next/link"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"

interface Product {
  id: string
  name: string
  slug: string
  price: number | any
  salePrice?: number | null | any
  images?: string[]
  categoryId?: string | null
  category?: {
    id: string
    name: string
    slug: string
  } | null
  description: string | null
  isActive: boolean
  featured?: boolean
  rating?: number
  ratingCount?: number
}

interface Category {
  id: string
  name: string
  slug: string
}

interface FeaturedProductsProps {
  initialProducts?: Product[]
  categories?: Category[]
}

export default function FeaturedProducts({ initialProducts, categories = [] }: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(!initialProducts)
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(0)
  const productsPerPage = 4

  const { addItem } = useCart()

  const handleAddToCart = (product: Product) => {
    const image = product.images && product.images.length > 0 ? product.images[0] : "/product-placeholder.jpg"
    addItem({
      id: product.id,
      name: product.name,
      price: product.salePrice && product.salePrice < product.price ? product.salePrice : product.price,
      image: image
    })
  }

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      const enhancedProducts = initialProducts.map(product => ({
        ...product,
        rating: product.rating || 5,
        ratingCount: product.ratingCount || 0
      }))
      setProducts(enhancedProducts)
      setLoading(false)
    } else {
      // Nếu không có initialProducts, hiển thị trạng thái trống
      setProducts([])
      setLoading(false)
    }
  }, [initialProducts])

  const getValidImageUrl = useCallback((images?: string[]) => {
    if (!images || images.length === 0) return "/product-placeholder.jpg"
    const validImages = images.filter(img => img && img.trim() !== '')
    return validImages.length > 0 ? validImages[0] : "/product-placeholder.jpg"
  }, [])

  const formatPrice = useCallback((price: any) => {
    if (!price) return "Liên hệ"
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(Number(price))
  }, [])

  // Filter products by category
  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return products
    return products.filter(product =>
      product.category?.slug === activeCategory ||
      product.categoryId === activeCategory
    )
  }, [products, activeCategory])

  // Get paginated products
  const paginatedProducts = useMemo(() => {
    const start = currentPage * productsPerPage
    return filteredProducts.slice(start, start + productsPerPage)
  }, [filteredProducts, currentPage, productsPerPage])

  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  // Tạo danh sách danh mục từ database và thêm danh mục "Tất cả"
  const allCategories = useMemo(() => {
    // Thêm danh mục "Tất cả" vào đầu danh sách
    return [
      { id: "all", name: "Tất cả sản phẩm", slug: "all" },
      ...categories
    ];
  }, [categories]);

  // Handle category change
  const handleCategoryChange = (categorySlug: string) => {
    setActiveCategory(categorySlug)
    setCurrentPage(0) // Reset to first page when changing category
  }

  // Navigation handlers
  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1))
  }

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))
  }

  if (loading) {
    return (
      <section className="bg-black py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-zinc-900 animate-pulse h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-black py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center mb-6 sm:mb-8">SẢN PHẨM NỔI BẬT</h2>
        
        <div className="mb-8 overflow-x-auto">
          <div className="flex min-w-max">
            {allCategories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className={`px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${
                  activeCategory === category.slug ? 'bg-red-600 text-white' : 'bg-zinc-800 text-white hover:bg-red-600'
                } ${index === 0 ? 'rounded-l-md' : ''} ${
                  index === allCategories.length - 1 ? 'rounded-r-md' : ''
                }`}
              >
                {category.name}
              </button>
            ))}
            <Link href="/san-pham" className="px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium bg-zinc-800 text-white hover:bg-red-600 transition-colors rounded-r-md">
              Xem tất cả
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product) => (
              <div key={product.id} className="group relative overflow-hidden bg-zinc-900 rounded-lg">
                <Link href={`/san-pham/${product.slug}`}>
                  <div className="relative h-40 sm:h-48 w-full overflow-hidden">
                    <Image
                      src={getValidImageUrl(product.images)}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {product.salePrice && product.salePrice < product.price && (
                      <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-2 py-1">
                        GIẢM GIÁ
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link
                    href={`/san-pham/${product.slug}`}
                    className="block text-center font-medium text-white hover:text-red-500 transition-colors line-clamp-2 h-12"
                  >
                    {product.name}
                  </Link>
                  <div className="mt-2 text-center">
                    {product.salePrice && product.salePrice < product.price ? (
                      <>
                        <span className="text-lg font-bold text-red-500 mr-2">{formatPrice(product.salePrice)}</span>
                        <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-red-500">{formatPrice(product.price)}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="absolute bottom-0 left-0 right-0 bg-red-600 text-white text-center py-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
                >
                  MUA NGAY
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center py-8 text-gray-400">
              Không tìm thấy sản phẩm nào trong danh mục này
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              className="p-2 rounded-full bg-zinc-800 text-white disabled:opacity-50 hover:bg-red-600 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goToNextPage}
              disabled={currentPage >= totalPages - 1}
              className="p-2 rounded-full bg-zinc-800 text-white disabled:opacity-50 hover:bg-red-600 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}