import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import prisma from "@/lib/db"

// Add a new async function to fetch services data
async function getServices() {
  try {
    const services = await prisma.service.findMany({
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

// Update the component to be async
export default async function ServicesPage() {
  // Fetch services data
  const services = await getServices()
  
  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center text-sm text-gray-400">
          <Link href="/" className="hover:text-red-600">
            Trang Chủ
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="text-white">Dịch Vụ</span>
        </div>

        <h1 className="mb-2 text-center text-4xl font-bold uppercase">Dịch Vụ</h1>
        <p className="mb-12 text-center text-gray-400">Khám phá các dịch vụ chuyên nghiệp của Hoàng Trí Moto</p>


        <div className="space-y-16">
          {services && services.length > 0 ? (
            services.map((service, index) => (
              <div key={service.id} className="rounded-lg bg-zinc-900 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {index % 2 === 0 ? (
                    <>
                      <div className="relative h-[300px] md:h-auto">
                        <Link href={`/dich-vu/${service.slug}`}>
                          <Image
                            src={service.images[0]?.url || "/placeholder.svg"}
                            alt={service.title}
                            fill
                            className="object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </Link>
                      </div>
                      <div className="p-8">
                        <Link href={`/dich-vu/${service.slug}`} className="hover:text-red-600 transition-colors">
                          <h2 className="mb-4 text-2xl font-bold">{service.title}</h2>
                        </Link>
                        <p className="mb-6 text-gray-400">{service.description}</p>
                        <ul className="mb-6 space-y-2">
                          {service.features && service.features.split(',').map((feature, i) => (
                            <li key={i} className="flex items-center">
                              <div className="mr-3 h-2 w-2 rounded-full bg-red-600"></div>
                              <span>{feature.trim()}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex gap-4">
                          <Link href={`/dich-vu/${service.slug}`}>
                            <Button variant="outline" className="border-red-600 text-white hover:bg-red-600">
                              Xem Chi Tiết
                            </Button>
                          </Link>
                          <Link href={`/lien-he?service=${service.slug}`}>
                            <Button className="bg-red-600 hover:bg-red-700">Đặt Lịch Ngay</Button>
                          </Link>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-8">
                        <Link href={`/dich-vu/${service.slug}`} className="hover:text-red-600 transition-colors">
                          <h2 className="mb-4 text-2xl font-bold">{service.title}</h2>
                        </Link>
                        <p className="mb-6 text-gray-400">{service.description}</p>
                        <ul className="mb-6 space-y-2">
                          {service.features && service.features.split(',').map((feature, i) => (
                            <li key={i} className="flex items-center">
                              <div className="mr-3 h-2 w-2 rounded-full bg-red-600"></div>
                              <span>{feature.trim()}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex gap-4">
                          <Link href={`/dich-vu/${service.slug}`}>
                            <Button variant="outline" className="border-red-600 text-white hover:bg-red-600">
                              Xem Chi Tiết
                            </Button>
                          </Link>
                          <Link href={`/lien-he?service=${service.slug}`}>
                            <Button className="bg-red-600 hover:bg-red-700">Đặt Lịch Ngay</Button>
                          </Link>
                        </div>
                      </div>
                      <div className="relative h-[300px] md:h-auto">
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
            <div className="rounded-lg bg-zinc-900 p-8 text-center">
              <p className="text-gray-400">Đang tải dịch vụ...</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-lg bg-zinc-900 p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Bạn Cần Hỗ Trợ?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-gray-400">
            Liên hệ với chúng tôi ngay để được tư vấn và đặt lịch sử dụng dịch vụ
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/lien-he">
              <Button className="bg-red-600 px-8 py-6 text-lg font-semibold text-white hover:bg-red-700">
                Liên Hệ Ngay
              </Button>
            </Link>
            <Button className="border-2 border-red-600 bg-transparent px-8 py-6 text-lg font-semibold text-white hover:bg-red-600">
              Xem Bảng Giá
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

