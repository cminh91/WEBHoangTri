import prisma from "./prisma"
import {
  Product,
  Service,
  Slider,
  Category,
  Testimonial,
  Partner,
  TeamMember,
  ContactInfo,
  StoreInfo,
  NewsItem
} from "../types"

interface SliderResult {
  id: string
  title: string
  url: string
  link: string | null
  isActive: boolean
  order: number
}

interface CategoryResult {
  id: string
  name: string
  slug: string
  type: 'PRODUCT' | 'SERVICE' | 'NEWS'
  parentId: string | null
  description: string | null
  imageUrl: string | null
}

interface FeaturedProduct extends Omit<Product, 'images'> {
  images: Array<{url: string, alt?: string | null}>
  category: {
    name: string
    slug: string
  } | null
}

interface FeaturedService extends Service {
  images: Array<{url: string, alt: string | null}>
  category: {
    id: string
    name: string
    slug: string
  } | null
}

interface NewsResult extends Omit<NewsItem, 'images'> {
  images: Array<{url: string, alt: string | null}>
  categoryName: string | null
}

interface CategoryTree {
  products: Category[]
  services: Category[]
  news: Category[]
  all: Category[]
}

if (!prisma) {
  throw new Error("Prisma client không được khởi tạo")
}

// Fetch slider data
export async function getSliders() {
  try {
    const sliders = await prisma.slider.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        title: true,
        url: true,
        link: true,
        isActive: true,
        order: true
      },
      orderBy: {
        order: 'asc'
      },
      take: 5
    })
    return sliders
  } catch (error) {
    console.error("Failed to fetch sliders:", error)
    return []
  }
}

// Fetch categories
export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        type: "PRODUCT",
        isActive: true
      },
      orderBy: {
        name: "asc" 
      },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        parentId: true,
        description: true,
        imageUrl: true
      }
    })
    return categories
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return []
  }
}


// Fetch featured products
export async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        featured: true,
        isActive: true
      },
      include: {
        images: {
          select: {
            url: true,
            alt: true
          }
        },
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      take: 10,
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return products.map((product: Product) => ({
      ...product,
      price: product.price ? Number(product.price) : 0,
      salePrice: product.salePrice ? Number(product.salePrice) : 0,
      images: product.images.map((img: { url: string }) => img.url)
    }))
  } catch (error) {
    console.error("Failed to fetch featured products:", error)
    return []
  }
}

// Fetch all categories with hierarchy
export async function getAllCategories() {
  try {
    const allCategories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [
        { type: 'asc' },
        { name: 'asc' }
      ],
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
          include: {
            subcategories: {
              where: { isActive: true },
              orderBy: { name: 'asc' },
              include: {
                subcategories: true // Thêm include để debug
              }
            }
          }
        }
      }
    })

    // Build category tree
    const categoryMap = new Map<string, any>()
    const rootCategories: any[] = []
    
    allCategories.forEach((category: Category) => {
      const node = {
        ...category,
        children: []
      }
      categoryMap.set(category.id, node)
      
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId)
        if (parent) {
          parent.children.push(node)
        } else {
          rootCategories.push(node)
        }
      } else {
        rootCategories.push(node)
      }
    })

    // Trả về cây danh mục đã xây dựng
    return {
      products: rootCategories.filter(c => c.type === 'PRODUCT'),
      services: rootCategories.filter(c => c.type === 'SERVICE'),
      news: rootCategories.filter(c => c.type === 'NEWS'),
      all: rootCategories // Thêm trường all chứa toàn bộ cây
    }

  } catch (error) {
    console.error("Failed to fetch all categories:", error)
    return {
      products: [],
      services: [],
      news: []
    }
  }
}

