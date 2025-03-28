import Link from "next/link"

interface Category {
  id: number
  name: string
  slug: string
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategoryId?: number
  baseUrl: string
}

export default function CategoryFilter({ categories, selectedCategoryId, baseUrl }: CategoryFilterProps) {
  return (
    <div className="rounded-lg bg-zinc-900 p-6">
      <h3 className="mb-4 text-lg font-semibold">Danh Mục</h3>
      <ul className="space-y-2">
        <li>
          <Link
            href={baseUrl}
            className={`block rounded px-3 py-2 transition-colors ${
              !selectedCategoryId ? "bg-red-600 text-white" : "hover:bg-zinc-800"
            }`}
          >
            Tất cả
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`${baseUrl}?category=${category.id}`}
              className={`block rounded px-3 py-2 transition-colors ${
                selectedCategoryId === category.id ? "bg-red-600 text-white" : "hover:bg-zinc-800"
              }`}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

