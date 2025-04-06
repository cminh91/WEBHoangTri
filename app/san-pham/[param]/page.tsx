import { Button } from "@/components/ui/button"
import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import ImageSlider from "./_components/image-slider"
import RelatedProducts from "./_components/related-products"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

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

export const dynamicParams = false // Prevent fallback for non-generated routes

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    select: { slug: true },
    where: { isActive: true } // Only generate for active products
  })
  // Explicitly type the product parameter
  return products.map((product: { slug: string }) => ({
    param: product.slug,
  }))
}


export default async function ProductPage({ params }: { params: { param: string } }) {
  // Decode the slug from the URL parameter
  const decodedSlug = decodeURIComponent(params.param)

  // Get main product using the decoded slug
  const product = await prisma.product.findFirst({
    where: {
      slug: decodedSlug,
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
          name: true,
          slug: true
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
  let relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: processedProduct.category?.id,
      isActive: true,
      NOT: {
        id: product.id
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
  
  // Nếu không có sản phẩm liên quan, lấy sản phẩm nổi bật
  if (relatedProducts.length === 0) {
    console.log("No related products found, fetching featured products instead");
    relatedProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        featured: true,
        NOT: {
          id: product.id
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
  }
  
  // Convert Decimal to number for related products
  const processedRelatedProducts = relatedProducts.map((product: { price: number; salePrice: number | null }) => ({
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
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Breadcrumb - Tối ưu cho mobile */}
        <div className="mb-6 md:mb-8 flex flex-wrap items-center text-xs md:text-sm text-gray-400">
          <Link href="/" className="hover:text-red-600 transition-colors">
            Trang Chủ
          </Link>
          <ChevronRight className="mx-1 md:mx-2 h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
          <Link href="/san-pham" className="hover:text-red-600 transition-colors">
            Sản Phẩm
          </Link>
          {product.category && (
            <>
              <ChevronRight className="mx-1 md:mx-2 h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <Link href={`/san-pham/${product.category.slug}`} className="hover:text-red-600 transition-colors truncate max-w-[120px] md:max-w-none">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="mx-1 md:mx-2 h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
          <span className="text-white truncate max-w-[150px] md:max-w-none">{product.name}</span>
        </div>

        {/* Product Details - Cải thiện layout */}
        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:gap-12 md:grid-cols-2">
          {/* Images - Tối ưu cho mobile */}
          <div className="bg-zinc-900 rounded-lg overflow-hidden">
            <ImageSlider images={processedProduct.images} productName={processedProduct.name} />
          </div>

          {/* Info - Cải thiện spacing và responsive */}
          <div className="space-y-4 md:space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold">{processedProduct.name}</h1>

            {processedProduct.category && (
              <div className="text-gray-400 text-sm md:text-base">
                Danh mục: <Link href={`/san-pham/${product.category?.slug}`} className="text-white hover:text-red-500 transition-colors">{processedProduct.category?.name}</Link>
              </div>
            )}

            <div className="py-2">
              {processedProduct.salePrice ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 md:gap-4">
                    <span className="text-2xl md:text-3xl font-bold text-red-600">
                      {formatPrice(processedProduct.salePrice)}
                    </span>
                    <span className="text-lg md:text-xl line-through text-gray-400">
                      {formatPrice(processedProduct.price)}
                    </span>
                    <span className="rounded bg-red-600 px-2 py-1 text-xs md:text-sm font-bold">
                      {Math.round(
                        ((processedProduct.price - processedProduct.salePrice) /
                          processedProduct.price) *
                          100
                      )}
                      % GIẢM
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-2xl md:text-3xl font-bold text-red-600">
                  {formatPrice(processedProduct.price)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-3 md:h-4 md:w-4 rounded-full ${
                  processedProduct.inStock ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm md:text-base text-gray-400">
                {processedProduct.inStock ? "Còn hàng" : "Hết hàng"}
              </span>
            </div>
            
            {processedProduct.featured && (
              <div className="inline-block rounded bg-yellow-600 px-2 py-1 text-xs md:text-sm font-bold">
                Sản phẩm nổi bật
              </div>
            )}
            
            <div className="border-t border-zinc-800 pt-4 mt-4">
              <p className="text-gray-400 text-sm md:text-base">{processedProduct.description}</p>
            </div>

            <Button 
              className="w-full bg-red-600 hover:bg-red-700 transition-colors py-2 md:py-3 text-sm md:text-base mt-4" 
              disabled={!processedProduct.inStock}
            >
              {processedProduct.inStock ? "Thêm Vào Giỏ Hàng" : "Hết Hàng"}
            </Button>
          </div>
        </div>

        {/* Long description & specs - Cải thiện spacing */}
        <div className="mt-12 md:mt-16 space-y-8">

          {processedProduct.specs && (
            <div className="bg-zinc-900 rounded-lg p-4 md:p-6">
              <h2 className="mb-4 text-xl md:text-2xl font-bold">Thông số kỹ thuật</h2>
              <div 
                className="prose prose-sm md:prose-base prose-invert max-w-none text-gray-400"
                dangerouslySetInnerHTML={{ __html: processedProduct.specs }}
              />
            </div>
          )}
        </div>

        {/* Related products - Cải thiện responsive */}
        {processedRelatedProducts.length > 0 && (
          <div className="mt-12 md:mt-16">
            <h2 className="mb-6 md:mb-8 text-xl md:text-2xl font-bold">
              {processedProduct.category?.id ? "Sản phẩm liên quan" : "Sản phẩm khác"}
            </h2>
            <RelatedProducts products={processedRelatedProducts} />
          </div>
        )}
      </div>
    </div>
  )
}