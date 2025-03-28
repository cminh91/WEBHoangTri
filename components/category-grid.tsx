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
        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-3 px-6 rounded transition-all">
          DANH MỤC
        </button>
      </div>

      {/* Container trắng chứa danh mục */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 border border-gray-300">
          {displayedCategories.map((category) => (
            <Link
              key={category.id}
              href={`/san-pham/${category.slug}`}
              className="flex flex-col items-center justify-center border border-gray-300 hover:bg-gray-100 transition-all p-4 aspect-square"
            >
              {/* Icon hoặc Placeholder */}
              {category.imageUrl ? (
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  width={48}
                  height={48}
                  className="object-contain mb-2"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded mb-2"></div> // Placeholder nếu không có ảnh
              )}
              {/* Tên danh mục */}
              <span className="text-sm text-black font-medium text-center">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
