import { Button } from "@/components/ui/button"
import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import ImageSlider from "./_components/image-slider"
import RelatedProducts from "./_components/related-products"


interface ProductPageProps {
  params: {
    param: string
  }
}

interface Product {
  id: string
  name: string
  slug: string
  description?: string | null
  longDescription?: string | null
  price: number
  salePrice?: number | null
  inStock: boolean
  featured: boolean
  specs?: any
  category?: {
    id: string
    name: string
  } | null
  images: {
    url: string
    alt?: string | null
  }[]
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { param } = params

  // Get main product
  const product = await prisma.product.findFirst({
    where: {
      slug: param,
      isActive: true
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      longDescription: true,
      price: true,
      salePrice: true,
      inStock: true,
      featured: true,
      specs: true,
      category: {
        select: {
          id: true,
          name: true
        }
      },
      images: {
        select: {
          url: true,
          alt: true
        }
      }
    }
  })

  if (!product) {
    notFound()
  }

  // Convert Decimal to number
  const processedProduct = {
    ...product,
    price: Number(product.price),
    salePrice: product.salePrice ? Number(product.salePrice) : null
  }

  // Get related products
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: processedProduct.category?.id || undefined,
      isActive: true,
      NOT: {
        slug: param
      }
    },
    take: 4,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      salePrice: true,
      images: {
        select: {
          url: true,
          alt: true
        },
        take: 1
      }
    }
  })

  // Convert Decimal to number for related products
  const processedRelatedProducts = relatedProducts.map(product => ({
    ...product,
    price: Number(product.price),
    salePrice: product.salePrice ? Number(product.salePrice) : null
  }))

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
          <div className="space-y-4">
            <ImageSlider images={processedProduct.images} productName={processedProduct.name} />
          </div>

          {/* Info */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{processedProduct.name}</h1>

            {processedProduct.category && (
              <div className="text-gray-400">
                Danh mục: <span className="text-white">{processedProduct.category.name}</span>
              </div>
            )}

            <div>
              {processedProduct.salePrice ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-red-600">
                      {formatPrice(processedProduct.salePrice)}
                    </span>
                    <span className="text-xl line-through text-gray-400">
                      {formatPrice(processedProduct.price)}
                    </span>
                    <span className="rounded bg-red-600 px-2 py-1 text-sm font-bold">
                      {Math.round(
                        ((processedProduct.price - processedProduct.salePrice) /
                          processedProduct.price) *
                          100
                      )}
                      % OFF
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-3xl font-bold text-red-600">
                  {formatPrice(processedProduct.price)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`h-4 w-4 rounded-full ${
                  processedProduct.inStock ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-gray-400">
                {processedProduct.inStock ? "Còn hàng" : "Hết hàng"}
              </span>
            </div>
            {processedProduct.featured && (
              <div className="inline-block rounded bg-yellow-600 px-3 py-1 text-sm font-bold">
                Sản phẩm nổi bật
              </div>
              
            )}
            <p className="text-gray-400">{processedProduct.description}</p>

            <Button 
              className="w-full bg-red-600 hover:bg-red-700" 
              disabled={!processedProduct.inStock}
            >
              Thêm Vào Giỏ Hàng
            </Button>
            {processedProduct.longDescription && (
            <div>
              <h2 className="mb-4 text-2xl font-bold">Mô tả sản phẩm</h2>
              <div 
                className="prose prose-invert max-w-none text-gray-400"
                dangerouslySetInnerHTML={{ __html: processedProduct.longDescription }}
              />
            </div>
          )}
           
          </div>
        </div>

        {/* Long description & specs */}
        <div className="mt-16 space-y-8">
         

          {processedProduct.specs && (
            <div>
            <h2 className="mb-4 text-2xl font-bold">Thông số kỹ thuật</h2>
            <div 
              className="prose prose-invert max-w-none text-gray-400"
              dangerouslySetInnerHTML={{ __html: processedProduct.specs }}
            />
          </div>
          )}
        </div>

        {/* Related products */}
        {/* {processedRelatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-8 text-2xl font-bold">Sản phẩm liên quan</h2>
            <RelatedProducts products={processedRelatedProductsc} />
          </div>
        )} */}
      </div>
    </div>
  )
}