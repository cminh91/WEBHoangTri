"use client"

import { useState } from "react"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart/cart-provider"
import Link from "next/link"

interface Product {
  id: string
  name: string
  price: number
  image: string
}

export function AddToCartButton({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const { addItem } = useCart()

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }

  const handleAddToCart = () => {
    // Add item to cart multiple times based on quantity
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      })
    }
    
    // Show success state
    setAddedToCart(true)
    setTimeout(() => {
      setAddedToCart(false)
    }, 3000)
  }

  return (
    <div className="mb-8">
      <div className="mb-6">
        <div className="mb-2 font-semibold">Số Lượng:</div>
        <div className="flex h-12 w-32 items-center">
          <button 
            onClick={decreaseQuantity}
            className="flex h-full w-12 items-center justify-center border border-gray-700 hover:bg-red-600"
          >
            <Minus className="h-4 w-4" />
          </button>
          <div className="flex h-full w-12 items-center justify-center border-y border-gray-700 bg-zinc-900">
            {quantity}
          </div>
          <button 
            onClick={increaseQuantity}
            className="flex h-full w-12 items-center justify-center border border-gray-700 hover:bg-red-600"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {addedToCart ? (
          <Button className="w-full bg-green-600 py-6 text-lg hover:bg-green-700">
            Đã thêm vào giỏ hàng!
          </Button>
        ) : (
          <Button 
            onClick={handleAddToCart} 
            className="w-full bg-red-600 py-6 text-lg hover:bg-red-700"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Thêm Vào Giỏ Hàng
          </Button>
        )}
        
        <Button asChild className="w-full border-2 border-red-600 bg-transparent py-6 text-lg hover:bg-red-600">
          <Link href="/gio-hang">Xem Giỏ Hàng</Link>
        </Button>
      </div>
    </div>
  )
} 