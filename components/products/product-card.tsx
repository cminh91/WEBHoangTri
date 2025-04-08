"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Product } from "@/types"

interface ProductCardProps {
  product: Product
  storeLogoUrl?: string
}

export function ProductCard({ product, storeLogoUrl }: ProductCardProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-zinc-900">
      {product.featured && (
        <div className="absolute top-2 left-2 rounded bg-red-600 px-2 py-1 text-xs font-bold">
          Nổi bật
        </div>
      )}
      <Link href={`/san-pham/${product.slug}`}>
        <div className="relative aspect-square w-full">
          <Image
            src={product.images[0]?.url || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover transition-transform hover:scale-105"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute bottom-1 right-1 h-10 w-10 sm:h-12 sm:w-12 rounded-full p-1 overflow-hidden border-2 border-red-600 bg-black flex items-center justify-center">
            {storeLogoUrl ? (
              <Image
                src={storeLogoUrl}
                alt="Logo"
                fill
                className="object-contain rounded-full"
              />
            ) : (
              <span className="text-xs sm:text-sm font-bold text-red-600">HT</span>
            )}
          </div>
        </div>
        <div className="p-4">
          <h2 className="mb-2 text-lg font-semibold">{product.name}</h2>
          <div className="flex items-center gap-2">
            <p className="text-xl font-bold text-red-600">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
                maximumFractionDigits: 0,
              }).format(Number(product.salePrice || product.price))}
            </p>
            {product.salePrice && (
              <p className="text-sm text-gray-400 line-through">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                  maximumFractionDigits: 0,
                }).format(Number(product.price))}
              </p>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className={`text-sm ${product.inStock ? 'text-green-500' : 'text-red-500'}`}>
              {product.inStock ? 'Còn hàng' : 'Hết hàng'}
            </span>
            {product.category && (
              <span className="text-sm text-gray-400">
                {product.category.name}
              </span>
            )}
          </div>
          <Button className="mt-4 w-full bg-red-600 hover:bg-red-700">
            Xem Chi Tiết
          </Button>
        </div>
      </Link>
    </div>
  )
}