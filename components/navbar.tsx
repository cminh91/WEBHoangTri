"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, Phone, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CartButton } from "@/components/cart/cart-button"


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
        href={`${basePath}?category=${category.slug}`}
        className="flex items-center justify-between px-4 py-2 hover:bg-red-600 text-sm text-white transition-colors"
      >
        {category.name}
        {category.children?.length > 0 && <ChevronRight className="h-4 w-4 ml-2" />}
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

// Mobile menu item component with accordion-style dropdowns
function MobileMenuItem({ category, basePath, isOpen, toggleOpen }: 
  { category: Category, basePath: string, isOpen: boolean, toggleOpen: () => void }) {
  
  return (
    <li className="border-b border-zinc-800">
      <div className="flex items-center justify-between">
        <Link
          href={`${basePath}${category.slug ? `/${category.slug}` : ''}`}
          className="block py-3 text-white flex-grow"
        >
          {category.name}
        </Link>
        {category.children?.length > 0 && (
          <button 
            onClick={toggleOpen}
            className="p-2 text-white"
          >
            <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
      
      {category.children?.length > 0 && isOpen && (
        <ul className="pl-4 border-t border-zinc-800 bg-zinc-900/50">
          {category.children.map(child => {
            const [isChildOpen, setIsChildOpen] = useState(false);
            return (
              <MobileMenuItem
                key={child.id}
                category={child}
                basePath={basePath}
                isOpen={isChildOpen}
                toggleOpen={() => setIsChildOpen(!isChildOpen)}
              />
            );
          })}
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
  const [openCategories, setOpenCategories] = useState<{[key: string]: boolean}>({})
  const { products: productCategories, services: serviceCategories, news: newsCategories } = categories

  const toggleCategory = (categoryType: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryType]: !prev[categoryType]
    }))
  }

  return (
    <header className="fixed left-0 top-0 z-50 w-full bg-black/90 backdrop-blur-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Logo section - unchanged */}
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

        {/* Desktop navigation */}
        <nav className="hidden md:block">
          <ul className="flex items-center space-x-8">
            <li>
              <Link href="/" className="text-sm font-medium text-white hover:text-red-600 transition-colors">
                Trang Chủ
              </Link>
            </li>

            <li className="group relative">
              <Link href="/dich-vu" className="flex items-center text-sm font-medium text-white hover:text-red-600 transition-colors">
                Dịch Vụ
                {serviceCategories?.length > 0 && <ChevronDown className="ml-1 h-4 w-4" />}
              </Link>
              {serviceCategories?.length > 0 && (
                <ul className="hidden group-hover:block absolute left-0 top-full bg-black/95 py-2 shadow-lg min-w-[200px] z-50">
                  {serviceCategories.map(category => (
                    <MenuItem key={category.id} category={category} basePath="/dich-vu" />
                  ))}
                </ul>
              )}
            </li>

            <li className="group relative">
              <Link href="/san-pham" className="flex items-center text-sm font-medium text-white hover:text-red-600 transition-colors">
                Sản Phẩm
                {productCategories?.length > 0 && <ChevronDown className="ml-1 h-4 w-4" />}
              </Link>
              {productCategories?.length > 0 && (
                <ul className="hidden group-hover:block absolute left-0 top-full bg-black/95 py-2 shadow-lg min-w-[200px] z-50">
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
              <Link href="/ve-chung-toi" className="text-sm font-medium text-white hover:text-red-600 transition-colors">
                Về Chúng Tôi
              </Link>
            </li>

            <li className="group relative">
              <Link href="/tin-tuc" className="flex items-center text-sm font-medium text-white hover:text-red-600 transition-colors">
                Tin Tức
                {newsCategories?.length > 0 && <ChevronDown className="ml-1 h-4 w-4" />}
              </Link>
              {newsCategories?.length > 0 && (
                <ul className="hidden group-hover:block absolute left-0 top-full min-w-[200px] bg-black/95 py-2 shadow-lg z-50">
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

        {/* Action buttons */}
        <div className="hidden md:flex items-center gap-3">
          <CartButton />
          {storeInfo.hotline && (
            <Button className="bg-red-600 hover:bg-red-700 transition-colors">
              <Phone className="mr-2 h-4 w-4" />
              {storeInfo.hotline}
            </Button>
          )}
        </div>

        <button 
          className="text-white md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile menu - improved with categories */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 max-h-[80vh] overflow-y-auto">
          <nav className="container mx-auto px-4 py-4">
            <ul className="divide-y divide-zinc-800">
              <li className="py-3">
                <Link href="/" className="block text-white">Trang Chủ</Link>
              </li>
              
              {/* Services with dropdown */}
              <li className="py-3">
                <div className="flex items-center justify-between">
                  <Link href="/dich-vu" className="block text-white flex-grow">Dịch Vụ</Link>
                  {serviceCategories?.length > 0 && (
                    <button 
                      onClick={() => toggleCategory('services')}
                      className="p-2 text-white"
                    >
                      <ChevronDown className={`h-5 w-5 transition-transform ${openCategories.services ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
                {serviceCategories?.length > 0 && openCategories.services && (
                  <ul className="mt-2 pl-4 border-t border-zinc-800 pt-2">
                    {serviceCategories.map(category => (
                      <li key={category.id} className="py-2">
                        <Link href={`/dich-vu/${category.slug}`} className="block text-gray-300 hover:text-white">
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
              
              {/* Products with dropdown */}
              <li className="py-3">
                <div className="flex items-center justify-between">
                  <Link href="/san-pham" className="block text-white flex-grow">Sản Phẩm</Link>
                  {productCategories?.length > 0 && (
                    <button 
                      onClick={() => toggleCategory('products')}
                      className="p-2 text-white"
                    >
                      <ChevronDown className={`h-5 w-5 transition-transform ${openCategories.products ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
                // In the mobile menu section, update the category links:
                {productCategories?.length > 0 && openCategories.products && (
                  <ul className="mt-2 pl-4 border-t border-zinc-800 pt-2">
                    {productCategories.map(category => (
                      <li key={category.id} className="py-2">
                        <Link href={`/san-pham?category=${category.slug}`} className="block text-gray-300 hover:text-white">
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
              
              <li className="py-3">
                <Link href="/ve-chung-toi" className="block text-white">Về Chúng Tôi</Link>
              </li>
              
              {/* News with dropdown */}
              <li className="py-3">
                <div className="flex items-center justify-between">
                  <Link href="/tin-tuc" className="block text-white flex-grow">Tin Tức</Link>
                  {newsCategories?.length > 0 && (
                    <button 
                      onClick={() => toggleCategory('news')}
                      className="p-2 text-white"
                    >
                      <ChevronDown className={`h-5 w-5 transition-transform ${openCategories.news ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
                {newsCategories?.length > 0 && openCategories.news && (
                  <ul className="mt-2 pl-4 border-t border-zinc-800 pt-2">
                    {newsCategories.map(category => (
                      <li key={category.id} className="py-2">
                        <Link href={`/tin-tuc/${category.slug}`} className="block text-gray-300 hover:text-white">
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
              
              {/* Mobile cart and hotline */}
              <li className="py-3 flex flex-col gap-3">
                <CartButton />
                {storeInfo.hotline && (
                  <Button className="bg-red-600 hover:bg-red-700 w-full justify-center">
                    <Phone className="mr-2 h-4 w-4" />
                    {storeInfo.hotline}
                  </Button>
                )}
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}
