"use client"

"use client"

import { useState,useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CartButton } from "@/components/cart/cart-button"
import { getAllCategories } from "@/lib/queries"

interface StoreInfo {
  name: string
  logoUrl?: string
  logo?: string // For backward compatibility
  hotline?: string
  phone?: string
}

interface Category {
  id: string
  name: string
  slug: string
  type: string
  parentId: string | null
  children: Category[]
}

function MenuItem({ category, basePath }: { category: Category, basePath: string }) {
  return (
    <li className="group relative">
      <Link
        href={`${basePath}/${category.slug}`}
        className="flex items-center justify-between px-4 py-2 hover:bg-red-600 text-sm text-white"
      >
        {category.name}
        {category.children?.length > 0 && <span>›</span>}
      </Link>
      
      {category.children?.length > 0 && (
        <ul className="hidden group-hover:block absolute left-full top-0 min-w-[200px] bg-black/95 py-2 shadow-lg z-50">
          {category.children.map(child => (
            <MenuItem
              key={child.id}
              category={child}
              basePath={basePath}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

interface NavbarProps {
  storeInfo: StoreInfo
  categories: {
    products: Category[]
    services: Category[]
    news: Category[]
  }
}

export default function Navbar({ storeInfo, categories }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { products: productCategories, services: serviceCategories, news: newsCategories } = categories

  return (
    <header className="fixed left-0 top-0 z-50 w-full bg-black/90 backdrop-blur-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          {(storeInfo.logoUrl || storeInfo.logo) && (
            <div className="relative h-12 w-16">
              <Image
                src={(storeInfo.logoUrl || storeInfo.logo)!}
                alt={`${storeInfo.name} Logo`}
                width={64}
                height={48}
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          )}
          {!storeInfo.logo && (
            <span className="ml-2 text-xl font-bold text-white">{storeInfo.name || 'MOTO EDIT'}</span>
          )}
        </Link>

        <nav className="hidden md:block">
          <ul className="flex items-center space-x-8">
            <li>
              <Link href="/" className="text-sm font-medium text-white hover:text-red-600">
                Trang Chủ
              </Link>
            </li>

            <li className="group relative">
              <Link href="/dich-vu" className="flex items-center text-sm font-medium text-white hover:text-red-600">
                Dịch Vụ
              </Link>
              {serviceCategories.length > 0 && (
                <ul className="hidden group-hover:block absolute bg-black/95 py-2 shadow-lg min-w-[200px]">
                  {serviceCategories.map(category => (
                    <MenuItem key={category.id} category={category} basePath="/dich-vu" />
                  ))}
                </ul>
              )}
            </li>

            <li className="group relative">
              <Link href="/san-pham" className="flex items-center text-sm font-medium text-white hover:text-red-600">
                Sản Phẩm
                {productCategories?.length > 0 && <span className="ml-1">›</span>}
              </Link>
              {productCategories?.length > 0 && (
                <ul className="hidden group-hover:block absolute left-0 bg-black/95 py-2 shadow-lg min-w-[200px] z-50">
                  {productCategories.map(category => (
                    <MenuItem
                      key={category.id}
                      category={category}
                      basePath="/san-pham"
                    />
                  ))}
                </ul>
              )}
            </li>

            <li>
              <Link href="/ve-chung-toi" className="text-sm font-medium text-white hover:text-red-600">
                Về Chúng Tôi
              </Link>
            </li>

            <li className="group/item relative">
              <Link href="/tin-tuc" className="flex items-center text-sm font-medium text-white hover:text-red-600">
                Tin Tức
                {newsCategories.length > 0 && <span className="ml-1">›</span>}
              </Link>
              {newsCategories.length > 0 && (
                <ul className="hidden group-hover/item:block absolute left-0 top-full min-w-[200px] bg-black/95 py-2 shadow-lg z-50">
                  {newsCategories.map(category => (
                    <MenuItem
                      key={category.id}
                      category={category}
                      basePath="/tin-tuc"
                    />
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <CartButton />
          {storeInfo.hotline && (
            <Button className="bg-red-600 hover:bg-red-700">
              <Phone className="mr-2 h-4 w-4" />
              {storeInfo.hotline}
            </Button>
          )}
        </div>

        <button 
          className="text-white md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-black/95">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-2">
              <li><Link href="/" className="block py-2 text-white">Trang Chủ</Link></li>
              <li><Link href="/dich-vu" className="block py-2 text-white">Dịch Vụ</Link></li>
              <li><Link href="/san-pham" className="block py-2 text-white">Sản Phẩm</Link></li>
              <li><Link href="/ve-chung-toi" className="block py-2 text-white">Về Chúng Tôi</Link></li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}
