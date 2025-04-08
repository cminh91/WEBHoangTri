import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import prisma from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"

interface ServicePageProps {
  params: {
    param: string[]
  }
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const paramArray = resolvedParams.param as string[];

  let categorySlug = paramArray[0];
  let serviceSlug = paramArray.length === 2 ? paramArray[1] : null;

  try {
    const category = await prisma.category.findFirst({
      where: {
        slug: categorySlug,
        type: "SERVICE"
      }
    });

    if (serviceSlug && category) {
      const service = await prisma.service.findFirst({
        where: {
          slug: serviceSlug,
          categoryId: category.id
        },
        include: {
          category: true
        }
      });

      if (service) {
        return {
          title: `${service.title} | Hoàng Trí Moto`,
          description: service.metaDescription || service.description?.substring(0, 160),
          openGraph: {
            title: `${service.title} | Hoàng Trí Moto`,
            description: service.metaDescription || service.description?.substring(0, 160),
            images: service.icon ? [{ url: service.icon }] : [],
          },
        };
      }
    }

    if (category) {
      return {
        title: `${category.name} | Dịch Vụ | Hoàng Trí Moto`,
        description: category.description || `Các dịch vụ ${category.name} từ Hoàng Trí Moto`,
      };
    }

    if (serviceSlug) {
      const service = await prisma.service.findFirst({
        where: {
          slug: serviceSlug
        },
        include: {
          category: true
        }
      });

      if (service) {
        return {
          title: `${service.title} | Hoàng Trí Moto`,
          description: service.metaDescription || service.description?.substring(0, 160),
          openGraph: {
            title: `${service.title} | Hoàng Trí Moto`,
            description: service.metaDescription || service.description?.substring(0, 160),
            images: service.icon ? [{ url: service.icon }] : [],
          },
        };
      }
    }

    return {
      title: "Dịch vụ | Hoàng Trí Moto",
      description: "Các dịch vụ sửa chữa và bảo dưỡng xe máy chuyên nghiệp",
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Dịch vụ | Hoàng Trí Moto",
      description: "Các dịch vụ sửa chữa và bảo dưỡng xe máy chuyên nghiệp",
    };
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const resolvedParams = await params;
  const paramArray = resolvedParams.param as string[];

  let categorySlug = paramArray[0];
  let serviceSlug = paramArray.length === 2 ? paramArray[1] : null;

  try {
    const category = await prisma.category.findFirst({
      where: {
        slug: categorySlug,
        type: "SERVICE"
      }
    });

    if (serviceSlug && category) {
      const service = await prisma.service.findFirst({
        where: {
          slug: serviceSlug,
          categoryId: category.id
        },
        include: {
          category: true,
          images: true
        }
      });

      if (service) {
        return await renderServicePage(service);
      }
    }

    if (category) {
      return await renderCategoryPage(category);
    }

    if (serviceSlug) {
      const service = await prisma.service.findFirst({
        where: {
          slug: serviceSlug
        },
        include: {
          category: true,
          images: true
        }
      });

      if (service) {
        return await renderServicePage(service);
      }
    }

    notFound();
  } catch (error) {
    console.error("Error in service page:", error);
    notFound();
  }
}

async function renderCategoryPage(category: any) {
  const services = await prisma.service.findMany({
    where: {
      categoryId: category.id,
      isActive: true,
    },
    include: {
      images: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center text-sm text-gray-400">
          <Link href="/" className="hover:text-red-600">Trang Chủ</Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <Link href="/dich-vu" className="hover:text-red-600">Dịch Vụ</Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="text-white">{category.name}</span>
        </div>

        <h1 className="mb-8 text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <div className="mb-8 max-w-3xl text-gray-300">{category.description}</div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/dich-vu/${service.slug}`}
              className="group overflow-hidden rounded-lg bg-zinc-900"
            >
              <div className="relative aspect-video">
                <Image
                  src={service.images[0]?.url || "/placeholder.svg"}
                  alt={service.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold group-hover:text-red-600">{service.title}</h3>
                {service.price && (
                  <div className="mt-2 font-bold text-red-500">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      maximumFractionDigits: 0
                    }).format(Number(service.price))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

async function renderServicePage(service: any) {
  const relatedServices = await prisma.service.findMany({
    where: {
      categoryId: service.categoryId,
      id: { not: service.id },
      isActive: true,
    },
    take: 3,
    include: {
      images: true,
    },
  });

  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center text-sm text-gray-400">
          <Link href="/" className="hover:text-red-600">Trang Chủ</Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <Link href="/dich-vu" className="hover:text-red-600">Dịch Vụ</Link>
          {service.category && (
            <>
              <ChevronRight className="mx-2 h-4 w-4" />
              <Link href={`/dich-vu/${service.category?.slug}`} className="hover:text-red-600">
                {service.category?.name}
              </Link>
            </>
          )}
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="text-white">{service.title}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={service.images[0]?.url || "/placeholder.svg"}
                alt={service.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {service.images.slice(1).map((image: any, index: number) => (
                <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={image.url}
                    alt={`${service.title} - Ảnh ${index + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{service.title}</h1>
            {service.category && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Danh mục:</span>
                <Link href={`/dich-vu/${service.category?.slug}`} className="text-red-600 hover:underline">
                  {service.category?.name}
                </Link>
              </div>
            )}
            
            <div className="prose prose-invert max-w-none">
              <p>{service.description}</p>
            </div>

            {service.features && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Tính Năng & Dịch Vụ</h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {service.features.split(',').map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-600" />
                      <span>{feature.trim()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-4">
              <Link href={`/lien-he?service=${service.slug}`}>
                <Button className="bg-red-600 hover:bg-red-700">
                  Đặt Lịch Ngay
                </Button>
              </Link>
              <Link href="/lien-he">
                <Button variant="outline" className="border-red-600 text-white hover:bg-red-600">
                  Liên Hệ Tư Vấn
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {service.longDescription && (
          <div className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold">Chi Tiết Dịch Vụ</h2>
            <div 
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: service.longDescription }}
            />
          </div>
        )}
        
        {relatedServices.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-8 text-2xl font-bold">Dịch Vụ Liên Quan</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedServices.map((related) => (
                <Link
                  key={related.id}
                  href={`/dich-vu/${related.slug}`}
                  className="group overflow-hidden rounded-lg bg-zinc-900"
                >
                  <div className="relative aspect-video">
                    <Image
                      src={related.images[0]?.url || "/placeholder.svg"}
                      alt={related.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold group-hover:text-red-600">{related.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}