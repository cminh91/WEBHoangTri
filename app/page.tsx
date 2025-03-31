import dynamic from 'next/dynamic'

const SliderDisplay = dynamic<SliderDisplayProps>(() => import("@/components/slider/slider-display").then(mod => mod.SliderDisplay), {
  loading: () => <div className="w-full" style={{ paddingTop: "41.67%" }} />
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
// Add this import near the top with other dynamic imports
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
  ] = await Promise.all([
    getSliders(),
    getCategories(),
    getFeaturedProducts(),
    getTeamMembers(),
    getLatestNews(),
    getStoreInfo(),
    getFeaturedServices(),
    getPartners(),
    // Remove getProductCategories()
  ])

  // Format dữ liệu slider
  const formattedSliders = sliders.map(slider => ({
    ...slider,
    subtitle: null,
    buttonText: null,
    mobileUrl: null,
    description: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }))

  // Format dữ liệu products
  const formattedProducts = products.map(product => ({
    ...product,
    slug: product.name.toLowerCase().replace(/\s+/g, '-'),
    description: "Mô tả sản phẩm",
    isActive: true,
    // Thêm id vào category nếu category tồn tại
    category: product.category ? {
      ...product.category,
      id: product.categoryId || 'unknown-category-id'
    } : null
  }))

  // Format dữ liệu team members
  const formattedTeam = teamData.map(member => ({
    id: member.id,
    name: member.name,
    position: member.position,
    image: member.image || '/placeholder-user.jpg',
    bio: member.bio || 'Thông tin thành viên',
    order: member.order
  }))
// Format dữ liệu services
const formattedServices = services.map(service => ({
  ...service,
  slug: service.title?.toLowerCase().replace(/\s+/g, '-') || '',
  description: service.description || 'Mô tả dịch vụ',
  price: service.price ? Number(service.price.toString()) : null // format price
}))

  // Format dữ liệu partners
  const formattedPartners = partners.map(partner => ({
    id: partner.id,
    name: partner.name,
    logo: partner.logo,
    website: partner.website,
    order: partner.order
  }))


  // Format dữ liệu news
  const formattedNews = newsData.map(news => ({
    ...news,
    slug: news.title.toLowerCase().replace(/\s+/g, '-'),
    excerpt: news.content?.substring(0, 100) + '...' || 'Mô tả tin tức',
    author: 'Admin',
    categoryId: null,
    isActive: true,
    published: true
  }))

  return (
    <main className="flex min-h-screen flex-col">
      <SliderDisplay sliders={formattedSliders} />
      <WhyChooseUs />
      <SpecialServices initialServices={formattedServices} />
      <YouTubeSection videoId={storeInfo.youtubeVideoId} />
      <CategoryGrid categories={categories} />
      <FeaturedProducts 
        initialProducts={formattedProducts} 
        categories={categories}
      />
      <NewsSection initialNews={formattedNews} />
      <StatsCounter />
      <TrustedPartners initialPartners={formattedPartners} />
      <TeamSlider teamMembers={formattedTeam} />
      <TeamMembers teamMembers={formattedTeam} />
      <PricingSection />
    </main>
  )
}