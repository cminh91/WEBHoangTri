import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import prisma from "@/lib/db"
import { formatDate } from "@/lib/utils"
import type { Metadata } from "next"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface ParamPageProps {
  params: {
    param: string
  }
}

export async function generateMetadata({ params }: ParamPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { param } = resolvedParams;

  try {
    // Check if param is a category
    const category = await prisma.category.findFirst({
      where: { 
        slug: param,
        type: "NEWS" 
      }
    });

    if (category) {
      return {
        title: `${category.name} | Tin Tức | Hoàng Trí Moto`,
        description: category.description || `Tin tức về ${category.name} từ Hoàng Trí Moto`,
      };
    }

    // If not a category, check if it's a news article
    const news = await prisma.news.findUnique({
      where: {
        slug: param,
      },
      include: {
        images: true,
      },
    });

    if (news) {
      return {
        title: `${news.title} | Hoàng Trí Moto`,
        description: news.excerpt || news.content?.substring(0, 160) || `Chi tiết tin tức ${news.title}`,
        openGraph: {
          title: `${news.title} | Hoàng Trí Moto`,
          description: news.excerpt || news.content?.substring(0, 160) || `Chi tiết tin tức ${news.title}`,
          images: news.images?.[0]?.url ? [{ url: news.images[0].url }] : [],
        },
      };
    }

    return {
      title: "Tin tức không tồn tại | Hoàng Trí Moto",
      description: "Không tìm thấy tin tức",
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Tin tức | Hoàng Trí Moto",
      description: "Tin tức mới nhất từ Hoàng Trí Moto",
    };
  }
}

export default async function ParamPage({ params }: ParamPageProps) {
  const resolvedParams = await params;
  const { param } = resolvedParams;

  try {
    // Check if param is a category
    const category = await prisma.category.findFirst({
      where: { 
        slug: param,
        type: "NEWS" 
      }
    });

    if (category) {
      // Render category page
      return await renderCategoryPage(category);
    }

    // If not a category, check if it's a news article
    const news = await prisma.news.findUnique({
      where: {
        slug: param,
      },
      include: {
        images: true,
        category: true,
      },
    });

    if (news) {
      // Render news page
      return await renderNewsPage(news);
    }

    // If param doesn't match any category or news
    notFound();
  } catch (error) {
    console.error("Error in news page:", error);
    notFound();
  }
}

async function renderCategoryPage(category: any) {
  // Fetch news in this category
  const newsItems = await prisma.news.findMany({
    where: {
      categoryId: category.id,
      isActive: true,
    },
    include: {
      images: true,
      category: true,
    },
    orderBy: {
      publishDate: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center text-sm text-gray-400">
          <Link href="/" className="hover:text-red-600">
            Trang Chủ
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <Link href="/tin-tuc" className="hover:text-red-600">
            Tin Tức
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="text-white">{category.name}</span>
        </div>

        <h1 className="mb-2 text-center text-4xl font-bold uppercase">{category.name}</h1>
        <p className="mb-12 text-center text-gray-400">Tin tức về {category.name} từ Hoàng Trí Moto</p>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {newsItems.map((item: { id: string; images: { url: string }[]; title: string; slug: string; publishDate: Date; category: { name: string } | null; excerpt: string | null }) => (
            <Link
              href={`/tin-tuc/${item.slug}`}
              key={item.id}
              className="group overflow-hidden rounded-lg bg-zinc-900"
            >
              <div className="relative aspect-video">
                <Image
                  src={item.images[0]?.url || "/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="mb-2 text-sm text-gray-400">
                  <span>{formatDate(item.publishDate)}</span>
                  {item.category && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{item.category.name}</span>
                    </>
                  )}
                </div>
                <h2 className="mb-2 text-xl font-bold group-hover:text-red-600">{item.title}</h2>
                <p className="text-gray-400">{item.excerpt ?? ""}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

async function renderNewsPage(news: any) {
  // Fetch related news
  const relatedNews = await prisma.news.findMany({
    where: {
      categoryId: news.categoryId,
      id: { not: news.id },
      isActive: true,
    },
    include: {
      images: true,
      category: true,
    },
    orderBy: {
      publishDate: 'desc',
    },
    take: 3,
  });

  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center text-sm text-gray-400">
          <Link href="/" className="hover:text-red-600">Trang Chủ</Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <Link href="/tin-tuc" className="hover:text-red-600">Tin Tức</Link>
          {news.category && (
            <>
              <ChevronRight className="mx-2 h-4 w-4" />
              <Link href={`/tin-tuc/${news.category.slug}`} className="hover:text-red-600">
                {news.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="text-white">{news.title}</span>
        </div>

        {/* News Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold">{news.title}</h1>
          <div className="flex items-center text-sm text-gray-400">
            <span>{formatDate(news.publishDate)}</span>
            {news.category && (
              <>
                <span className="mx-2">•</span>
                <Link href={`/tin-tuc/${news.category.slug}`} className="hover:text-red-600">
                  {news.category.name}
                </Link>
              </>
            )}
            {news.author && (
              <>
                <span className="mx-2">•</span>
                <span>{news.author}</span>
              </>
            )}
          </div>
        </div>

        {/* Featured Image */}
        {news.images && news.images.length > 0 && (
          <div className="mb-8 overflow-hidden rounded-lg">
            <Image
              src={news.images[0].url}
              alt={news.title}
              width={900}
              height={500}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* News Content */}
        <div className="mb-16 rounded-lg bg-zinc-900 p-8">
          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />

          {/* Tags */}
          {news.tags && (
            <div className="mt-8 flex flex-wrap gap-2">
              {news.tags.split(',').map((tag: string, index: number) => (
                <Button 
                  key={index}
                  variant="outline" 
                  size="sm"
                  className="rounded-full border-red-600 px-4 text-sm hover:bg-red-600"
                >
                  {tag.trim()}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Related News */}
        {relatedNews.length > 0 && (
          <div>
            <h2 className="mb-8 text-2xl font-bold">Tin Tức Liên Quan</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {relatedNews.map((item: { id: string; images: { url: string }[]; title: string; slug: string; publishDate: Date; category: { name: string } | null }) => (
                <Link
                  href={`/tin-tuc/${item.slug}`}
                  key={item.id}
                  className="group overflow-hidden rounded-lg bg-zinc-900"
                >
                  <div className="relative aspect-video">
                    <Image
                      src={item.images[0]?.url || "/placeholder.svg"}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <div className="mb-2 text-sm text-gray-400">
                      <span>{formatDate(item.publishDate)}</span>
                      {item.category && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{item.category.name}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-lg font-bold group-hover:text-red-600">{item.title}</h3>
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