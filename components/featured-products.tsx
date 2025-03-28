"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"

interface Product {
  id: string
  name: string
  slug: string
  price: number | any
  salePrice?: number | null | any
  images?: string[]
  categoryId?: string | null
  description: string | null
  isActive: boolean
  featured?: boolean
  rating?: number
  ratingCount?: number
}

interface FeaturedProductsProps {
  initialProducts?: Product[]
}

export default function FeaturedProducts({ initialProducts }: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(!initialProducts)

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      const enhancedProducts = initialProducts.map(product => ({
        ...product,
        rating: product.rating || 5,
        ratingCount: product.ratingCount || 0
      }))
      setProducts(enhancedProducts)
      setLoading(false)
      return
    }

    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products/featured', {
          next: { revalidate: 3600 }
        })
        if (!response.ok) {
          throw new Error('Failed to fetch featured products')
        }
        const data = await response.json()
        const enhancedProducts = data.map((product: Product) => ({
          ...product,
          rating: product.rating || 5,
          ratingCount: product.ratingCount || 0
        }))
        setProducts(enhancedProducts)
      } catch (error) {
        console.error('Error fetching featured products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
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

  const renderRating = useCallback((rating: number = 5) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      )
    }
    return stars
  }, [])

  // Sử dụng useMemo để tránh re-render không cần thiết
  const displayedProducts = useMemo(() => {
    return products.slice(0, 6)
  }, [products])

  if (loading) {
    return (
      <section className="bg-zinc-900 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-zinc-800 animate-pulse h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-zinc-900 py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-3xl font-bold md:text-4xl uppercase">SẢN PHẨM NỔI BẬT</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {displayedProducts.map((product) => (
            <Link 
              href={`/san-pham/${product.slug}`}
              key={product.id}
              className="overflow-hidden rounded-lg bg-zinc-800"
            >
              <div className="relative h-48 w-full">
                <Image 
                  src={getValidImageUrl(product.images)}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                  loading="lazy"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="mb-2 text-lg font-semibold text-white">{product.name}</h3>
                <div className="mb-4 flex items-center">
                  {product.salePrice ? (
                    <>
                      <span className="mr-2 text-lg font-bold text-red-500">{formatPrice(product.salePrice)}</span>
                      <span className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-red-500">{formatPrice(product.price)}</span>
                  )}
                </div>
                <div className="flex items-center mb-4">
                  {renderRating(product.rating)}
                  <span className="text-xs text-gray-400 ml-1">({product.ratingCount || 0})</span>
                </div>
                <button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded">
                  MUA NGAY
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}