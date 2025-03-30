// Product types with optional fields
export interface StoreInfo {
  id: string
  name: string
  address?: string
  phone: string
  email?: string
  workingHours?: string
  workingHoursFormatted?: string
  facebookUrl?: string | null
  instagramUrl?: string | null
  youtubeUrl?: string | null
  youtubeVideoId?: string | null
  logo?: string | null
  logoUrl?: string | null
  favicon?: string | null
  hotline?: string
  footer?: string | null
  createdAt?: Date
  updatedAt?: Date
}
import type { Decimal } from "@prisma/client/runtime/library"
import type { JsonValue } from "@prisma/client/runtime/library"

export interface Product {
  id: string
  name: string
  slug: string
  price: number | Decimal
  salePrice: number | Decimal | null
  featured: boolean
  inStock: boolean
  images: Array<{ url: string, alt?: string | null }>
  category?: {
    name: string
    slug: string
  } | null
  description?: string | null
  isActive?: boolean
  specs?: Record<string, any> | null
}

// News types with optional fields  
export interface NewsItem {
  id: string
  title: string
  content: string
  publishDate: Date
  images: Array<{url: string, alt: string | null}>
  category?: {
    name: string
    slug: string
  } | null
  slug?: string
  excerpt?: string | null
  author?: string | null
  isActive?: boolean
  published?: boolean
  categoryId?: string | null
  categoryName?: string | null
  [key: string]: any
}

// Service types with optional fields
export interface Service {
  id: string
  title: string
  images: Array<{url: string, alt: string | null}>
  price: number | null
  description: string | null
  category: {
    id: string
    name: string
    slug: string
  } | null
  name?: string
  slug?: string
  isActive?: boolean
  [key: string]: any
}
export interface Slider {
  id: string
  title: string
  subtitle: string | null
  url: string
  link: string | null
  isActive: boolean
  order: number
  buttonText: string | null
  mobileUrl: string | null
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  type: 'PRODUCT' | 'SERVICE' | 'NEWS'
  parentId: string | null
  children?: Category[]
  subcategories?: Category[]
  description?: string | null
  imageUrl?: string | null
  isActive?: boolean
}

export interface Testimonial {
  id: string
  name: string
  position: string
  company?: string | null
  content: string
  rating: number
  image?: string | null
  order: number
  isActive?: boolean
}

export interface Partner {
  id: string
  name: string
  logo: string
  website?: string | null
  order: number
  isActive?: boolean
}

export interface TeamMember {
  id: string
  name: string
  position: string
  bio?: string | null
  image?: string | null
  order: number
  email?: string | null
  phone?: string | null
  socialLinks?: Record<string, string> | null
  isActive?: boolean
}
export interface ContactInfo {
  id?: string
  address?: string
  phone?: string
  email?: string
  workingHours?: string | Record<string, string>
  workingHoursFormatted?: string
  mapUrl?: string
  facebookUrl?: string
  instagramUrl?: string
  youtubeUrl?: string
  whatsapp?: string
  zalo?: string
  hotline?: string
}