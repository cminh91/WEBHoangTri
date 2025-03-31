"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

interface Category {
  name: string
  slug: string
}

interface ServiceCategoryFilterProps {
  categories: Category[]
}

export function ServiceCategoryFilter({ categories }: ServiceCategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentCategory = searchParams?.get("category") || ""

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    
    if (slug) {
      params.set("category", slug)
    } else {
      params.delete("category")
    }
    
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={!currentCategory ? "default" : "outline"}
        className={!currentCategory 
          ? "bg-red-600 hover:bg-red-700 text-white" 
          : "border-zinc-700 hover:border-zinc-600 text-white hover:bg-zinc-800"}
        onClick={() => handleCategoryChange("")}
      >
        Tất cả
      </Button>
      
      {categories.map((category) => (
        <Button
          key={category.slug}
          variant={currentCategory === category.slug ? "default" : "outline"}
          className={currentCategory === category.slug 
            ? "bg-red-600 hover:bg-red-700 text-white" 
            : "border-zinc-700 hover:border-zinc-600 text-white hover:bg-zinc-800"}
          onClick={() => handleCategoryChange(category.slug)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  )
}