export interface BaseCategory {
  id: string
  name: string
  slug: string
}

export interface Category extends BaseCategory {
  children?: Category[]
}

export interface NavbarCategories {
  products: Category[]
  services: Category[]
  news: Category[]
}

export interface NavbarProps {
  storeInfo?: {
    name: string
    logo?: string
    hotline?: string
  }
  categories: NavbarCategories
}

export function hasChildren(category: Category): category is Category & { children: Category[] } {
  return !!(category.children && category.children.length > 0)
}