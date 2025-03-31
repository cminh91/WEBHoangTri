"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function NoProductsFound() {
  const router = useRouter()
  
  return (
    <div className="text-center py-12">
      <p className="text-xl text-gray-400">Không tìm thấy sản phẩm nào</p>
      <Button 
        className="mt-4 bg-red-600 hover:bg-red-700 transition-colors"
        onClick={() => router.push('/san-pham')}
      >
        Xem tất cả sản phẩm
      </Button>
    </div>
  )
}