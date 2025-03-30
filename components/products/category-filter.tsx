"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Category {
  name: string
  slug: string
}

export function CategoryFilter({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (!searchParams) return null

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === 'all') {
      params.delete('category')
    } else {
      params.set('category', value)
    }
    
    router.push(`/san-pham?${params.toString()}`)
  }

  return (
    <Select defaultValue={searchParams.get('category') || 'all'} onValueChange={handleChange}>
      <SelectTrigger className="w-full md:w-64">
        <SelectValue placeholder="Tất cả danh mục" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tất cả</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.slug} value={category.slug}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}