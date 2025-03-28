import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import prisma from "@/lib/db"
import { notFound } from "next/navigation"

interface ProductPageProps {
  params: {
    param: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { param } = params

  const product = await prisma.product.findFirst({
    where: {
      slug: param,
      isActive: true
    },
    include: {
      images: true,
    },
  })

  if (!product) {
    notFound()
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
      <div className="container mx-auto px-4 py-16">
        {/* Product Details */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Images */}
          <div className="relative h-[400px]">
            <Image
              src={product.images[0]?.url || "/placeholder.png"}
              alt={product.name}
              fill
              className="rounded-lg object-cover"
            />
          </div>

          {/* Info */}
          <div>
            <h1 className="mb-4 text-3xl font-bold">{product.name}</h1>
            <p className="mb-6 text-gray-400">{product.description}</p>
            <div className="mb-6">
              <span className="text-3xl font-bold text-red-600">
                {formatPrice(Number(product.price))}
              </span>
            </div>
            <Button className="w-full bg-red-600 hover:bg-red-700">
              Thêm Vào Giỏ Hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}