// Fetch featured services
export async function getFeaturedServices() {
  try {
    const services = await prisma.service.findMany({
      where: {
        featured: true,
        isActive: true
      },
      include: {
        images: {
          select: {
            url: true,
            alt: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      take: 3,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return services.map((service: Service) => ({
      ...service,
      title: service.title || '',
      price: service.price ? Number(service.price) : null,
      images: service.images.map((img: { url: string, alt: string | null }) => ({
        url: img.url,
        alt: img.alt || null
      }))
    }))
  } catch (error) {
    console.error("Failed to fetch featured services:", error)
    return []
  }
}

// Fetch latest news
export async function getLatestNews() {
  try {
    const news = await prisma.news.findMany({
      where: {
        isActive: true
      },
      include: {
        images: {
          select: {
            url: true,
            alt: true
          }
        },
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      take: 3,
      orderBy: {
        publishDate: 'desc'
      }
    })
    
    return news.map((item: NewsItem) => ({
      ...item,
      images: item.images.map((img: { url: string, alt: string | null }) => img.url),
      categoryName: item.category?.name || null
    }))
  } catch (error) {
    console.error("Failed to fetch latest news:", error)
    return []
  }
}

// Fetch testimonials
export async function getTestimonials() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: {
        isActive: true
      },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" }
      ],
      select: {
        id: true,
        name: true,
        position: true,
        company: true,
        content: true,
        rating: true,
        image: true,
        order: true
      }
    })
    return testimonials
  } catch (error) {
    console.error("Failed to fetch testimonials:", error)
    return []
  }
}

// Fetch partners
export async function getPartners() {
  try {
    const partners = await prisma.partner.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        order: 'asc'
      },
      select: {
        id: true,
        name: true,
        logo: true,
        website: true,
        order: true
      }
    })
    return partners
  } catch (error) {
    console.error("Failed to fetch partners:", error)
    return []
  }
}

// Helper to parse social links
function parseSocialLinks(socialLinks: any) {
  if (!socialLinks) return null;
  if (typeof socialLinks === 'object') return socialLinks;
  try {
    return JSON.parse(socialLinks);
  } catch {
    return null;
  }
}

// Fetch store info
export async function getStoreInfo() {
  try {
    const storeInfo = await prisma.storeInfo.findFirst({
      select: {
        name: true,
        logo: true,
        hotline: true,
        footer: true, // Add footer field
      }
    });
    const contactInfo = await prisma.contact.findFirst();
    const socialLinks = parseSocialLinks(contactInfo?.socialLinks);

    return {
      name: storeInfo?.name || "MOTO EDIT",
      address: contactInfo?.address || "123 Đường Lớn, Quận 1, TP. Hồ Chí Minh",
      phone: storeInfo?.hotline || contactInfo?.phone || "0123456789",
      hotline: storeInfo?.hotline || contactInfo?.phone || "0123456789",
      email: contactInfo?.email || "info@motoedit.vn",
      workingHours: contactInfo?.workingHours
        ? typeof contactInfo.workingHours === 'string'
          ? contactInfo.workingHours
          : JSON.stringify(contactInfo.workingHours)
        : "8:00 - 17:30 (Thứ 2 - Thứ 7)",
      facebookUrl: socialLinks?.facebook || "https://facebook.com",
      instagramUrl: socialLinks?.instagram || "https://instagram.com",
      youtubeUrl: socialLinks?.youtube || "https://youtube.com",
      youtubeVideoId: socialLinks?.youtube
        ? socialLinks.youtube.split('v=')[1] || ""
        : "",
      logoUrl: storeInfo?.logo || "/logo.png",
      footer: storeInfo?.footer || "Moto Edit là nhà phân phối các thiết bị và phụ kiện xe máy chính hãng" // Add footer with default value
    };
  } catch (error) {
    console.error("Failed to fetch store info:", error)
    return {
      name: "MOTO EDIT",
      address: "123 Đường Lớn, Quận 1, TP. Hồ Chí Minh",
      phone: "0123456789", 
      email: "info@motoedit.vn",
      workingHours: "8:00 - 17:30 (Thứ 2 - Thứ 7)",
      facebookUrl: "https://facebook.com",
      instagramUrl: "https://instagram.com", 
      youtubeUrl: "https://youtube.com",
      youtubeVideoId: "",
      logoUrl: "/logo.png",
      footer: "Moto Edit là nhà phân phối các thiết bị và phụ kiện xe máy chính hãng" // Add default footer
    }
  }
}

