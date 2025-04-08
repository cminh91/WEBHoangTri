import Image from "next/image"
import Link from "next/link"

interface RelatedProductsProps {
  products: {
    id: string
    name: string
    slug: string
    price: number
    salePrice: number | null
    images: {
      url: string
      alt?: string | null
    }[]
  }[]
  storeLogoUrl?: string
}

export default function RelatedProducts({ products, storeLogoUrl }: RelatedProductsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/san-pham/${product.slug}`}
          className="group overflow-hidden rounded-lg bg-zinc-900"
        >
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={product.images[0]?.url || "/placeholder.svg"}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
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
            <h3 className="text-lg font-semibold group-hover:text-red-600">{product.name}</h3>
            <div className="mt-2">
              {product.salePrice ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-red-600">{formatPrice(product.salePrice)}</span>
                  <span className="text-sm line-through text-gray-400">{formatPrice(product.price)}</span>
                </div>
              ) : (
                <span className="font-bold text-red-600">{formatPrice(product.price)}</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}