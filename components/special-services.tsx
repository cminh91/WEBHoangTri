"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { getFeaturedServices } from "@/lib/queries"

interface Service {
  id: string
  title: string
  slug?: string
  description: string | null
  images: { url: string; alt: string | null }[]
  price: number | null
  category: {
    id: string
    name: string
    slug: string
  } | null
}

interface SpecialServicesProps {
  initialServices?: Service[]
}

export default function SpecialServices({ initialServices }: SpecialServicesProps) {
  const [services, setServices] = useState<Service[]>(initialServices || [])
  const [loading, setLoading] = useState(!initialServices)

  useEffect(() => {
    if (initialServices?.length) return

    const fetchServices = async () => {
      try {
        const data = await getFeaturedServices()
        setServices(data)
      } catch (error) {
        console.error('Error fetching services:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [initialServices])

  const getImageUrl = useCallback((images: { url: string }[] = []) => 
    images.length ? images[0].url : "/placeholder.svg", 
  [])

  const displayedServices = useMemo(() => services.slice(0, 4), [services])

  if (loading) {
    return (
      <section className="bg-black py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
                <div className="h-[300px] bg-gray-800 rounded"></div>
                <div className="flex flex-col justify-center">
                  <div className="h-6 bg-gray-800 w-3/4 mb-4 rounded"></div>
                  <div className="h-24 bg-gray-800 mb-4 rounded"></div>
                  <div className="h-6 bg-gray-800 w-1/3 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-black py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-6 text-4xl font-bold uppercase text-white">Dịch Vụ Nổi Bật</h2>
        <div className="mb-8">
          <Link href="/dich-vu" className="text-lg font-semibold text-red-500 underline">
            XEM TẤT CẢ CÁC DỊCH VỤ
          </Link>
        </div>

        <div className="space-y-10 text-white">
          {/* Danh sách dịch vụ */}
          {displayedServices.map((service, index) => (
            <Link href={`/dich-vu/${service.slug}`} key={service.id} className="block group">
              <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-12">
                <>
                  {/* Hình ảnh bên trái */}
                  <div className="relative w-full h-auto">
                    <Image
                      src={getImageUrl(service.images)}
                      alt={service.title}
                      width={600}
                      height={350}
                      className="w-full h-auto object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      priority={false}
                    />
                  </div>
                  {/* Nội dung bên phải */}
                  <div className="text-left">
                    <div className="border-l-4 border-red-500 pl-2 mb-4">
                      <h3 className="text-2xl font-bold">{service.title}</h3>
                    </div>
                    <p className="text-gray-400">{service.description}</p>
                    <span className="mt-4 block text-red-500 font-semibold underline transition-opacity duration-300 group-hover:opacity-75">
                      XEM THÊM
                    </span>
                  </div>
                </>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}