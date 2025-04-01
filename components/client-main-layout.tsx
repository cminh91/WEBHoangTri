"use client"

import { usePathname } from "next/navigation"
import { CartProvider } from "@/components/cart/cart-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

import type { Category } from '@/types'

interface ContactInfo {
  address?: string
  phone?: string
  email?: string
  workingHours?: string
  facebookUrl?: string
  instagramUrl?: string
  youtubeUrl?: string
}

interface StoreInfo {
  name: string
  logo?: string
  hotline?: string
  footer?: string
  logoUrl?: string
}

// Update the policies interface to match your actual model
interface ClientMainLayoutProps {
  children: React.ReactNode
  contactInfo?: ContactInfo | null
  categories?: {
    products: Category[]
    services: Category[]
    news: Category[]
  } | null
  storeInfo?: StoreInfo | null
  policies?: Array<{
    id: string
    title: string
    slug: string
    excerpt?: string | null
    order?: number
  }> | null
}

export default function ClientMainLayout({ 
  children,
  contactInfo,
  categories,
  storeInfo,
  policies
}: ClientMainLayoutProps) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')

  return (
    <CartProvider>
      {!isAdminPage && (
        <Navbar 
          categories={categories || {
            products: [],
            services: [],
            news: []
          }} 
          storeInfo={storeInfo || {
            name: '',
            logo: '',
            hotline: '',
            footer: '',
            logoUrl: ''
          }} 
        />
      )}
      {children}
      {!isAdminPage && <Footer contactInfo={contactInfo ?? undefined} storeInfo={storeInfo} policies={policies} />}
    </CartProvider>
  )
}