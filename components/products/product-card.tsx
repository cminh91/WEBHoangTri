"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { useCart } from "@/components/cart/cart-provider"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  salePrice?: number
  image: string
  categoryId?: string
  categoryName?: string
  categorySlug?: string
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  
  const isOnSale = product.salePrice !== undefined && product.salePrice < product.price
  const displayPrice = isOnSale ? product.salePrice! : product.price
  
  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: displayPrice,
      image: product.image
    })
  }
  
  return (
    <Card className="overflow-hidden border-zinc-800 bg-zinc-900">
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/san-pham/${product.slug}`}>
          <Image
            src={product.image || "/placeholder.png"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
          {isOnSale && (
            <Badge className="absolute right-2 top-2 bg-red-600 hover:bg-red-700">Sale</Badge>
          )}
        </Link>
      </div>
      <CardContent className="p-4">
        <h3 className="mb-1 line-clamp-1 font-medium">
          <Link href={`/san-pham/${product.slug}`} className="hover:text-red-500">
            {product.name}
          </Link>
        </h3>
        {product.categoryName && (
          <p className="text-xs text-zinc-400">{product.categoryName}</p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <span className="font-semibold text-white">{formatCurrency(displayPrice)}</span>
          {isOnSale && (
            <span className="text-sm text-zinc-400 line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart}
          className="w-full bg-red-600 hover:bg-red-700"
          size="sm"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Thêm vào giỏ
        </Button>
      </CardFooter>
    </Card>
  )
} 