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
  footer?: string  // Add footer field
  logoUrl?: string // Add logoUrl field
}

interface ClientMainLayoutProps {
  children: React.ReactNode
  contactInfo?: ContactInfo | null
  categories?: {
    products: Category[]
    services: Category[]
    news: Category[]
  } | null
  storeInfo?: StoreInfo | null
}

export default function ClientMainLayout({ 
  children,
  contactInfo,
  categories,
  storeInfo
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
      {!isAdminPage && <Footer storeInfo={storeInfo} contactInfo={contactInfo ?? undefined} />}
    </CartProvider>
  )
}