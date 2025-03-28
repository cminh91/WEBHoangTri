"use client"

import { ShoppingCart } from "lucide-react"
import { useCart } from "./cart-provider"
import { Button } from "../ui/button"
import Link from "next/link"
import { Badge } from "../ui/badge"

export function CartButton({ className }: { className?: string }) {
  const { totalItems } = useCart()
  
  return (
    <Button 
      asChild
      variant="outline" 
      size="icon" 
      className={`relative bg-zinc-800 border-zinc-700 hover:bg-zinc-700 ${className}`}
    >
      <Link href="/gio-hang">
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-600"
          >
            {totalItems}
          </Badge>
        )}
      </Link>
    </Button>
  )
} 