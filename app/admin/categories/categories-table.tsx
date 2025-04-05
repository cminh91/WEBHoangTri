"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Search, Edit, Trash2, Plus, Star } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { CategoryDialog } from "@/app/admin/categories/category-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  type: "PRODUCT" | "SERVICE" | "NEWS"
  parentId: string | null
  parent: Category | null
  subcategories: { id: string; name: string }[]
  _count: {
    products: number
    services: number
    news: number
  }
  icon: string | null
  imageUrl: string | null
  isActive: boolean
}

export function CategoriesTable() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [selectedType])

  const fetchCategories = async () => {
    try {
      const url = selectedType !== "all" ? `/api/categories?type=${selectedType}` : "/api/categories"

      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch categories")
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách danh mục",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteCategoryId) return

    try {
      const response = await fetch(`/api/categories/${deleteCategoryId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete category")
      }

      setCategories(categories.filter((category) => category.id !== deleteCategoryId))
      toast({
        title: "Thành công",
        description: "Đã xóa danh mục",
      })
    } catch (error: any) {
      console.error("Error deleting category:", error)
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa danh mục",
        variant: "destructive",
      })
    } finally {
      setDeleteCategoryId(null)
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "PRODUCT":
        return "Sản phẩm"
      case "SERVICE":
        return "Dịch vụ"
      case "NEWS":
        return "Tin tức"
      default:
        return type
    }
  }

  const getItemCount = (category: Category) => {
    switch (category.type) {
      case "PRODUCT":
        return category._count.products
      case "SERVICE":
        return category._count.services
      case "NEWS":
        return category._count.news
      default:
        return 0
    }
  }

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description || "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-4 px-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Loại danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="PRODUCT">Sản phẩm</SelectItem>
            <SelectItem value="SERVICE">Dịch vụ</SelectItem>
            <SelectItem value="NEWS">Tin tức</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên danh mục</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Danh mục cha</TableHead>
              <TableHead>Số lượng</TableHead>
              <TableHead>Danh mục con</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[30px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[50px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[30px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Không tìm thấy danh mục nào
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTypeLabel(category.type)}</Badge>
                  </TableCell>
                  <TableCell>
                    {category.icon ? (
                      <div className="relative h-8 w-8 rounded-md overflow-hidden">
                        <Image
                          src={category.icon}
                          alt={`Icon for ${category.name}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {/* Removed featured badge */}
                    —
                  </TableCell>
                  <TableCell>{category.parent ? category.parent.name : "—"}</TableCell>
                  <TableCell>{getItemCount(category)}</TableCell>
                  <TableCell>
                    {category.subcategories && category.subcategories.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {category.subcategories.map((sub) => (
                          <Badge key={sub.id} variant="secondary" className="mr-1">
                            {sub.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <CategoryDialog category={category}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                        Sửa
                      </Button>
                    </CategoryDialog>
                    <CategoryDialog parentCategory={category} defaultType={category.type}>
                      <Button variant="ghost" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm
                      </Button>
                    </CategoryDialog>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteCategoryId(category.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <CategoryDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm danh mục
          </Button>
        </CategoryDialog>
      </div>

      <AlertDialog open={!!deleteCategoryId} onOpenChange={(open) => !open && setDeleteCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa danh mục này?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Mọi danh mục con và liên kết với danh mục này sẽ bị hủy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

