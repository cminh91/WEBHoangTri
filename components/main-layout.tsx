"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { CartProvider } from "@/components/cart/cart-provider"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')
  const DEFAULT_CATEGORIES = {
    products: [],
    services: [],
    news: []
  }
  
  const DEFAULT_STORE_INFO = {
    name: "MOTO EDIT",
    logo: "/logo.png",
    hotline: "1900 1234"
  }

  return (
    <CartProvider>
      {!isAdminPage && (
        <Navbar 
          categories={DEFAULT_CATEGORIES}
          storeInfo={DEFAULT_STORE_INFO}
        />
      )}
      {children}
      {!isAdminPage && <Footer />}
    </CartProvider>
  )
}