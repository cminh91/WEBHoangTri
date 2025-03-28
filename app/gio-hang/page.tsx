"use client"

import { Trash, ShoppingBag, ArrowLeft, Plus, Minus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/components/cart/cart-provider"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { useState } from "react"

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    
    // Here you would integrate with a payment gateway
    // For this example, we'll just simulate a successful checkout
    setTimeout(() => {
      alert("Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.")
      clearCart()
      setIsCheckingOut(false)
    }, 2000)
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-zinc-500" />
          <h1 className="mb-4 text-2xl font-bold">Giỏ hàng của bạn đang trống</h1>
          <p className="mb-8 text-gray-400">
            Hãy khám phá các sản phẩm và dịch vụ của chúng tôi để thêm vào giỏ hàng
          </p>
          <Button asChild>
            <Link href="/san-pham" className="bg-red-600 hover:bg-red-700">
              Xem sản phẩm
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/san-pham" className="inline-flex items-center text-red-600 hover:text-red-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Tiếp tục mua sắm
        </Link>
      </div>
      
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-xl font-bold">Giỏ hàng của bạn</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-red-500 hover:text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                Xóa tất cả
              </Button>
            </div>
            
            <div className="divide-y divide-zinc-800">
              {items.map((item) => (
                <div key={item.id} className="flex py-4">
                  <div className="mr-4 h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-zinc-800">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between text-base font-medium">
                      <h3>{item.name}</h3>
                      <p className="ml-4">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-zinc-700 rounded-md">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 rounded-none rounded-l-md"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-10 text-center">{item.quantity}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 rounded-none rounded-r-md"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="h-fit rounded-lg border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-4 text-lg font-bold">Tóm tắt đơn hàng</h2>
          
          <div className="mb-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Tạm tính</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Phí vận chuyển</span>
              <span>Tính khi thanh toán</span>
            </div>
          </div>
          
          <div className="mb-6 border-t border-zinc-800 pt-4">
            <div className="flex justify-between font-bold">
              <span>Tổng cộng</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
          </div>
          
          <Button
            onClick={handleCheckout}
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={isCheckingOut}
          >
            {isCheckingOut ? "Đang xử lý..." : "Tiến hành thanh toán"}
          </Button>
          
          <div className="mt-4 space-y-2 text-sm text-gray-400">
            <p className="flex items-center">
              <span className="mr-1">Chúng tôi chấp nhận:</span>
              <span className="font-semibold">Tiền mặt, Chuyển khoản, Thẻ tín dụng/ghi nợ</span>
            </p>
            <p>Giá đã bao gồm thuế VAT</p>
          </div>
        </div>
      </div>
    </div>
  )
} 