// Fetch team members
export async function getTeamMembers() {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        position: true,
        bio: true,
        image: true,
        order: true,
        email: true,
        phone: true,
        socialLinks: true
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }
      ]
    })
    return teamMembers
  } catch (error) {
    console.error("Failed to fetch team members:", error)
    return []
  }
}

// Fetch contact info
export async function getContactInfo() {
  try {
    const contact = await prisma.contact.findFirst({
      select: {
        address: true,
        phone: true,
        email: true,
        workingHours: true, // Dạng JSON
        mapUrl: true,
        socialLinks: true, // Dạng JSON
        whatsapp: true,
        zalo: true,
        hotline: true,
      },
    })

    if (!contact) {
      return null // Hoặc trả về giá trị mặc định
    }

    // Xử lý dữ liệu JSON nếu cần
    let parsedWorkingHours = null
    if (typeof contact.workingHours === 'string') {
      try {
        parsedWorkingHours = JSON.parse(contact.workingHours)
      } catch (e) {
        console.error("Lỗi parse workingHours JSON:", e)
      }
    } else if (contact.workingHours) {
       parsedWorkingHours = contact.workingHours // Giả sử đã là object
    }


    let parsedSocialLinks = null
     if (typeof contact.socialLinks === 'string') {
      try {
        parsedSocialLinks = JSON.parse(contact.socialLinks)
      } catch (e) {
        console.error("Lỗi parse socialLinks JSON:", e)
      }
    } else if (contact.socialLinks) {
        parsedSocialLinks = contact.socialLinks // Giả sử đã là object
    }


    // Trả về đối tượng đã xử lý
    return {
      ...contact,
      workingHours: parsedWorkingHours,
      socialLinks: parsedSocialLinks,
      // Thêm các trường xử lý khác nếu cần, ví dụng: định dạng giờ làm việc
      workingHoursFormatted: typeof parsedWorkingHours === 'object' && parsedWorkingHours !== null
        ? Object.entries(parsedWorkingHours).map(([day, time]) => `${day}: ${time}`).join('; ')
        : typeof contact.workingHours === 'string' ? contact.workingHours : 'N/A', // Fallback nếu workingHours là string đơn giảm hoặc không parse được
      facebookUrl: parsedSocialLinks?.facebook || null,
      instagramUrl: parsedSocialLinks?.instagram || null,
      youtubeUrl: parsedSocialLinks?.youtube || null,
    }

  } catch (error) {
    console.error("Lỗi khi lấy thông tin liên hệ:", error)
    return null // Hoặc trả về giá trị mặc định
  }
}

// Add this function to fetch policies
// Fetch policies
export async function getPolicies() {
  try {
    const policies = await prisma.policy.findMany({
      where: {
        isPublished: true
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        order: true
      },
      orderBy: {
        order: 'asc'
      }
    });
    
    return policies;
  } catch (error) {
    console.error("Failed to fetch policies:", error);
    return [];
  }
}

// Fetch analytics stats
export async function getAnalyticsStats() {
  try {
    const response = await fetch('/api/analytics');
    if (!response.ok) {
      throw new Error('Failed to fetch analytics');
    }
    const data = await response.json();
    return {
      pageViews: data.summary?.pageViews || 0,
      uniqueVisitors: data.summary?.uniqueVisitors || 0
    };
  } catch (error) {
    console.error("Failed to fetch analytics stats:", error);
    return {
      pageViews: 0,
      uniqueVisitors: 0
    };
  }
}
