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

interface Service {
  id: string
  title: string
  description: string
  images: Array<{
    url: string
  }>
  price: number | null
  category: {
    name: string
  } | null
  createdAt: Date
  featured: boolean
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  // Fetch services from database
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services")
        if (!response.ok) {
          throw new Error("Failed to fetch services")
        }
        const data = await response.json()
        setServices(data)
      } catch (error) {
        console.error("Error fetching services: ", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách dịch vụ",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  // Filter services based on search query
  const filteredServices = services.filter(
    (service) =>
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.category?.name || "").toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Format price (handle null case)
  const formatPrice = (price: number | null) => {
    if (price === null) return "Không xác định"
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  // Handle delete service
  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!serviceToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/services/${serviceToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete service")
      }

      // Update state
      setServices(services.filter((s) => s.id !== serviceToDelete.id))

      toast({
        title: "Thành công",
        description: `Đã xóa dịch vụ "${serviceToDelete.title}"`,
      })
    } catch (error) {
      console.error("Error deleting service: ", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa dịch vụ",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setServiceToDelete(null)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">Quản Lý Dịch Vụ</h1>
        <Button asChild className="bg-red-600 hover:bg-red-700">
          <Link href="/admin/services/create">
            <Plus className="mr-2 h-4 w-4" />
            Thêm Dịch Vụ
          </Link>
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm kiếm dịch vụ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 border-zinc-700 bg-zinc-800 focus:border-red-600"
          />
        </div>
      </div>

      {/* Services table */}
      <div className="rounded-md border border-zinc-800">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-900">
              <TableHead className="w-[80px]">Ảnh</TableHead>
              <TableHead>Tên Dịch Vụ</TableHead>
              <TableHead>Danh Mục</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Nổi Bật</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-red-600" />
                  <span className="mt-2 block">Đang tải dịch vụ...</span>
                </TableCell>
              </TableRow>
            ) : filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Không tìm thấy dịch vụ nào
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((service) => (
                <TableRow key={service.id} className="border-zinc-800 hover:bg-zinc-900">
                  <TableCell>
                    <div className="relative h-12 w-16 overflow-hidden rounded-md bg-zinc-800">
                      <Image
                        src={service.images?.[0]?.url || "/placeholder.svg"}
                        alt={service.title}
                        fill
                        className="object-contain p-1"
                        sizes="(max-width: 768px) 100vw, 64px"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{service.title}</TableCell>
                  <TableCell>{service.category?.name || "Không có danh mục"}</TableCell>
                  <TableCell>{formatPrice(service.price)}</TableCell>
                  <TableCell>
                    {service.featured ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-600 text-white">
                        Nổi bật
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-700 text-zinc-300">
                        Thường
                      </span>
                    )}
                  </TableCell>
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
                          onClick={() => router.push(`/dich-vu/${service.id}`)}
                          className="hover:bg-zinc-800 focus:bg-zinc-800"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Xem</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/services/edit/${service.id}`)}
                          className="hover:bg-zinc-800 focus:bg-zinc-800"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Sửa</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(service)}
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
            <AlertDialogTitle>Xác nhận xóa dịch vụ</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Bạn có chắc chắn muốn xóa dịch vụ "{serviceToDelete?.title}"? Hành động này không thể hoàn tác.
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