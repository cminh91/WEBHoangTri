export interface StoreInfo {
  name: string
  logo: string | null
  hotline: string
  address?: string
  phone?: string
  email?: string
  workingHours?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  type: 'PRODUCT' | 'SERVICE' | 'NEWS'
  parentId: string | null
  description?: string | null
  imageUrl?: string | null
  children?: Category[]
}

export interface NavbarProps {
  storeInfo: StoreInfo | null
  categories: {
    products: Category[]
    services: Category[] 
    news: Category[]
  }
}