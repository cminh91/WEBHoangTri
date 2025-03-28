import prisma from "./prisma"
import { Product, Service } from "../types"

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
    
    return products.map((product) => ({
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

    return services.map((service): Service => ({
      ...service,
      title: service.title || '',
      price: service.price ? Number(service.price) : null,
      images: service.images.map((img) => ({
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
    
    return news.map((item) => ({
      ...item,
      images: item.images.map((img: { url: string }) => img.url),
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

// Fetch store info
export async function getStoreInfo() {
  try {
    const settings = await prisma.settings.findFirst({
      where: {
        key: 'store'
      }
    })
    
    if (settings?.value) {
      try {
        const parsedValue = JSON.parse(settings.value)
        const youtubeUrl = parsedValue.socialLinks?.youtube
        const videoId = youtubeUrl ? youtubeUrl.split('v=')[1] : ''

        return {
          name: parsedValue.storeName || 'MOTO EDIT',
          address: parsedValue.address || '123 Đường Lớn, Quận 1, TP. Hồ Chí Minh',
          phone: parsedValue.phone || '0123456789',
          email: parsedValue.email || 'info@motoedit.vn',
          workingHours: parsedValue.workingHours || '8:00 - 17:30 (Thứ 2 - Thứ 7)',
          facebookUrl: parsedValue.socialLinks?.facebook || 'https://facebook.com',
          instagramUrl: parsedValue.socialLinks?.instagram || 'https://instagram.com', 
          youtubeUrl: youtubeUrl || '',
          youtubeVideoId: videoId || '',
          logoUrl: "/logo.png"
        }
      } catch (error) {
        console.error("Error parsing store settings:", error)
      }
    }
    
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
      logoUrl: "/logo.png"
    }
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
      logoUrl: "/logo.png"
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
