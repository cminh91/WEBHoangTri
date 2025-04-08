import dynamic from 'next/dynamic'

const SliderDisplay = dynamic<SliderDisplayProps>(() => import("@/components/slider/slider-display").then(mod => mod.SliderDisplay), {
  loading: () => <div className="w-full" style={{ paddingTop: "60.67%" }} />
})

const CategoryGrid = dynamic(() => import("@/components/category-grid"))
const YouTubeSection = dynamic(() => import("@/components/youtube-section"))
const StatsCounter = dynamic(() => import("@/components/stats-counter"))
const TrustedPartners = dynamic(() => import("@/components/trusted-partners"), {
  loading: () => <div className="py-16 bg-black" />
})

const SpecialServices = dynamic(() => import("@/components/special-services"), {
  loading: () => <section className="bg-black py-16"><div className="container mx-auto px-4">Loading services...</div></section>
})
const WhyChooseUs = dynamic(() => import("@/components/why-choose-us"))
const PricingSection = dynamic(() => import("@/components/pricing-section"))
const TeamMembers = dynamic(() => import("@/components/about/team-members"))
const FeaturedProducts = dynamic(() => import("@/components/featured-products"), {
  loading: () => <div className="py-16 bg-black" />
})
const NewsSection = dynamic(() => import("@/components/news-section"))
const TeamSlider = dynamic(() => import("@/components/about/team-slider"), {
  loading: () => <div className="py-16 bg-black" />
})

import {
  getSliders,
  getCategories,
  getFeaturedProducts,
  getTeamMembers,
  getLatestNews,
  getStoreInfo,
  getFeaturedServices,
  getPartners,
  getServicePackages,
} from "@/lib/queries"
import { SliderDisplayProps } from "@/components/slider/slider-display"

export default async function Home() {
  // Fetch dữ liệu từ API
  const [
    sliders,
    categories,
    products,
    teamData,
    newsData,
    storeInfo,
    services,
    partners,
    servicePackages,
  ] = await Promise.all([
    getSliders(),
    getCategories(),
    getFeaturedProducts(),
    getTeamMembers(),
    getLatestNews(),
    getStoreInfo(),
    getFeaturedServices(),
    getPartners(),
    getServicePackages(),
  ])

  // Format sliders
  const formattedSliders = sliders.map((slider: any) => ({
    ...slider,
    buttonText: null,
    mobileUrl: null,
    description: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }))

  // Format products
  const formattedProducts = products.map((product: any) => ({
    ...product,
    slug: product.name.toLowerCase().replace(/\s+/g, '-'),
    description: "Mô tả sản phẩm",
    isActive: true,
    category: product.category ? {
      ...product.category,
      id: product.categoryId || 'unknown-category-id'
    } : null
  }))

  // Format team members
  const formattedTeam = teamData.map((member: any) => ({
    id: member.id,
    name: member.name,
    position: member.position,
    image: member.image ?? '/placeholder-user.jpg',
    bio: member.bio ?? 'Thông tin thành viên',
    order: member.order,
    socialLinks: member.socialLinks ?? [],
    email: member.email ?? '',
    phone: member.phone ?? ''
  }))

  // Format services
  const formattedServices = services.map((service: any) => ({
    id: service.id ?? '',
    title: service.title ?? '',
    slug: service.title ? service.title.toLowerCase().replace(/\s+/g, '-') : '',
    description: service.description ?? 'Mô tả dịch vụ',
    price: service.price ? Number(service.price.toString()) : null,
    images: service.images ?? [],
    category: service.category ?? null,
    icon: service.icon ?? null,
    isActive: service.isActive ?? true,
    createdAt: service.createdAt ?? new Date(),
    updatedAt: service.updatedAt ?? new Date(),
    features: service.features ?? null
  }))

  // Format partners
  const formattedPartners = partners.map((partner: any) => ({
    id: partner.id,
    name: partner.name,
    logo: partner.logo,
    website: partner.website ?? '',
    order: partner.order
  }))

  // Format news
  const formattedNews = newsData.map((news: any) => ({
    id: news.id ?? '',
    title: news.title,
    slug: news.title.toLowerCase().replace(/\s+/g, '-'),
    excerpt: news.content?.substring(0, 100) + '...' || 'Mô tả tin tức',
    author: 'Admin',
    categoryId: news.categoryId ?? null,
    isActive: true,
    published: true,
    publishDate: news.publishDate ?? new Date(),
    images: news.images ?? [],
    content: news.content ?? ''
  }))

  // Format servicePackages
  const formattedServicePackages = servicePackages.map((pkg: any) => ({
    ...pkg,
    features: Array.isArray(pkg.features) ? pkg.features.map((f: any) => String(f)) : []
  }))

  return (
    <main className="flex min-h-screen flex-col mt-2 md:mt-0">
      <section className="mb-0 md:mb-8">
        <SliderDisplay sliders={formattedSliders} />
      </section>
      <section className="mb-4 md:mb-8">
        <WhyChooseUs />
      </section>
      <section className="mb-4 md:mb-8">
        <SpecialServices initialServices={formattedServices} />
      </section>
      {storeInfo && storeInfo.youtubeVideoId && (
        <section className="mb-4 md:mb-8">
          <YouTubeSection videoId={storeInfo.youtubeVideoId} />
        </section>
      )}
      <section className="mb-4 md:mb-8">
        <CategoryGrid categories={categories} />
      </section>
      <section className="mb-4 md:mb-8">
        <FeaturedProducts
          initialProducts={formattedProducts}
          categories={categories}
        />
      </section>
      <section className="mb-4 md:mb-8">
        <NewsSection initialNews={formattedNews} />
      </section>
      <section className="mb-4 md:mb-8">
        <StatsCounter />
      </section>
      <section className="mb-4 md:mb-8">
        <TrustedPartners initialPartners={formattedPartners} />
      </section>
      <section className="mb-4 md:mb-8">
        <TeamSlider teamMembers={formattedTeam} />
      </section>
      <section className="mb-4 md:mb-8">
        <TeamMembers teamMembers={formattedTeam} />
      </section>
      <section className="mb-4 md:mb-8">
        <PricingSection servicePackages={formattedServicePackages} hotline={storeInfo?.hotline || "0123456789"} />
      </section>
    </main>
  )
}