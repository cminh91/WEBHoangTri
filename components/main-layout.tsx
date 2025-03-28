"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { CartProvider } from "@/components/cart/cart-provider"
import { useEffect, useState } from "react"

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith('/admin')
  const [categories, setCategories] = useState({
    products: [],
    services: [],
    news: []
  })
  const [storeInfo, setStoreInfo] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching categories and store info...')
        const [categoriesRes, storeRes] = await Promise.all([
          fetch('/api/categories', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }),
          fetch('/api/store-info', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'  
            }
          })
        ])

        if (categoriesRes.ok && storeRes.ok) {
          const categoriesData = await categoriesRes.json()
          const storeData = await storeRes.json()
          
          console.log('Categories data:', categoriesData)
          console.log('Store info:', storeData)

          setCategories({
            products: categoriesData.filter((c: any) => c.type === 'PRODUCT') || [],
            services: categoriesData.filter((c: any) => c.type === 'SERVICE') || [],
            news: categoriesData.filter((c: any) => c.type === 'NEWS') || []
          })
          setStoreInfo(storeData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    if (!isAdminPage) {
      fetchData()
    }
  }, [isAdminPage])

  useEffect(() => {
    console.log('Current categories state:', categories)
  }, [categories])

  return (
    <CartProvider>
      {!isAdminPage && categories && storeInfo && (
        <Navbar 
          categories={categories} 
          storeInfo={storeInfo}
        />
      )}
      {children}
      {!isAdminPage && <Footer />}
    </CartProvider>
  )
}