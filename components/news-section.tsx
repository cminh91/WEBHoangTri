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
    <section className="bg-black py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center">
          <div className="mr-4 bg-red-600 px-4 py-2 text-lg font-bold uppercase">Tin tức</div>
          <div className="h-[1px] flex-grow bg-gray-700"></div>
        </div>

        <h2 className="mb-4 text-center text-2xl font-bold uppercase">Tin tức & Thủ thuật</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((item) => (
            <Link key={item.id} href={`/tin-tuc/${item.slug}`}>
              <div className="group relative h-[250px] overflow-hidden">
                <Image
                  src={getImageUrl(item.images)}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex flex-col">
                  <h3 className="mb-2 text-white font-bold line-clamp-2">{item.title}</h3>
                  <div className="flex items-center text-sm text-gray-300 mb-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(item.publishDate)}
                  </div>
                  <button className="self-start bg-white px-6 py-2 text-sm font-bold text-black hover:bg-red-600 hover:text-white">
                    XEM CHI TIẾT
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {featuredProducts.length > 0 && (
          <div className="mt-12 text-center relative">
            <div className="relative h-64 overflow-hidden">
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
            
            <h3 className="mt-4 text-xl font-bold uppercase">
              {featuredProducts[currentProductIndex]?.name}
            </h3>
            
            <div className="flex justify-center items-center mt-4 gap-4">
              <button 
                onClick={() => setCurrentProductIndex(prev => 
                  prev === 0 ? featuredProducts.length - 1 : prev - 1
                )}
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <Link 
                href={`/san-pham/${featuredProducts[currentProductIndex]?.slug}`}
                className="border-2 border-red-600 bg-transparent px-6 py-2 text-sm font-bold text-white hover:bg-red-600"
              >
                XEM CHI TIẾT
              </Link>
              
              <button 
                onClick={() => setCurrentProductIndex(prev => 
                  prev === featuredProducts.length - 1 ? 0 : prev + 1
                )}
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}