"use client"

import { useCart } from "@/components/cart/cart-provider"
import { Button } from "@/components/ui/button"
import ImageSlider from "./_components/image-slider"
import { useState } from "react"

interface ProductClientProps {
  product: any
}

export default function ProductClient({ product }: ProductClientProps) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    const image = product.images && product.images.length > 0 ? product.images[0].url : "/product-placeholder.jpg"
    addItem({
      id: product.id,
      name: product.name,
      price: product.salePrice && product.salePrice < product.price ? product.salePrice : product.price,
      image: image
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{product.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-zinc-900 rounded-lg overflow-hidden">
            <ImageSlider images={product.images} productName={product.name} />
          </div>
          <div className="space-y-4 md:space-y-6">
            <div className="py-2">
              {product.salePrice ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 md:gap-4">
                    <span className="text-2xl md:text-3xl font-bold text-red-600">
                      {formatPrice(product.salePrice)}
                    </span>
                    <span className="text-lg md:text-xl line-through text-gray-400">
                      {formatPrice(product.price)}
                    </span>
                    <span className="rounded bg-red-600 px-2 py-1 text-xs md:text-sm font-bold">
                      {Math.round(
                        ((product.price - product.salePrice) /
                          product.price) *
                          100
                      )}
                      % GIẢM
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-2xl md:text-3xl font-bold text-red-600">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <Button
              onClick={handleAddToCart}
              className="w-full bg-red-600 hover:bg-red-700 transition-colors py-2 md:py-3 text-sm md:text-base mt-4"
            >
              Thêm Vào Giỏ Hàng
            </Button>

            <div className="border-t border-zinc-800 pt-4 mt-4">
              <p className="text-gray-400 text-sm md:text-base">{product.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}