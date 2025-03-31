import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import prisma from "@/lib/db"
import { ServiceCategoryFilter } from "@/components/services/category-filter"

interface PageProps {
  searchParams: {
    category?: string
  }
}

// Cập nhật hàm để nhận tham số danh mục
async function getServices(categorySlug?: string) {
  try {
    const where: any = { isActive: true }
    
    if (categorySlug) {
      where.category = { slug: categorySlug }
    }
    
    const services = await prisma.service.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return services
  } catch (error) {
    console.error("Error fetching services:", error)
    return []
  }
}

// Cập nhật component để nhận searchParams
export default async function ServicesPage({ searchParams }: PageProps) {
  // Lấy tất cả danh mục dịch vụ cho bộ lọc
  const categories = await prisma.category.findMany({
    where: { type: 'SERVICE', isActive: true },
    select: { name: true, slug: true }
  })
  
  // Lấy dịch vụ với bộ lọc danh mục
  const services = await getServices(searchParams.category)
  
  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Breadcrumb - Cải thiện cho mobile */}
        <div className="mb-6 flex items-center text-xs md:text-sm text-gray-400">
          <Link href="/" className="hover:text-red-600 transition-colors">
            Trang Chủ
          </Link>
          <ChevronRight className="mx-1 md:mx-2 h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
          <span className="text-white">Dịch Vụ</span>
          {searchParams.category && categories.find(c => c.slug === searchParams.category) && (
            <>
              <ChevronRight className="mx-1 md:mx-2 h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
              <span className="text-white">
                {categories.find(c => c.slug === searchParams.category)?.name}
              </span>
            </>
          )}
        </div>

        <h1 className="mb-2 text-center text-2xl md:text-4xl font-bold uppercase tracking-wider">Dịch Vụ</h1>
        <p className="mb-8 text-center text-sm md:text-base text-gray-400">Khám phá các dịch vụ chuyên nghiệp của Hoàng Trí Moto</p>

        {/* Thêm bộ lọc danh mục */}
        <div className="mb-8 p-4 bg-zinc-900/50 rounded-lg shadow-lg">
          <ServiceCategoryFilter categories={categories} />
        </div>

        {/* Phần còn lại của trang */}
        <div className="space-y-8 md:space-y-16">
          {services && services.length > 0 ? (
            services.map((service, index) => (
              <div key={service.id} className="rounded-lg bg-zinc-900 overflow-hidden shadow-lg transform transition-transform hover:scale-[1.01] duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {index % 2 === 0 ? (
                    <>
                      <div className="relative h-[250px] sm:h-[300px] md:h-auto">
                        <Link href={`/dich-vu/${service.slug}`}>
                          <Image
                            src={service.images[0]?.url || "/placeholder.svg"}
                            alt={service.title}
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </Link>
                      </div>
                      <div className="p-6 md:p-8">
                        {service.category && (
                          <Link 
                            href={`/dich-vu?category=${service.category.slug}`}
                            className="inline-block mb-2 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                          >
                            {service.category.name}
                          </Link>
                        )}
                        <Link href={`/dich-vu/${service.slug}`} className="hover:text-red-600 transition-colors">
                          <h2 className="mb-4 text-xl md:text-2xl font-bold">{service.title}</h2>
                        </Link>
                        <p className="mb-6 text-sm md:text-base text-gray-400">{service.description}</p>
                        <ul className="mb-6 space-y-2">
                          {service.features && service.features.split(',').map((feature, i) => (
                            <li key={i} className="flex items-center text-sm md:text-base">
                              <div className="mr-3 h-2 w-2 rounded-full bg-red-600 flex-shrink-0"></div>
                              <span>{feature.trim()}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex flex-wrap gap-3 md:gap-4">
                          <Link href={`/dich-vu/${service.slug}`}>
                            <Button variant="outline" className="border-red-600 text-white hover:bg-red-600 transition-colors">
                              Xem Chi Tiết
                            </Button>
                          </Link>
                          <Link href={`/lien-he?service=${service.slug}`}>
                            <Button className="bg-red-600 hover:bg-red-700 transition-colors">Đặt Lịch Ngay</Button>
                          </Link>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-6 md:p-8 order-2 md:order-1">
                        {service.category && (
                          <Link 
                            href={`/dich-vu?category=${service.category.slug}`}
                            className="inline-block mb-2 text-xs font-semibold text-red-500 hover:text-red-600 transition-colors"
                          >
                            {service.category.name}
                          </Link>
                        )}
                        <Link href={`/dich-vu/${service.slug}`} className="hover:text-red-600 transition-colors">
                          <h2 className="mb-4 text-xl md:text-2xl font-bold">{service.title}</h2>
                        </Link>
                        <p className="mb-6 text-sm md:text-base text-gray-400">{service.description}</p>
                        <ul className="mb-6 space-y-2">
                          {service.features && service.features.split(',').map((feature, i) => (
                            <li key={i} className="flex items-center text-sm md:text-base">
                              <div className="mr-3 h-2 w-2 rounded-full bg-red-600 flex-shrink-0"></div>
                              <span>{feature.trim()}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex flex-wrap gap-3 md:gap-4">
                          <Link href={`/dich-vu/${service.slug}`}>
                            <Button variant="outline" className="border-red-600 text-white hover:bg-red-600 transition-colors">
                              Xem Chi Tiết
                            </Button>
                          </Link>
                          <Link href={`/lien-he?service=${service.slug}`}>
                            <Button className="bg-red-600 hover:bg-red-700 transition-colors">Đặt Lịch Ngay</Button>
                          </Link>
                        </div>
                      </div>
                      <div className="relative h-[250px] sm:h-[300px] md:h-auto order-1 md:order-2">
                        <Link href={`/dich-vu/${service.slug}`}>
                          <Image
                            src={service.images[0]?.url || "/placeholder.svg"}
                            alt={service.title}
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg bg-zinc-900 p-8 text-center shadow-lg">
              <p className="text-gray-400">Không tìm thấy dịch vụ nào</p>
              <Link href="/dich-vu">
                <Button className="mt-4 bg-red-600 hover:bg-red-700 transition-colors">
                  Xem tất cả dịch vụ
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-lg bg-zinc-900 p-8 md:p-12 text-center shadow-lg">
          <h2 className="mb-4 text-2xl md:text-3xl font-bold">Bạn Cần Hỗ Trợ?</h2>
          <p className="mx-auto mb-6 md:mb-8 max-w-2xl text-sm md:text-base text-gray-400">
            Liên hệ với chúng tôi ngay để được tư vấn và đặt lịch sử dụng dịch vụ
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/lien-he">
              <Button className="bg-red-600 px-6 py-2 md:px-8 md:py-6 text-base md:text-lg font-semibold text-white hover:bg-red-700 transition-colors">
                Liên Hệ Ngay
              </Button>
            </Link>
            <Link href="/bang-gia">
              <Button className="border-2 border-red-600 bg-transparent px-6 py-2 md:px-8 md:py-6 text-base md:text-lg font-semibold text-white hover:bg-red-600 transition-colors">
                Xem Bảng Giá
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

