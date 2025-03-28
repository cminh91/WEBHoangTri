"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CartButton } from "@/components/cart/cart-button"
import { useState } from "react"

// Hàm để xây dựng cây danh mục
function buildCategoryTree(categories: Category[]) {
  const categoryMap = new Map<string, Category & { children: Category[] }>();

  // Tạo map với children rỗng
  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, children: [] });
  });

  // Tổ chức thành cấu trúc cây
  const rootCategories: (Category & { children: Category[] })[] = [];
  categories.forEach(category => {
    const node = categoryMap.get(category.id);
    if (node) {
      if (category.parentId && categoryMap.has(category.parentId)) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        rootCategories.push(node);
      }
    }
  });

  return rootCategories;
}

// Recursive component for nested menu items
function NestedMenuItem({ category, basePath }: { category: Category & { children: Category[] }, basePath: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <li className="group/item relative">
      <div className="flex items-center justify-between px-4 py-2 hover:bg-red-600">
        <Link
          href={`${basePath}/${category.slug}`}
          className="flex-1 text-sm text-white"
        >
          {category.name}
        </Link>
        {category.children?.length > 0 && (
          <span 
            className="ml-2 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
          >
            ›
          </span>
        )}
      </div>
      {category.children?.length > 0 && (
        <div className={`
          ${isOpen ? 'block' : 'hidden'} 
          md:hidden md:group-hover/item:block 
          md:absolute md:left-full md:top-0 
          pl-4 md:pl-2 
          md:min-w-[200px]
        `}>
          <ul className="rounded-lg bg-black/95 py-2 shadow-lg">
            {category.children.map((child) => (
              <NestedMenuItem 
                key={child.id} 
                category={{ ...child, children: child.children || [] }} 
                basePath={basePath}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  )
}

// Mobile menu component
function MobileMenu({ 
  isOpen, 
  categories, 
  storeInfo, 
  onClose 
}: { 
  isOpen: boolean
  categories: NavbarProps["categories"]
  storeInfo: StoreInfo | null
  onClose: () => void
}) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  return isOpen ? (
    <div className="absolute left-0 top-20 z-50 w-full bg-black/95 shadow-lg md:hidden">
      <nav className="container mx-auto px-4 py-4">
        <ul className="space-y-2">
          <li>
            <Link 
              href="/" 
              className="block py-2 text-white hover:text-red-600"
              onClick={onClose}
            >
              Trang Chủ
            </Link>
          </li>
          
          {/* Services */}
          <li>
            <div 
              className="flex items-center justify-between py-2 text-white"
              onClick={() => setActiveMenu(activeMenu === 'services' ? null : 'services')}
            >
              <span>Dịch Vụ</span>
              <span>{activeMenu === 'services' ? '−' : '+'}</span>
            </div>
            {activeMenu === 'services' && categories.services.length > 0 && (
              <ul className="ml-4 space-y-2 border-l border-zinc-800 pl-4">
                {categories.services.map(category => (
                  <NestedMenuItem 
                    key={category.id} 
                    category={{ ...category, children: category.children || [] }}
                    basePath="/dich-vu"
                  />
                ))}
              </ul>
            )}
          </li>

          {/* Products */}
          <li>
            <div 
              className="flex items-center justify-between py-2 text-white"
              onClick={() => setActiveMenu(activeMenu === 'products' ? null : 'products')}
            >
              <span>Sản Phẩm</span>
              <span>{activeMenu === 'products' ? '−' : '+'}</span>
            </div>
            {activeMenu === 'products' && categories.products.length > 0 && (
              <ul className="ml-4 space-y-2 border-l border-zinc-800 pl-4">
                {categories.products.map(category => (
                  <NestedMenuItem 
                    key={category.id} 
                    category={{ ...category, children: category.children || [] }}
                    basePath="/san-pham"
                  />
                ))}
              </ul>
            )}
          </li>

          {/* News */}
          <li>
            <div 
              className="flex items-center justify-between py-2 text-white"
              onClick={() => setActiveMenu(activeMenu === 'news' ? null : 'news')}
            >
              <span>Tin Tức</span>
              <span>{activeMenu === 'news' ? '−' : '+'}</span>
            </div>
            {activeMenu === 'news' && categories.news.length > 0 && (
              <ul className="ml-4 space-y-2 border-l border-zinc-800 pl-4">
                {categories.news.map(category => (
                  <NestedMenuItem 
                    key={category.id} 
                    category={{ ...category, children: category.children || [] }}
                    basePath="/tin-tuc"
                  />
                ))}
              </ul>
            )}
          </li>

          <li>
            <Link 
              href="/ve-chung-toi" 
              className="block py-2 text-white hover:text-red-600"
              onClick={onClose}
            >
              Về Chúng Tôi
            </Link>
          </li>
          
          <li>
            <Link 
              href="/lien-he" 
              className="block py-2 text-white hover:text-red-600"
              onClick={onClose}
            >
              Liên Hệ
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  ) : null
}

interface StoreInfo {
  name: string
  logo: string | null
  hotline: string
  address?: string
  phone?: string
  email?: string
  workingHours?: string | { 
    monday?: string
    tuesday?: string
    wednesday?: string
    thursday?: string
    friday?: string
    saturday?: string
    sunday?: string
  }
  workingHoursFormatted?: string
}

interface Category {
  id: string
  name: string
  slug: string
  type: string
  parentId: string | null
  children?: Category[]
}

interface NavbarProps {
  storeInfo: StoreInfo | null
  categories: {
    products: Category[]
    services: Category[]
    news: Category[]
  }
}

export default function Navbar({ 
  categories = {
    products: [],
    services: [], 
    news: []
  },
  storeInfo 
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Safe access with nullish coalescing
  const productCategories = buildCategoryTree(categories?.products ?? [])
  const serviceCategories = buildCategoryTree(categories?.services ?? [])
  const newsCategories = buildCategoryTree(categories?.news ?? [])

  return (
    <header className="fixed left-0 top-0 z-50 w-full bg-black/90 backdrop-blur-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            <Image 
              src={storeInfo?.logo || "/placeholder.svg?height=40&width=40"} 
              alt={`${storeInfo?.name || 'Hoàng Trí'} Logo`} 
              width={40} 
              height={40} 
              priority
              loading="eager"
            />
          </div>
          <span className="ml-2 text-xl font-bold">{storeInfo?.name || "Hoàng Trí"}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex items-center space-x-8">
            <li>
              <Link href="/" className="text-sm font-medium text-white hover:text-red-600">
                Trang Chủ
              </Link>
            </li>

            {/* Services Dropdown */}
            <li className="group relative">
              <Link href="/dich-vu" className="flex items-center text-sm font-medium text-white hover:text-red-600">
                Dịch Vụ
              </Link>
              {serviceCategories.length > 0 && (
                <div className="invisible absolute left-0 top-full min-w-[200px] pt-4 group-hover:visible">
                  <ul className="rounded-lg bg-black/95 py-2 shadow-lg">
                    {serviceCategories.map((category) => (
                      <NestedMenuItem 
                        key={category.id} 
                        category={{ ...category, children: category.children || [] }}
                        basePath="/dich-vu"
                      />
                    ))}
                  </ul>
                </div>
              )}
            </li>

            {/* Products Dropdown */}
            <li className="group relative">
              <Link href="/san-pham" className="flex items-center text-sm font-medium text-white hover:text-red-600">
                Sản Phẩm
              </Link>
              {productCategories.length > 0 && (
                <div className="invisible absolute left-0 top-full min-w-[200px] pt-4 group-hover:visible">
                  <ul className="rounded-lg bg-black/95 py-2 shadow-lg">
                    {productCategories.map((category) => (
                      <NestedMenuItem 
                        key={category.id} 
                        category={{ ...category, children: category.children || [] }}
                        basePath="/san-pham"
                      />
                    ))}
                  </ul>
                </div>
              )}
            </li>

            {/* News Dropdown */}
            <li className="group relative">
              <Link href="/tin-tuc" className="flex items-center text-sm font-medium text-white hover:text-red-600">
                Tin Tức
              </Link>
              {newsCategories.length > 0 && (
                <div className="invisible absolute left-0 top-full min-w-[200px] pt-4 group-hover:visible">
                  <ul className="rounded-lg bg-black/95 py-2 shadow-lg">
                    {newsCategories.map((category) => (
                      <NestedMenuItem 
                        key={category.id} 
                        category={{ ...category, children: category.children || [] }}
                        basePath="/tin-tuc"
                      />
                    ))}
                  </ul>
                </div>
              )}
            </li>

            <li>
              <Link href="/ve-chung-toi" className="text-sm font-medium text-white hover:text-red-600">
                Về Chúng Tôi
              </Link>
            </li>
            
            <li>
              <Link href="/lien-he" className="text-sm font-medium text-white hover:text-red-600">
                Liên Hệ
              </Link>
            </li>
          </ul>
        </nav>

        {/* Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <CartButton />
          <Button className="flex items-center bg-red-600 hover:bg-red-700">
            <Phone className="mr-2 h-4 w-4" />
            <span>{storeInfo?.hotline || "0905.678.910"}</span>
          </Button>
        </div>

        {/* Mobile menu button */}
        <button 
          className="text-white md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMenuOpen}
        categories={categories}
        storeInfo={storeInfo}
        onClose={() => setIsMenuOpen(false)}
      />
    </header>
  )
}