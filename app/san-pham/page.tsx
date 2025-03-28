import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import prisma from "@/lib/db"

// Đơn giản hóa interface
interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: Array<{ url: string }>
}

export default async function ProductsPage() {
  // Chỉ lấy sản phẩm đang active
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
    },
    include: {
      images: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Hàm format giá
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <h1 className="mb-2 text-center text-4xl font-bold">Sản Phẩm</h1>
        <p className="mb-12 text-center text-gray-400">
          Các sản phẩm chất lượng từ Hoàng Trí Moto
        </p>

        {/* Product Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="overflow-hidden rounded-lg bg-zinc-900">
              <Link href={`/san-pham/${product.slug}`}>
                <div className="relative h-48">
                  <Image
                    src={product.images[0]?.url || "/placeholder.png"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h2 className="mb-2 text-lg font-semibold">{product.name}</h2>
                  <p className="text-xl font-bold text-red-600">
                    {formatPrice(Number(product.price))}
                  </p>
                  <Button className="mt-4 w-full bg-red-600 hover:bg-red-700">
                    Xem Chi Tiết
                  </Button>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

