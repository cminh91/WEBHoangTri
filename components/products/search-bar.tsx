"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"

export function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (!searchParams) return null

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    
    if (newSearch) {
      params.set('search', newSearch)
    } else {
      params.delete('search')
    }
    
    router.push(`/san-pham?${params.toString()}`)
  }

  return (
    <Input
      type="text"
      placeholder="Tìm kiếm sản phẩm..."
      className="w-full md:w-64"
      onChange={handleSearch}
      defaultValue={searchParams.get('search') || ''}
    />
  )
}