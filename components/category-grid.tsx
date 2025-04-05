"use client"

import Image from "next/image"
import Link from "next/link"
import React, { useMemo } from "react"

interface Category {
  id: string
  name: string
  slug: string
  imageUrl?: string | null
}

interface CategoryGridProps {
  categories: Category[]
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  // Chỉ lấy 8 danh mục đầu tiên
  const displayedCategories = useMemo(() => categories.slice(0, 8), [categories])

  return (
    <div className="bg-[#121212] px-6 md:px-20 py-8">
      {/* Nút "DANH MỤC" màu đỏ */}
      <div className="mb-6 flex justify-start">
        <button className="bg-red-600 text-white font-bold py-3 px-6 rounded transition-all">
          DANH MỤC
        </button>
      </div>
      {/* Container trắng chứa danh mục */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 border border-gray-300">
          {displayedCategories.map((category) => (
            <Link
              key={category.id}
              href={`/san-pham?category=${category.slug}`} // Sửa href ở đây
              className="flex flex-col items-center justify-center border border-gray-300 group relative aspect-square"
            >
              {/* Background Image */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Image
                  src="https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bW90b3JjeWNsZXxlbnwwfHwwfHx8MA%3D%3D"
                  alt="Background Image"
                  layout="fill"
                  className="object-cover"
                />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 bg-white group-hover:bg-transparent transition-colors"></div>
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center">
                {/* Icon or Placeholder */}
                <div className="relative mb-2">
                  {category.imageUrl && (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  )}
                </div>
                {/* Category Name */}
                <span className="text-sm text-black font-medium text-center group-hover:text-white transition-colors">
                  {category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
