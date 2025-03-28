import prisma from "@/lib/db"

// Pagination helper
export async function getPaginatedData<T>(
  model: string,
  orderByField = "createdAt",
  orderDirection: "asc" | "desc" = "desc",
  itemsPerPage = 10,
  page = 1,
  where: any = {},
  include: any = {},
): Promise<{
  items: T[]
  totalItems: number
  totalPages: number
  currentPage: number
}> {
  try {
    // Dynamically access the Prisma model
    const prismaModel = prisma[model as keyof typeof prisma] as any

    if (!prismaModel) {
      throw new Error(`Model ${model} not found`)
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * itemsPerPage

    // Create orderBy object
    const orderBy: any = {}
    orderBy[orderByField] = orderDirection

    // Get total count for pagination
    const totalItems = await prismaModel.count({ where })

    // Get paginated data
    const items = await prismaModel.findMany({
      where,
      include,
      orderBy,
      skip,
      take: itemsPerPage,
    })

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    return {
      items,
      totalItems,
      totalPages,
      currentPage: page,
    }
  } catch (error) {
    console.error(`Error fetching paginated data for ${model}:`, error)
    throw error
  }
}

// Format date for display
export function formatDate(date: Date | null | undefined): string {
  if (!date) return "N/A"

  return new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Generate slug from text
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
}

// Format price in VND
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price)
}

