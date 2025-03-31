"use client"

import { useRouter } from "next/navigation"

interface SortSelectProps {
  currentSort?: string
}

export function SortSelect({ currentSort }: SortSelectProps) {
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    const url = new URL(window.location.href)
    
    if (value) {
      url.searchParams.set('sort', value)
    } else {
      url.searchParams.delete('sort')
    }
    
    router.push(url.pathname + url.search)
  }

  return (
    <select
      className="rounded-md bg-zinc-800 px-4 py-2 text-white border border-zinc-700 hover:border-zinc-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
      defaultValue={currentSort || ""}
      onChange={handleChange}
    >
      <option value="">Sắp xếp</option>
      <option value="price-asc">Giá tăng dần</option>
      <option value="price-desc">Giá giảm dần</option>
    </select>
  )
}