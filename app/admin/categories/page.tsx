import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CategoriesTable } from "@/app/admin/categories/categories-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CategoryDialog } from "@/app/admin/categories/category-dialog"

export const metadata: Metadata = {
  title: "Quản lý Danh mục - Hoàng Trí Moto Admin",
  description: "Quản lý danh mục sản phẩm, dịch vụ và tin tức",
}

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/admin/login")
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Quản lý Danh mục</h2>
        <CategoryDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm danh mục
          </Button>
        </CategoryDialog>
      </div>
      <div className="space-y-6">
        <CategoriesTable />
      </div>
    </div>
  )
}

