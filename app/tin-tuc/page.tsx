import { ChevronRight } from "lucide-react"
import Link from "next/link"
import prisma from "@/lib/db"
import { formatDate } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tin Tức | Hoàng Trí Moto",
  description: "Cập nhật những tin tức mới nhất về Hoàng Trí Moto và ngành xe máy.",
}

export default async function NewsPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const resolvedSearchParams = await searchParams
  const currentPage = resolvedSearchParams.page ? Number.parseInt(resolvedSearchParams.page) : 1
  const itemsPerPage = 9

  const totalNews = await prisma.news.count({
    where: {
      isActive: true,
    },
  })

  // Add this line to calculate total pages
  const totalPages = Math.ceil(totalNews / itemsPerPage)

  const news = await prisma.news.findMany({
    where: {
      isActive: true,
    },
    include: {
      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (currentPage - 1) * itemsPerPage,
    take: itemsPerPage,
  })

  // Tạo URL cho phân trang
  const createPageURL = (pageNumber: number) => {
    return `/tin-tuc?page=${pageNumber}`
  }

  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center text-sm text-gray-400">
          <Link href="/" className="hover:text-red-600">
            Trang Chủ
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="text-white">Tin Tức</span>
        </div>

        <h1 className="mb-2 text-center text-4xl font-bold uppercase">Tin Tức & Sự Kiện</h1>
        <p className="mb-12 text-center text-gray-400">
          Cập nhật những tin tức mới nhất về Hoàng Trí Moto và ngành xe máy
        </p>

        {news.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {news.map((item: { 
                id: string;
                slug: string;
                title: string;
                content: string | null;
                excerpt: string | null;
                createdAt: Date;
                images: Array<{ url: string }>;
              }) => (
                <Link
                  key={item.id}
                  href={`/tin-tuc/${item.slug}`}
                  className="group overflow-hidden rounded-lg bg-zinc-900 transition-transform hover:-translate-y-1"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={item.images[0]?.url || "/placeholder.svg?height=200&width=400"}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 bg-red-600 px-3 py-1 text-sm font-medium">
                      {formatDate(item.createdAt)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-2 text-xl font-bold group-hover:text-red-600">{item.title}</h3>
                    <p className="text-gray-400 line-clamp-3">
                      {item.excerpt || item.content?.substring(0, 150) + "..."}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex space-x-1">
                  {currentPage > 1 && (
                    <Link
                      href={createPageURL(currentPage - 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-900 text-white hover:bg-red-600"
                    >
                      &lt;
                    </Link>
                  )}

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Link
                      key={page}
                      href={createPageURL(page)}
                      className={`flex h-10 w-10 items-center justify-center rounded-md ${
                        currentPage === page ? "bg-red-600 text-white" : "bg-zinc-900 text-white hover:bg-red-600"
                      }`}
                    >
                      {page}
                    </Link>
                  ))}

                  {currentPage < totalPages && (
                    <Link
                      href={createPageURL(currentPage + 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-900 text-white hover:bg-red-600"
                    >
                      &gt;
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-40 items-center justify-center rounded-lg bg-zinc-900">
            <p className="text-gray-400">Không có tin tức nào.</p>
          </div>
        )}
      </div>
    </div>
  )
}

