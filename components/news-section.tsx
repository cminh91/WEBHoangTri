"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"

interface NewsItem {
  id: string
  title: string
  slug: string
  content: string | null
  excerpt: string | null
  publishDate: Date
  author: string | null
  categoryId: string | null
  categoryName?: string | null
  images: string[]
  isActive: boolean
  published?: boolean
}

interface Product {
  id: string
  name: string
  slug: string
  price: number
  salePrice?: number
  images: string[]
}

interface NewsSectionProps {
  initialNews?: NewsItem[]
}

export default function NewsSection({ initialNews }: NewsSectionProps) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(!initialNews)
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [currentProductIndex, setCurrentProductIndex] = useState(0)

  useEffect(() => {
    if (initialNews && initialNews.length > 0) {
      const processedNews = initialNews.map(item => ({
        ...item,
        published: true
      }))
      setNews(processedNews)
      setLoading(false)
    } else {
      const fetchNews = async () => {
        try {
          const response = await fetch('/api/news?limit=3')
          if (!response.ok) throw new Error('Failed to fetch news')
          const data = await response.json()
          setNews(data.map((item: any) => ({ ...item, published: true })))
        } catch (error) {
          console.error('Error fetching news:', error)
          setNews([])
        } finally {
          setLoading(false)
        }
      }
      fetchNews()
    }

    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products/featured')
        if (!response.ok) throw new Error('Failed to fetch featured products')
        const data = await response.json()
        setFeaturedProducts(data.slice(0, 3))
      } catch (error) {
        console.error('Error fetching featured products:', error)
      }
    }
    fetchProducts()
  }, [initialNews])

  useEffect(() => {
    if (featuredProducts.length > 1) {
      const interval = setInterval(() => {
        setCurrentProductIndex(prev => 
          prev === featuredProducts.length - 1 ? 0 : prev + 1
        )
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [featuredProducts])

  const formatDate = (date: Date) => {
    if (!date) return ""
    const d = new Date(date)
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getImageUrl = (images: string[]) => {
    if (!images || images.length === 0) return "/placeholder.svg"
    return images[0]
  }

  if (loading) {
    return (
      <section className="bg-black py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-[250px] bg-gray-800 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-black py-10 sm:py-16">
      <div className="container mx-auto px-3 sm:px-4 relative">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center">
          <div className="mb-3 sm:mb-0 mr-0 sm:mr-4 bg-red-600 px-3 py-1.5 sm:px-4 sm:py-2 text-base sm:text-lg font-bold uppercase text-white">Tin tức</div>
          <div className="h-[1px] sm:flex-grow bg-gray-700"></div>
        </div>

        {/* Main container with relative positioning for overlay */}
        <div className="relative">
          {/* News grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
            {news.map((item) => (
              <Link key={item.id} href={`/tin-tuc?category=/${item.slug}`}>
                <div className="group relative h-[220px] sm:h-[250px] overflow-hidden rounded-lg">
                  <Image
                    src={getImageUrl(item.images)}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3 flex flex-col">
                    <h3 className="mb-1.5 sm:mb-2 text-white font-bold line-clamp-2 text-sm sm:text-base">{item.title}</h3>
                    <div className="flex items-center text-xs sm:text-sm text-gray-300 mb-1.5 sm:mb-2">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {formatDate(item.publishDate)}
                    </div>
                    <button className="self-start bg-red-600 px-4 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm font-bold text-white hover:bg-red-700">
                      XEM CHI TIẾT
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Featured product overlay */}
          {featuredProducts.length > 0 && (
            <div className="absolute inset-x-0 bottom-20 sm:top-1/2 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 z-10 mt-10 sm:mt-10 flex justify-center">
              <div className="p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-xs sm:max-w-md text-center">
                <div className="relative h-40 w-40 sm:h-48 sm:w-48 mx-auto mb-3 sm:mb-4">
                  {featuredProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className={`absolute inset-0 transition-opacity duration-500 ${index === currentProductIndex ? 'opacity-100' : 'opacity-0'}`}
                    >
                      <Image
                        src={getImageUrl(product.images)}
                        alt={product.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ))}
                </div>
                
                <h3 className="mt-1.5 sm:mt-2 text-lg sm:text-xl font-bold uppercase text-white">
                  {featuredProducts[currentProductIndex]?.name}
                </h3>
                
                <div className="flex justify-center items-center mt-3 sm:mt-4 gap-3 sm:gap-4">
                  <button
                    onClick={() => setCurrentProductIndex(prev =>
                      prev === 0 ? featuredProducts.length - 1 : prev - 1
                    )}
                    className="p-1.5 sm:p-2 rounded-full bg-gray-800 hover:bg-red-600 text-white"
                  >
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                   
                  <Link
                    href={`/san-pham/${featuredProducts[currentProductIndex]?.slug}`}
                    className="border-2 border-red-600 bg-transparent px-4 py-1.5 sm:px-6 sm:py-2 text-xs sm:text-sm font-bold text-white hover:bg-red-600"
                  >
                    XEM CHI TIẾT
                  </Link>
                   
                  <button
                    onClick={() => setCurrentProductIndex(prev =>
                      prev === featuredProducts.length - 1 ? 0 : prev + 1
                    )}
                    className="p-1.5 sm:p-2 rounded-full bg-gray-800 hover:bg-red-600 text-white"
                  >
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation buttons for news */}
          <div className="absolute bottom-4 left-4 sm:top-1/2 sm:bottom-auto transform sm:-translate-y-1/2">
            <button
              className="p-1.5 sm:p-2 rounded-full bg-black/50 text-white hover:bg-red-600"
              onClick={() => {
                // Add navigation logic here if needed
              }}
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
          <div className="absolute bottom-4 right-4 sm:top-1/2 sm:bottom-auto transform sm:-translate-y-1/2">
            <button
              className="p-1.5 sm:p-2 rounded-full bg-black/50 text-white hover:bg-red-600"
              onClick={() => {
                // Add navigation logic here if needed
              }}
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}