import { SliderDisplay } from "@/components/slider/slider-display"
import CategoryGrid from "@/components/category-grid"
import YouTubeSection from "@/components/youtube-section"
import StatsCounter from "@/components/stats-counter"
import TrustedPartners from "@/components/trusted-partners"
import SpecialServices from "@/components/special-services"
import WhyChooseUs from "@/components/why-choose-us"
import PricingSection from "@/components/pricing-section"
import TeamMembers from "@/components/about/team-members"
import FeaturedProducts from "@/components/featured-products"
import NewsSection from "@/components/news-section"
import { 
  getSliders,
  getCategories,
  getFeaturedProducts,
  getTeamMembers,
  getLatestNews,
  getStoreInfo
} from "@/lib/queries"

export default async function Home() {
  // Fetch dữ liệu từ API
  const [
    sliders,
    categories,
    products,
    teamData,
    newsData,
    storeInfo
  ] = await Promise.all([
    getSliders(),
    getCategories(),
    getFeaturedProducts(),
    getTeamMembers(),
    getLatestNews(),
    getStoreInfo()
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
    isActive: true
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

<SpecialServices />

      <YouTubeSection videoId={storeInfo.youtubeVideoId} />
      <CategoryGrid categories={categories} />
      <FeaturedProducts initialProducts={formattedProducts} />
      <NewsSection initialNews={formattedNews} />
      <StatsCounter />
      <TrustedPartners />
      <TeamMembers teamMembers={formattedTeam} />
      <PricingSection />

    </main>
  )
}
