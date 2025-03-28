"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Plus, Search, MoreVertical, Edit, Trash, Eye, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Product {
  id: string
  name: string
  description: string
  images: Array<{
    url: string
  }>
  price: number
  salePrice: number
  category: {
    name: string
  } | null
  createdAt: Date
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products")
        if (!response.ok) {
          throw new Error("Failed to fetch products")
        }
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error("Error fetching products: ", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách sản phẩm",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Filter products based on search query
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category?.name || "").toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  // Handle delete product
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!productToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      // Update state
      setProducts(products.filter((p) => p.id !== productToDelete.id))

      toast({
        title: "Thành công",
        description: `Đã xóa sản phẩm "${productToDelete.name}"`,
      })
    } catch (error) {
      console.error("Error deleting product: ", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa sản phẩm",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">Quản Lý Sản Phẩm</h1>
        <Button asChild className="bg-red-600 hover:bg-red-700">
          <Link href="/admin/products/create">
            <Plus className="mr-2 h-4 w-4" />
            Thêm Sản Phẩm
          </Link>
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 border-zinc-700 bg-zinc-800 focus:border-red-600"
          />
        </div>
      </div>

      {/* Products table */}
      <div className="rounded-md border border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-900">
              <TableHead className="w-[80px]">Ảnh</TableHead>
              <TableHead>Tên Sản Phẩm</TableHead>
              <TableHead>Danh Mục</TableHead>
              <TableHead>Giá Gốc</TableHead>
              <TableHead>Giá Bán</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-red-600" />
                  <span className="mt-2 block">Đang tải sản phẩm...</span>
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Không tìm thấy sản phẩm nào
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className="border-zinc-800 hover:bg-zinc-900">
                  <TableCell>
                    <div className="relative h-10 w-10 overflow-hidden rounded-md">
                      <Image
                        src={product.images?.[0]?.url || "/placeholder.svg?height=40&width=40"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category?.name || "Không có danh mục"}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>{formatPrice(product.salePrice)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Mở menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 text-white">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem
                          onClick={() => router.push(`/san-pham/${product.id}`)}
                          className="hover:bg-zinc-800 focus:bg-zinc-800"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Xem</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                          className="hover:bg-zinc-800 focus:bg-zinc-800"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Sửa</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(product)}
                          className="text-red-500 hover:bg-zinc-800 focus:bg-zinc-800"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Xóa</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-zinc-800 bg-zinc-950 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa sản phẩm</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Bạn có chắc chắn muốn xóa sản phẩm "{productToDelete?.name}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 bg-zinc-800 text-white hover:bg-zinc-700 hover:text-white">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700" disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

