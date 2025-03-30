import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  salePrice?: number | null
  images: {
    url: string
    alt?: string | null
  }[]
}

interface RelatedProductsProps {
  products: Product[]
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products.length) return null

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <div key={product.id} className="group relative">
          <Link href={`/san-pham/${product.slug}`}>
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-800">
              <Image
                src={product.images[0]?.url || '/placeholder.png'}
                alt={product.images[0]?.alt || product.name}
                width={300}
                height={300}
                className="h-full w-full object-cover object-center transition-opacity group-hover:opacity-75"
              />
            </div>
            <div className="mt-4 flex justify-between">
              <div>
                <h3 className="text-sm text-white">
                  <span aria-hidden="true" className="absolute inset-0" />
                  {product.name}
                </h3>
              </div>
              <div className="text-right">
                {product.salePrice ? (
                  <>
                    <p className="text-sm font-medium text-red-500">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        maximumFractionDigits: 0
                      }).format(product.salePrice)}
                    </p>
                    <p className="text-xs line-through text-gray-400">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        maximumFractionDigits: 0
                      }).format(product.price)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-medium text-white">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      maximumFractionDigits: 0
                    }).format(product.price)}
                  </p>
                )}
              </div>
            </div>
          </Link>
          <Button className="mt-2 w-full" variant="outline">
            Thêm vào giỏ
          </Button>
        </div>
      ))}
    </div>
  )
}