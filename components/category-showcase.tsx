"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Wrench, ShoppingBag, Cog, Hammer, Settings, ChevronRight } from "lucide-react"
import Image from "next/image"

interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  description?: string
  imageUrl?: string
}

export default function CategoryShowcase() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories?featured=true")
        if (!response.ok) {
          throw new Error("Không thể tải danh mục")
        }
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error)
        setCategories(fallbackCategories)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Danh sách icon tương ứng với tên danh mục
  const getCategoryIcon = (name: string) => {
    const nameLower = name.toLowerCase()
    if (nameLower.includes("phụ tùng") || nameLower.includes("phu tung")) {
      return <ShoppingBag className="h-10 w-10 text-red-600" />
    } else if (nameLower.includes("độ xe") || nameLower.includes("do xe")) {
      return <Cog className="h-10 w-10 text-red-600" />
    } else if (nameLower.includes("dịch vụ") || nameLower.includes("dich vu")) {
      return <Wrench className="h-10 w-10 text-red-600" />
    } else if (nameLower.includes("công cụ") || nameLower.includes("cong cu")) {
      return <Hammer className="h-10 w-10 text-red-600" />
    } else {
      return <Settings className="h-10 w-10 text-red-600" />
    }
  }

  // Danh mục mặc định trong trường hợp API không có dữ liệu
  const fallbackCategories: Category[] = [
    {
      id: "1",
      name: "Phụ Tùng Xe Máy",
      slug: "phu-tung-xe-may",
      description: "Phụ tùng chính hãng cho các loại xe máy phân khối lớn",
      imageUrl: "/placeholder.svg?height=300&width=300",
    },
    {
      id: "2",
      name: "Dịch Vụ Sửa Chữa",
      slug: "dich-vu-sua-chua",
      description: "Sửa chữa, bảo dưỡng xe máy chuyên nghiệp",
      imageUrl: "/placeholder.svg?height=300&width=300",
    },
    {
      id: "3",
      name: "Độ Xe Máy",
      slug: "do-xe-may",
      description: "Dịch vụ độ xe theo yêu cầu, phong cách cá nhân",
      imageUrl: "/placeholder.svg?height=300&width=300",
    },
    {
      id: "4",
      name: "Công Cụ Sửa Chữa",
      slug: "cong-cu-sua-chua",
      description: "Công cụ chuyên dụng cho việc sửa chữa xe máy",
      imageUrl: "/placeholder.svg?height=300&width=300",
    },
  ]

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold">Đang tải danh mục...</h2>
          </div>
        </div>
      </section>
    )
  }

  const displayCategories = categories.length > 0 ? categories : fallbackCategories

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Danh Mục Sản Phẩm & Dịch Vụ</h2>
          <Link
            href="/san-pham"
            className="flex items-center text-red-600 hover:underline"
          >
            Xem tất cả
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {displayCategories.map((category) => (
            <Link
              key={category.id}
              href={`/san-pham/${category.slug}`}
              className="group block overflow-hidden rounded-lg bg-zinc-900 transition-all hover:bg-zinc-800"
            >
              <div className="flex items-center space-x-4 p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 group-hover:bg-zinc-700">
                  {getCategoryIcon(category.name)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{category.name}</h3>
                  {category.description && (
                    <p className="mt-1 text-sm text-gray-400">{category.description}</p>
                  )}
                </div>
              </div>
              {category.imageUrl && (
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
} 